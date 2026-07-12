import { NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { getSupabaseServer } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { orderNumber } from '@/lib/format'
import { sendOrderConfirmation, sendStatusUpdate, sendLowStockAlert } from '@/lib/email'
import { authSchema, checkoutSchema, productSchema, reviewSchema, adminReviewSchema } from '@/lib/validators'

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-razorpay-signature')
  return res
}
function json(data, status = 200) { return cors(NextResponse.json(data, { status })) }
export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

async function requireUser() {
  const sb = await getSupabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  return user
}
async function requireAdmin() {
  const sb = await getSupabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { user: null, admin: null }
  const { data: prof } = await sb.from('profiles').select('role,email').eq('id', user.id).single()
  if (prof?.role !== 'admin') return { user, admin: null }
  return { user, admin: { ...user, email: prof.email } }
}

async function audit(admin, action, entity, entity_id, changes) {
  try {
    const admin_db = getSupabaseAdmin()
    await admin_db.from('admin_audit_log').insert({ admin_id: admin?.id, admin_email: admin?.email, action, entity, entity_id: entity_id?.toString(), changes })
  } catch (e) { console.error('audit failed', e) }
}

function escHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])) }

async function getRazorpay() {
  const admin = getSupabaseAdmin()
  const { data } = await admin.from('settings').select('value').eq('key','payment_razorpay').single()
  const key_id = data?.value?.key_id || process.env.RAZORPAY_KEY_ID
  const key_secret = data?.value?.key_secret || process.env.RAZORPAY_KEY_SECRET
  const webhook_secret = data?.value?.webhook_secret || process.env.RAZORPAY_WEBHOOK_SECRET
  return { key_id, key_secret, webhook_secret, client: (key_id && key_secret) ? new Razorpay({ key_id, key_secret }) : null }
}

async function handler(request, { params }) {
  const { path = [] } = await params
  const route = '/' + path.join('/')
  const method = request.method
  try {
    // ------------- HEALTH -------------
    if (route === '/health' && method === 'GET') return json({ ok: true, ts: Date.now() })

    // ------------- COD CONFIG (public) -------------
    if (route === '/cod-config' && method === 'GET') {
      try {
        const admin = getSupabaseAdmin()
        if (!admin) return json({ config: { enabled: true, fee: 0, min_order: 0, max_order: 0 } })
        const { data } = await admin.from('settings').select('value').eq('key','cod').single()
        const v = data?.value && typeof data.value === 'object' ? data.value : {}
        return json({ config: {
          enabled: v.enabled !== false,
          fee: Number(v.fee || 0),
          min_order: Number(v.min_order || 0),
          max_order: Number(v.max_order || 0),
        } })
      } catch { return json({ config: { enabled: true, fee: 0, min_order: 0, max_order: 0 } }) }
    }

    // ------------- BRAND (public safe subset) -------------
    if (route === '/brand' && method === 'GET') {
      try {
        const admin = getSupabaseAdmin()
        const { data } = await admin.from('settings').select('key,value').in('key', ['brand','seo','analytics'])
        const map = Object.fromEntries((data||[]).map(x => [x.key, x.value]))
        return json({ brand: map.brand || {}, seo: map.seo || {}, analytics: map.analytics || {} })
      } catch { return json({ brand: {}, seo: {}, analytics: {} }) }
    }

    // ------------- SITEMAP + ROBOTS -------------
    if (route === '/sitemap' && method === 'GET') {
      const admin = getSupabaseAdmin()
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://alankarfashions.com'
      const { data: products } = await admin.from('products').select('slug,updated_at').eq('status','published').limit(5000)
      const { data: cats } = await admin.from('categories').select('slug').limit(500)
      const urls = [
        `<url><loc>${base}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
        `<url><loc>${base}/products</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
        `<url><loc>${base}/contact</loc></url>`,
        `<url><loc>${base}/faq</loc></url>`,
        ...(cats||[]).map(c => `<url><loc>${base}/products?category=${c.slug}</loc><priority>0.8</priority></url>`),
        ...(products||[]).map(p => `<url><loc>${base}/products/${p.slug}</loc><lastmod>${new Date(p.updated_at||Date.now()).toISOString().split('T')[0]}</lastmod><priority>0.7</priority></url>`),
      ].join('')
      const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
      return new NextResponse(xml, { headers: { 'content-type': 'application/xml' } })
    }
    if (route === '/robots' && method === 'GET') {
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://alankarfashions.com'
      const txt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: ${base}/sitemap.xml\n`
      return new NextResponse(txt, { headers: { 'content-type': 'text/plain' } })
    }

    // ------------- INVOICE (HTML print-friendly) -------------
    if (route.startsWith('/invoice/') && method === 'GET') {
      const id = path[1]
      const admin = getSupabaseAdmin()
      const { data: order } = await admin.from('orders').select('*').eq('id', id).single()
      if (!order) return json({ error: 'Not found' }, 404)
      const user = await requireUser()
      const { admin: adm } = await requireAdmin()
      if (order.user_id && (!user || user.id !== order.user_id) && !adm) return json({ error: 'Forbidden' }, 403)
      const { data: brandS } = await admin.from('settings').select('value').eq('key','brand').single()
      const b = brandS?.value || {}
      const rows = (order.items||[]).map((i,idx) => `<tr><td>${idx+1}</td><td>${escHtml(i.name)}<div style="font-size:11px;color:#666">${[i.size,i.color].filter(Boolean).join(' · ')}</div></td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">₹${Number(i.price).toLocaleString('en-IN')}</td><td style="text-align:right">₹${Number(i.subtotal).toLocaleString('en-IN')}</td></tr>`).join('')
      const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Invoice ${order.order_number}</title><style>body{font-family:-apple-system,'Segoe UI',sans-serif;color:#1c1917;padding:32px;max-width:900px;margin:0 auto}h1{font-family:Georgia,serif;color:#3B1F1A;margin:0}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border-bottom:1px solid #eee;padding:10px;font-size:13px;text-align:left}th{background:#faf7f2;text-transform:uppercase;font-size:11px;letter-spacing:1px}.row{display:flex;justify-content:space-between;gap:20px;margin-bottom:20px}.box{padding:14px;background:#faf7f2;border-radius:6px;font-size:13px;line-height:1.6}.total{font-size:16px;font-weight:700;color:#3B1F1A}@media print{body{padding:0}}</style></head><body><div class="row"><div><h1>${escHtml(b.name||'Alankar Fashions')}</h1><div style="color:#666;font-size:13px;margin-top:4px">${escHtml(b.address||'')}</div>${b.support_phone?`<div style="color:#666;font-size:13px">${escHtml(b.support_phone)}</div>`:''}${b.gstin?`<div style="color:#666;font-size:13px">GSTIN: ${escHtml(b.gstin)}</div>`:''}</div><div style="text-align:right"><div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:2px">Tax Invoice</div><h2 style="margin:6px 0">${escHtml(order.order_number)}</h2><div style="font-size:12px;color:#666">${new Date(order.created_at).toLocaleDateString('en-IN')}</div></div></div><div class="row"><div class="box" style="flex:1"><strong>Bill To</strong><div>${escHtml(order.shipping_address?.name||'')}</div><div>${escHtml(order.shipping_address?.line1||'')}${order.shipping_address?.line2?', '+escHtml(order.shipping_address.line2):''}</div><div>${escHtml(order.shipping_address?.city||'')}, ${escHtml(order.shipping_address?.state||'')} ${escHtml(order.shipping_address?.pincode||'')}</div><div>${escHtml(order.phone||'')} · ${escHtml(order.email||'')}</div></div><div class="box" style="flex:1"><strong>Payment</strong><div>Status: ${order.payment_status.toUpperCase()}</div>${order.razorpay_payment_id?`<div>Ref: ${escHtml(order.razorpay_payment_id)}</div>`:''}<div>Method: Razorpay</div></div></div><table><thead><tr><th>#</th><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table><div style="margin-top:16px;text-align:right;font-size:13px;line-height:2"><div>Subtotal: ₹${Number(order.subtotal).toLocaleString('en-IN')}</div>${order.discount>0?`<div>Discount: −₹${Number(order.discount).toLocaleString('en-IN')}</div>`:''}<div>Shipping: ${order.shipping>0?'₹'+Number(order.shipping).toLocaleString('en-IN'):'Free'}</div><div class="total" style="margin-top:8px;padding-top:8px;border-top:2px solid #3B1F1A">Total: ₹${Number(order.total).toLocaleString('en-IN')}</div></div><div style="margin-top:40px;padding-top:16px;border-top:1px solid #eee;text-align:center;color:#888;font-size:12px">Thank you for shopping with ${escHtml(b.name||'Alankar Fashions')}. Please retain this invoice for your records.<br/><button onclick="window.print()" style="margin-top:12px;padding:8px 16px;background:#3B1F1A;color:#fff;border:none;border-radius:4px;cursor:pointer">Print / Save PDF</button></div></body></html>`
      return new NextResponse(html, { headers: { 'content-type': 'text/html' } })
    }

    // ------------- ABANDONED CART CRON (call via cron-job.org or GitHub Actions) -------------
    if (route === '/cron/abandoned-cart' && method === 'POST') {
      // Uses a secret to prevent abuse
      const token = request.headers.get('x-cron-token')
      if (token !== (process.env.CRON_SECRET || 'change_me_cron_secret')) return json({ error: 'Unauthorized' }, 401)
      // In this MVP, we store cart in localStorage; abandoned-cart tracking would require server-side cart persistence.
      // As a fallback: send abandoned-checkout reminders for pending unpaid orders older than 2 hours, less than 24 hours.
      const admin = getSupabaseAdmin()
      const since = new Date(Date.now() - 24*60*60*1000).toISOString()
      const until = new Date(Date.now() - 2*60*60*1000).toISOString()
      const { data: orders } = await admin.from('orders').select('*').eq('payment_status','pending').gte('created_at', since).lte('created_at', until).is('razorpay_payment_id', null)
      let sent = 0
      for (const o of (orders||[])) {
        if (!o.email) continue
        const { sendAbandonedCart } = await import('@/lib/email')
        const r = await sendAbandonedCart({ to: o.email, order: o })
        if (r?.ok) sent++
      }
      return json({ ok: true, sent, checked: (orders||[]).length })
    }

    // ------------- SETUP -------------
    if (route === '/setup/check' && method === 'GET') {
      const admin = getSupabaseAdmin()
      const { error } = await admin.from('products').select('id').limit(1)
      // also check for meta_title column (indicates migration_alankar was applied)
      const { error: colError } = await admin.from('products').select('meta_title').limit(1)
      return json({ ready: !error, migrated: !colError })
    }
    if (route === '/setup/schema' && method === 'GET') {
      try {
        const fs = await import('fs')
        const p = await import('path')
        const sql = fs.readFileSync(p.default.join(process.cwd(), 'supabase', 'schema.sql'), 'utf8')
        return new NextResponse(sql, { headers: { 'content-type': 'text/plain' } })
      } catch (e) { return json({ error: e.message }, 500) }
    }
    if (route === '/setup/migration' && method === 'GET') {
      try {
        const fs = await import('fs')
        const p = await import('path')
        const sql = fs.readFileSync(p.default.join(process.cwd(), 'supabase', 'migration_alankar.sql'), 'utf8')
        return new NextResponse(sql, { headers: { 'content-type': 'text/plain' } })
      } catch (e) { return json({ error: e.message }, 500) }
    }
    if (route === '/setup/migration-features' && method === 'GET') {
      try {
        const fs = await import('fs')
        const p = await import('path')
        const sql = fs.readFileSync(p.default.join(process.cwd(), 'supabase', 'migration_features.sql'), 'utf8')
        return new NextResponse(sql, { headers: { 'content-type': 'text/plain' } })
      } catch (e) { return json({ error: e.message }, 500) }
    }

    // ------------- HOMEPAGE (public) -------------
    if (route === '/homepage' && method === 'GET') {
      const admin = getSupabaseAdmin()
      const { data: sections } = await admin.from('homepage_sections').select('*').eq('is_active', true).order('sort_order')
      // fetch products for product sections
      const withProducts = await Promise.all((sections||[]).map(async (s) => {
        if (s.section_type !== 'products') return s
        let q = admin.from('products').select('id,name,slug,price,discount_price,images,category_id,rating_avg,rating_count,is_new,is_trending').eq('status','published')
        const f = s.data?.filter
        if (f === 'is_featured') q = q.eq('is_featured', true)
        else if (f === 'is_new') q = q.eq('is_new', true)
        else if (f === 'is_trending') q = q.eq('is_trending', true)
        q = q.order('created_at', { ascending: false }).limit(s.data?.limit || 8)
        const { data: prods } = await q
        return { ...s, products: prods || [] }
      }))
      return json({ sections: withProducts })
    }

    // ------------- CATEGORIES -------------
    if (route === '/categories' && method === 'GET') {
      const admin = getSupabaseAdmin()
      const { data } = await admin.from('categories').select('*').order('sort_order')
      return json({ categories: data || [] })
    }

    // ------------- PRODUCTS -------------
    if (route === '/products' && method === 'GET') {
      const admin = getSupabaseAdmin()
      const { searchParams } = new URL(request.url)
      const cat = searchParams.get('category')
      const q = searchParams.get('q')
      const filter = searchParams.get('filter') // 'new' | 'trending' | 'featured'
      const sort = searchParams.get('sort') || 'newest'
      const min = parseFloat(searchParams.get('min') || '0')
      const max = parseFloat(searchParams.get('max') || '999999')
      const size = searchParams.get('size')
      const color = searchParams.get('color')
      const limit = Math.min(60, parseInt(searchParams.get('limit') || '24'))

      let query = admin.from('products').select('id,name,slug,price,discount_price,images,category_id,brand,sizes,colors,rating_avg,rating_count,is_new,is_trending,is_featured,stock,tags').eq('status','published')
      if (cat) {
        const { data: c } = await admin.from('categories').select('id').eq('slug', cat).single()
        if (c) query = query.eq('category_id', c.id)
      }
      if (q) query = query.ilike('name', `%${q}%`)
      if (filter === 'new') query = query.eq('is_new', true)
      if (filter === 'trending') query = query.eq('is_trending', true)
      if (filter === 'featured') query = query.eq('is_featured', true)
      if (size) query = query.contains('sizes', [size])
      if (color) query = query.contains('colors', [color])
      query = query.gte('price', min).lte('price', max)
      if (sort === 'price_asc') query = query.order('price', { ascending: true })
      else if (sort === 'price_desc') query = query.order('price', { ascending: false })
      else if (sort === 'popular') query = query.order('rating_count', { ascending: false })
      else query = query.order('created_at', { ascending: false })
      query = query.limit(limit)
      const { data, error } = await query
      if (error) return json({ error: error.message }, 500)
      return json({ products: data || [] })
    }

    if (route.startsWith('/products/') && method === 'GET') {
      const slug = path[1]
      const admin = getSupabaseAdmin()
      const { data: p, error } = await admin.from('products').select('*').eq('slug', slug).eq('status','published').single()
      if (error || !p) return json({ error: 'Not found' }, 404)
      const { data: related } = await admin.from('products').select('id,name,slug,price,discount_price,images,rating_avg').eq('category_id', p.category_id).eq('status','published').neq('id', p.id).limit(6)
      const { data: reviews } = await admin.from('reviews').select('id,rating,title,body,is_verified,created_at,user_id,reviewer_name,is_admin_added').eq('product_id', p.id).order('created_at', { ascending: false }).limit(20)
      return json({ product: p, related: related || [], reviews: reviews || [] })
    }

    // ------------- SEARCH SUGGEST -------------
    if (route === '/search/suggest' && method === 'GET') {
      const ip = clientIp(request)
      const rl = rateLimit({ key: `sr:${ip}`, limit: 30, windowMs: 60_000 })
      if (!rl.allowed) return json({ error: 'Rate limit' }, 429)
      const q = new URL(request.url).searchParams.get('q') || ''
      if (q.length < 2) return json({ items: [] })
      const admin = getSupabaseAdmin()
      const { data } = await admin.from('products').select('name,slug,images').ilike('name', `%${q}%`).eq('status','published').limit(6)
      return json({ items: data || [] })
    }

    // ------------- AUTH -------------
    if (route === '/auth/signup' && method === 'POST') {
      const ip = clientIp(request)
      const rl = rateLimit({ key: `su:${ip}`, limit: 5, windowMs: 60_000 })
      if (!rl.allowed) return json({ error: 'Too many attempts. Try later.' }, 429)
      const body = await request.json()
      const p = authSchema.safeParse(body); if (!p.success) return json({ error: 'Invalid input', details: p.error.flatten() }, 400)
      const sb = await getSupabaseServer()
      const { data, error } = await sb.auth.signUp({ email: p.data.email, password: p.data.password, options: { data: { full_name: p.data.fullName || '' } } })
      if (error) return json({ error: error.message }, 400)
      return json({ user: data.user, session: data.session })
    }
    if (route === '/auth/login' && method === 'POST') {
      const ip = clientIp(request)
      const rl = rateLimit({ key: `li:${ip}`, limit: 10, windowMs: 60_000 })
      if (!rl.allowed) return json({ error: 'Too many attempts. Try later.' }, 429)
      const body = await request.json()
      const p = authSchema.safeParse(body); if (!p.success) return json({ error: 'Invalid input' }, 400)
      const sb = await getSupabaseServer()
      const { data, error } = await sb.auth.signInWithPassword({ email: p.data.email, password: p.data.password })
      if (error) return json({ error: error.message }, 400)
      return json({ user: data.user })
    }
    if (route === '/auth/logout' && method === 'POST') {
      const sb = await getSupabaseServer(); await sb.auth.signOut(); return json({ ok: true })
    }
    if (route === '/auth/me' && method === 'GET') {
      const sb = await getSupabaseServer()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return json({ user: null })
      const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single()
      return json({ user, profile })
    }

    // ------------- COUPONS -------------
    if (route === '/coupons/validate' && method === 'POST') {
      const { code, subtotal } = await request.json()
      if (!code) return json({ error: 'code required' }, 400)
      const admin = getSupabaseAdmin()
      const { data: c } = await admin.from('coupons').select('*').eq('code', String(code).toUpperCase()).single()
      if (!c || !c.is_active) return json({ error: 'Invalid coupon' }, 400)
      if (c.valid_until && new Date(c.valid_until) < new Date()) return json({ error: 'Coupon expired' }, 400)
      if (c.min_order_value && Number(subtotal) < Number(c.min_order_value)) return json({ error: `Minimum order ₹${c.min_order_value}` }, 400)
      let discount = c.discount_type === 'percent' ? (Number(subtotal) * Number(c.discount_value)) / 100 : Number(c.discount_value)
      if (c.max_discount) discount = Math.min(discount, Number(c.max_discount))
      discount = Math.round(discount)
      return json({ code: c.code, discount, discount_type: c.discount_type, discount_value: c.discount_value })
    }

    // ------------- CHECKOUT: create Razorpay order + provisional order -------------
    if (route === '/checkout/create' && method === 'POST') {
      const ip = clientIp(request)
      const rl = rateLimit({ key: `co:${ip}`, limit: 20, windowMs: 60_000 })
      if (!rl.allowed) return json({ error: 'Too many attempts' }, 429)
      const body = await request.json()
      const p = checkoutSchema.safeParse(body); if (!p.success) return json({ error: 'Invalid input', details: p.error.flatten() }, 400)

      // Compute prices server-side (never trust client prices)
      const admin = getSupabaseAdmin()
      const ids = p.data.items.map(i => i.product_id)
      const { data: prods } = await admin.from('products').select('id,name,price,discount_price,images,stock,status').in('id', ids)
      const byId = Object.fromEntries((prods||[]).map(x => [x.id, x]))
      const orderItems = []
      let subtotal = 0
      for (const it of p.data.items) {
        const pr = byId[it.product_id]
        if (!pr || pr.status !== 'published') return json({ error: 'Product unavailable' }, 400)
        if (pr.stock < it.quantity) return json({ error: `${pr.name} out of stock` }, 400)
        const unit = Number(pr.discount_price || pr.price)
        const sub = unit * it.quantity
        subtotal += sub
        orderItems.push({ product_id: pr.id, name: pr.name, image: pr.images?.[0] || null, size: it.size || null, color: it.color || null, quantity: it.quantity, price: unit, subtotal: sub })
      }

      // Coupon
      let discount = 0, couponCode = null
      if (p.data.coupon) {
        const { data: c } = await admin.from('coupons').select('*').eq('code', String(p.data.coupon).toUpperCase()).eq('is_active', true).single()
        if (c && (!c.valid_until || new Date(c.valid_until) > new Date()) && subtotal >= Number(c.min_order_value || 0)) {
          let d = c.discount_type === 'percent' ? (subtotal * Number(c.discount_value)) / 100 : Number(c.discount_value)
          if (c.max_discount) d = Math.min(d, Number(c.max_discount))
          discount = Math.round(d); couponCode = c.code
        }
      }
      const shipping = subtotal >= 999 ? 0 : 79

      // COD handling
      const payment_method = body.payment_method === 'cod' ? 'cod' : 'online'
      let codFee = 0
      if (payment_method === 'cod') {
        const { data: codRow } = await admin.from('settings').select('value').eq('key','cod').single()
        const cfg = codRow?.value && typeof codRow.value === 'object' ? codRow.value : {}
        if (cfg.enabled === false) return json({ error: 'COD is currently unavailable' }, 400)
        const codMin = Number(cfg.min_order || 0)
        const codMax = Number(cfg.max_order || 0)
        if (codMin > 0 && subtotal < codMin) return json({ error: `COD requires minimum order of ₹${codMin}` }, 400)
        if (codMax > 0 && subtotal > codMax) return json({ error: `COD not available for orders above ₹${codMax}` }, 400)
        codFee = Number(cfg.fee || 0)
      }
      const total = Math.max(0, subtotal - discount + shipping + codFee)

      // Current user (may be null for guest)
      const sb = await getSupabaseServer()
      const { data: { user } } = await sb.auth.getUser()

      const notes = typeof body.notes === 'string' ? body.notes.slice(0, 500) : null

      const order_number = orderNumber()
      const { data: order, error: oe } = await admin.from('orders').insert({
        order_number, user_id: user?.id || null,
        email: p.data.email, phone: p.data.phone,
        status: payment_method === 'cod' ? 'processing' : 'pending',
        payment_status: payment_method === 'cod' ? 'cod_pending' : 'pending',
        payment_method,
        subtotal, discount, shipping, total,
        cod_fee: codFee || null,
        notes,
        coupon_code: couponCode,
        shipping_address: p.data.address,
        items: orderItems,
      }).select().single()
      if (oe) return json({ error: 'Could not create order: ' + oe.message }, 500)

      // COD: skip Razorpay entirely, send COD confirmation email, no stock decrement here
      if (payment_method === 'cod') {
        try {
          await admin.from('order_status_history').insert({ order_id: order.id, status: 'processing', note: 'COD order placed' })
        } catch {}
        try {
          const { sendCODOrderConfirmation } = await import('@/lib/email')
          sendCODOrderConfirmation({ to: order.email, order }).catch(()=>{})
        } catch {}
        return json({ order_id: order.id, order_number, total, cod: true, mode: 'cod' })
      }

      // Razorpay order (online payment)
      const { client, key_id } = await getRazorpay()
      let rzp_order_id = null, mode = 'test'
      if (client && key_id && !key_id.includes('placeholder')) {
        try {
          const ro = await client.orders.create({ amount: Math.round(total * 100), currency: 'INR', receipt: order_number, notes: { order_number } })
          rzp_order_id = ro.id
          await admin.from('orders').update({ razorpay_order_id: rzp_order_id }).eq('id', order.id)
          mode = 'live'
        } catch (e) { console.error('rzp create fail', e) }
      }
      return json({ order_id: order.id, order_number, total, razorpay_key_id: key_id, razorpay_order_id: rzp_order_id, mode })
    }

    // ------------- CHECKOUT: verify (client-callback fallback; webhook is source of truth) -------------
    if (route === '/checkout/verify' && method === 'POST') {
      const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json()
      if (!order_id) return json({ error: 'order_id required' }, 400)
      const admin = getSupabaseAdmin()
      const { data: order } = await admin.from('orders').select('*').eq('id', order_id).single()
      if (!order) return json({ error: 'Order not found' }, 404)

      const { key_secret } = await getRazorpay()
      let verified = false
      if (razorpay_payment_id && razorpay_order_id && razorpay_signature && key_secret && !key_secret.includes('placeholder')) {
        const expected = crypto.createHmac('sha256', key_secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')
        verified = expected === razorpay_signature
      } else if (!razorpay_payment_id) {
        // Test-mode / placeholder: mark paid to complete flow (webhook remains source of truth in live)
        verified = true
      }
      if (!verified) return json({ error: 'Payment verification failed' }, 400)

      // Mark paid + decrement stock (idempotent-ish)
      await admin.from('orders').update({ payment_status: 'paid', status: 'processing', razorpay_payment_id, razorpay_order_id }).eq('id', order_id).eq('payment_status','pending')
      for (const it of order.items || []) {
        await admin.rpc('decrement_stock', { p_id: it.product_id, qty: it.quantity }).catch(async () => {
          // fallback: read-modify-write
          const { data: pr } = await admin.from('products').select('stock,name').eq('id', it.product_id).single()
          const newStock = Math.max(0, (pr?.stock || 0) - it.quantity)
          await admin.from('products').update({ stock: newStock }).eq('id', it.product_id)
          if (newStock <= 5 && pr?.name) sendLowStockAlert({ product: { name: pr.name, stock: newStock } })
        })
      }
      await admin.from('order_status_history').insert({ order_id, status: 'processing', note: 'Payment received' })
      const { data: fresh } = await admin.from('orders').select('*').eq('id', order_id).single()
      sendOrderConfirmation({ to: fresh.email, order: fresh }).catch(()=>{})
      return json({ ok: true, order: fresh })
    }

    // ------------- RAZORPAY WEBHOOK -------------
    if (route === '/webhooks/razorpay' && method === 'POST') {
      const raw = await request.text()
      const sig = request.headers.get('x-razorpay-signature')
      const { webhook_secret } = await getRazorpay()
      if (webhook_secret && !webhook_secret.includes('placeholder') && sig) {
        const expected = crypto.createHmac('sha256', webhook_secret).update(raw).digest('hex')
        if (expected !== sig) return json({ error: 'invalid signature' }, 400)
      }
      const payload = JSON.parse(raw || '{}')
      const event = payload?.event
      const p = payload?.payload?.payment?.entity || payload?.payload?.order?.entity
      const admin = getSupabaseAdmin()
      if (event === 'payment.captured' && p) {
        const rzp_order_id = p.order_id
        const { data: order } = await admin.from('orders').select('*').eq('razorpay_order_id', rzp_order_id).single()
        if (order && order.payment_status !== 'paid') {
          await admin.from('orders').update({ payment_status: 'paid', status: 'processing', razorpay_payment_id: p.id }).eq('id', order.id)
          await admin.from('order_status_history').insert({ order_id: order.id, status: 'processing', note: 'Payment captured (webhook)' })
          sendOrderConfirmation({ to: order.email, order: { ...order, payment_status:'paid' } }).catch(()=>{})
        }
      }
      return json({ ok: true })
    }

    // ------------- ORDERS (user) -------------
    if (route === '/orders' && method === 'GET') {
      const user = await requireUser()
      if (!user) return json({ orders: [] })
      const admin = getSupabaseAdmin()
      const { data } = await admin.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      return json({ orders: data || [] })
    }
    if (route.startsWith('/orders/') && method === 'GET') {
      const id = path[1]
      const admin = getSupabaseAdmin()
      const { data: order } = await admin.from('orders').select('*').eq('id', id).single()
      if (!order) return json({ error: 'Not found' }, 404)
      const user = await requireUser()
      const { admin: adm } = await requireAdmin()
      if (order.user_id && (!user || user.id !== order.user_id) && !adm) return json({ error: 'Forbidden' }, 403)
      const { data: history } = await admin.from('order_status_history').select('*').eq('order_id', id).order('created_at')
      return json({ order, history: history || [] })
    }

    // ------------- ADDRESSES -------------
    if (route === '/addresses' && method === 'GET') {
      const user = await requireUser(); if (!user) return json({ addresses: [] })
      const sb = await getSupabaseServer()
      const { data } = await sb.from('addresses').select('*').order('is_default', { ascending: false }).order('created_at', { ascending: false })
      return json({ addresses: data || [] })
    }
    if (route === '/addresses' && method === 'POST') {
      const user = await requireUser(); if (!user) return json({ error: 'Unauthorized' }, 401)
      const body = await request.json()
      const sb = await getSupabaseServer()
      const { data, error } = await sb.from('addresses').insert({ ...body, user_id: user.id }).select().single()
      if (error) return json({ error: error.message }, 400)
      return json({ address: data })
    }
    if (route.startsWith('/addresses/') && method === 'DELETE') {
      const user = await requireUser(); if (!user) return json({ error: 'Unauthorized' }, 401)
      const sb = await getSupabaseServer()
      await sb.from('addresses').delete().eq('id', path[1]).eq('user_id', user.id)
      return json({ ok: true })
    }

    // ------------- WISHLIST -------------
    if (route === '/wishlist' && method === 'GET') {
      const user = await requireUser(); if (!user) return json({ items: [] })
      const sb = await getSupabaseServer()
      const { data } = await sb.from('wishlists').select('product_id, products(id,name,slug,price,discount_price,images,rating_avg)').eq('user_id', user.id)
      return json({ items: (data||[]).map(x => x.products).filter(Boolean) })
    }
    if (route === '/wishlist/toggle' && method === 'POST') {
      const user = await requireUser(); if (!user) return json({ error: 'Unauthorized' }, 401)
      const { product_id } = await request.json()
      const sb = await getSupabaseServer()
      const { data: existing } = await sb.from('wishlists').select('id').eq('user_id', user.id).eq('product_id', product_id).maybeSingle()
      if (existing) { await sb.from('wishlists').delete().eq('id', existing.id); return json({ inWishlist: false }) }
      await sb.from('wishlists').insert({ user_id: user.id, product_id })
      return json({ inWishlist: true })
    }

    // ------------- REVIEWS -------------
    if (route === '/reviews' && method === 'POST') {
      const user = await requireUser(); if (!user) return json({ error: 'Login required' }, 401)
      const body = await request.json()
      const p = reviewSchema.safeParse(body); if (!p.success) return json({ error: 'Invalid input' }, 400)
      const sb = await getSupabaseServer()
      const admin = getSupabaseAdmin()
      // Verified purchase check
      const { data: purchased } = await admin.from('orders').select('id').eq('user_id', user.id).eq('payment_status','paid').limit(50)
      const orderIds = (purchased||[]).map(x=>x.id)
      let verified = false
      if (orderIds.length) {
        const { data: ord } = await admin.from('orders').select('items').in('id', orderIds)
        verified = (ord||[]).some(o => (o.items||[]).some(i => i.product_id === p.data.product_id))
      }
      const { data, error } = await sb.from('reviews').insert({ ...p.data, user_id: user.id, is_verified: verified }).select().single()
      if (error) return json({ error: error.message }, 400)
      // Update product aggregate
      const { data: allR } = await admin.from('reviews').select('rating').eq('product_id', p.data.product_id)
      const avg = allR.length ? allR.reduce((s,r)=>s+r.rating,0)/allR.length : 0
      await admin.from('products').update({ rating_avg: Math.round(avg*100)/100, rating_count: allR.length }).eq('id', p.data.product_id)
      return json({ review: data })
    }

    // ============ ADMIN ============
    if (route.startsWith('/admin/')) {
      // BOOTSTRAP: one-time create first admin. Requires secret token = SUPABASE_SERVICE_ROLE_KEY tail
      if (route === '/admin/bootstrap' && method === 'POST') {
        const admin = getSupabaseAdmin()
        const { email, password, token } = await request.json()
        const expected = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').slice(-8)
        if (!token || token !== expected) return json({ error: 'Invalid bootstrap token' }, 401)
        // Check if any admin exists
        const { data: exists } = await admin.from('profiles').select('id').eq('role','admin').limit(1)
        if (exists && exists.length) return json({ error: 'Admin already exists' }, 400)
        // Create user
        const { data: created, error: ce } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: 'Admin' } })
        if (ce) return json({ error: ce.message }, 400)
        await admin.from('profiles').upsert({ id: created.user.id, email, role: 'admin', full_name: 'Admin' })
        return json({ ok: true, email })
      }

      const { admin: adm } = await requireAdmin()
      if (!adm) return json({ error: 'Forbidden' }, 403)
      const db = getSupabaseAdmin()

      if (route === '/admin/stats' && method === 'GET') {
        const { data: orders } = await db.from('orders').select('total,status,payment_status,created_at').eq('payment_status','paid')
        const revenue = (orders||[]).reduce((s,o)=>s+Number(o.total||0),0)
        const { data: products } = await db.from('products').select('id,stock,name').lte('stock', 5)
        const { data: recent } = await db.from('orders').select('*').order('created_at', { ascending: false }).limit(10)
        // Sales last 14 days
        const days = {}
        for (let i=13;i>=0;i--) { const d = new Date(); d.setDate(d.getDate()-i); const k = d.toISOString().slice(0,10); days[k] = 0 }
        for (const o of (orders||[])) { const k = new Date(o.created_at).toISOString().slice(0,10); if (k in days) days[k] += Number(o.total||0) }
        return json({ revenue, orders_count: (orders||[]).length, low_stock: products||[], recent: recent||[], sales_daily: Object.entries(days).map(([date,total])=>({ date, total })) })
      }

      // Products CRUD
      if (route === '/admin/products' && method === 'GET') {
        const { data } = await db.from('products').select('*, categories(name,slug)').order('created_at', { ascending: false })
        return json({ products: data || [] })
      }
      if (route === '/admin/products' && method === 'POST') {
        const body = await request.json()
        const p = productSchema.safeParse(body); if (!p.success) return json({ error: 'Invalid', details: p.error.flatten() }, 400)
        const { data, error } = await db.from('products').insert(p.data).select().single()
        if (error) return json({ error: error.message }, 400)
        await audit(adm, 'create', 'product', data.id, p.data)
        return json({ product: data })
      }
      if (route.startsWith('/admin/products/') && method === 'PATCH') {
        const id = path[2]
        const body = await request.json()
        const { data, error } = await db.from('products').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).select().single()
        if (error) return json({ error: error.message }, 400)
        await audit(adm, 'update', 'product', id, body)
        return json({ product: data })
      }
      if (route.startsWith('/admin/products/') && method === 'DELETE') {
        const id = path[2]
        await db.from('products').delete().eq('id', id)
        await audit(adm, 'delete', 'product', id, null)
        return json({ ok: true })
      }

      // Reviews (admin-managed — lets store build credibility before real reviews come in)
      if (route === '/admin/reviews' && method === 'GET') {
        const { data } = await db.from('reviews').select('*, products(name,slug)').order('created_at', { ascending: false }).limit(200)
        return json({ reviews: data || [] })
      }
      if (route === '/admin/reviews' && method === 'POST') {
        const body = await request.json()
        const p = adminReviewSchema.safeParse(body); if (!p.success) return json({ error: 'Invalid', details: p.error.flatten() }, 400)
        const payload = { ...p.data, user_id: null, is_admin_added: true, is_verified: false }
        if (!payload.created_at) delete payload.created_at
        const { data, error } = await db.from('reviews').insert(payload).select().single()
        if (error) return json({ error: error.message }, 400)
        const { data: allR } = await db.from('reviews').select('rating').eq('product_id', p.data.product_id)
        const avg = allR.length ? allR.reduce((s,r)=>s+r.rating,0)/allR.length : 0
        await db.from('products').update({ rating_avg: Math.round(avg*100)/100, rating_count: allR.length }).eq('id', p.data.product_id)
        await audit(adm, 'create', 'review', data.id, p.data)
        return json({ review: data })
      }
      if (route.startsWith('/admin/reviews/') && method === 'PATCH') {
        const id = path[2]
        const body = await request.json()
        const { data, error } = await db.from('reviews').update(body).eq('id', id).select().single()
        if (error) return json({ error: error.message }, 400)
        const { data: allR } = await db.from('reviews').select('rating').eq('product_id', data.product_id)
        const avg = allR.length ? allR.reduce((s,r)=>s+r.rating,0)/allR.length : 0
        await db.from('products').update({ rating_avg: Math.round(avg*100)/100, rating_count: allR.length }).eq('id', data.product_id)
        await audit(adm, 'update', 'review', id, body)
        return json({ review: data })
      }
      if (route.startsWith('/admin/reviews/') && method === 'DELETE') {
        const id = path[2]
        const { data: existing } = await db.from('reviews').select('product_id').eq('id', id).single()
        await db.from('reviews').delete().eq('id', id)
        if (existing?.product_id) {
          const { data: allR } = await db.from('reviews').select('rating').eq('product_id', existing.product_id)
          const avg = allR.length ? allR.reduce((s,r)=>s+r.rating,0)/allR.length : 0
          await db.from('products').update({ rating_avg: Math.round(avg*100)/100, rating_count: allR.length }).eq('id', existing.product_id)
        }
        await audit(adm, 'delete', 'review', id, null)
        return json({ ok: true })
      }

      // Categories
      if (route === '/admin/categories' && method === 'GET') { const { data } = await db.from('categories').select('*').order('sort_order'); return json({ categories: data||[] }) }
      if (route === '/admin/categories' && method === 'POST') {
        const body = await request.json()
        // Upsert: if id present -> update, else insert
        if (body.id) {
          const { id, ...rest } = body
          const { data, error } = await db.from('categories').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id).select().single()
          if (error) return json({ error: error.message }, 400)
          await audit(adm, 'update', 'category', id, rest)
          return json({ category: data })
        }
        const { data, error } = await db.from('categories').insert(body).select().single()
        if (error) return json({ error: error.message }, 400)
        await audit(adm, 'create', 'category', data.id, body)
        return json({ category: data })
      }
      if (route.startsWith('/admin/categories/') && method === 'DELETE') { await db.from('categories').delete().eq('id', path[2]); return json({ ok: true }) }

      // Orders
      if (route === '/admin/orders' && method === 'GET') {
        const { data } = await db.from('orders').select('*').order('created_at', { ascending: false })
        return json({ orders: data || [] })
      }
      if (route.startsWith('/admin/orders/') && path[3] === 'cod-collected' && method === 'POST') {
        const id = path[2]
        const { data: order } = await db.from('orders').select('*').eq('id', id).single()
        if (!order) return json({ error: 'Not found' }, 404)
        if (order.payment_method !== 'cod') return json({ error: 'Not a COD order' }, 400)
        // Mark payment collected; decrement stock now (COD stock decrement happens on delivery)
        await db.from('orders').update({ payment_status: 'paid', updated_at: new Date().toISOString() }).eq('id', id)
        for (const it of order.items || []) {
          try {
            await db.rpc('decrement_stock', { p_id: it.product_id, qty: it.quantity })
          } catch {
            const { data: pr } = await db.from('products').select('stock,name').eq('id', it.product_id).single()
            const newStock = Math.max(0, (pr?.stock || 0) - it.quantity)
            await db.from('products').update({ stock: newStock }).eq('id', it.product_id)
          }
        }
        await db.from('order_status_history').insert({ order_id: id, status: order.status, note: 'COD payment collected' })
        await audit(adm, 'cod_collected', 'order', id, null)
        return json({ ok: true })
      }
      if (route.startsWith('/admin/orders/') && method === 'PATCH') {
        const id = path[2]
        const body = await request.json()
        const { status, note } = body
        const { data, error } = await db.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single()
        if (error) return json({ error: error.message }, 400)
        await db.from('order_status_history').insert({ order_id: id, status, note: note || null })
        await audit(adm, 'update_status', 'order', id, { status })
        sendStatusUpdate({ to: data.email, order: data, status }).catch(()=>{})
        return json({ order: data })
      }

      // Customers
      if (route === '/admin/customers' && method === 'GET') {
        const { data } = await db.from('profiles').select('id,email,full_name,phone,role,created_at').order('created_at', { ascending: false })
        return json({ customers: data || [] })
      }

      // Coupons
      if (route === '/admin/coupons' && method === 'GET') { const { data } = await db.from('coupons').select('*').order('created_at', { ascending: false }); return json({ coupons: data||[] }) }
      if (route === '/admin/coupons' && method === 'POST') { const body = await request.json(); const { data, error } = await db.from('coupons').insert(body).select().single(); if(error) return json({error:error.message},400); await audit(adm,'create','coupon',data.id,body); return json({ coupon: data }) }
      if (route.startsWith('/admin/coupons/') && method === 'DELETE') { await db.from('coupons').delete().eq('id', path[2]); return json({ ok: true }) }

      // Homepage CMS
      if (route === '/admin/homepage' && method === 'GET') { const { data } = await db.from('homepage_sections').select('*').order('sort_order'); return json({ sections: data||[] }) }
      if (route === '/admin/homepage' && method === 'POST') { const body = await request.json(); const { data, error } = await db.from('homepage_sections').upsert(body, { onConflict: 'section_key' }).select().single(); if(error) return json({error:error.message},400); await audit(adm,'update','homepage',data.section_key,body); return json({ section: data }) }
      if (route.startsWith('/admin/homepage/') && method === 'PATCH') { const id = path[2]; const body = await request.json(); const { data, error } = await db.from('homepage_sections').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).select().single(); if(error) return json({error:error.message},400); return json({ section: data }) }

      // Settings
      if (route === '/admin/settings' && method === 'GET') { const { data } = await db.from('settings').select('*'); return json({ settings: data||[] }) }
      if (route === '/admin/settings' && method === 'POST') { const { key, value } = await request.json(); const { data, error } = await db.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }).select().single(); if(error) return json({error:error.message},400); await audit(adm,'update','settings',key,value); return json({ setting: data }) }

      // Email test
      if (route === '/admin/email-test' && method === 'POST') {
        const { to } = await request.json()
        if (!to) return json({ error: 'to required' }, 400)
        const { sendTest } = await import('@/lib/email')
        const r = await sendTest({ to })
        return json(r)
      }

      // Storage upload (base64 -> supabase storage)
      if (route === '/admin/upload' && method === 'POST') {
        const { file, filename, contentType } = await request.json()
        if (!file) return json({ error: 'file required' }, 400)
        if (!/^image\/(png|jpe?g|webp|gif|avif)$/.test(contentType || '')) return json({ error: 'Invalid file type' }, 400)
        const buf = Buffer.from(file.replace(/^data:.*;base64,/, ''), 'base64')
        if (buf.length > 5 * 1024 * 1024) return json({ error: 'File too large (max 5MB)' }, 400)
        const name = `${Date.now()}-${(filename||'image').replace(/[^a-z0-9.-]/gi,'_')}`
        const { data, error } = await db.storage.from('product-images').upload(name, buf, { contentType, upsert: false })
        if (error) return json({ error: error.message }, 400)
        const { data: pub } = db.storage.from('product-images').getPublicUrl(data.path)
        return json({ url: pub.publicUrl })
      }

      return json({ error: `Admin route ${route} not found` }, 404)
    }

    return json({ error: `Route ${route} not found` }, 404)
  } catch (e) {
    console.error('API error', e)
    return json({ error: 'Internal server error', message: e.message }, 500)
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
