import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://alankarfashions.com'

async function brand() {
  try {
    const a = getSupabaseAdmin()
    const { data } = await a.from('settings').select('value').eq('key','brand').single()
    const b = data?.value || {}
    return {
      name: b.name || process.env.BRAND_NAME || 'Alankar Fashions',
      tagline: b.tagline || 'स्त्रीचे सौंदर्य खुलवणारे',
      support_email: b.support_email || 'hello@alankarfashions.com',
      support_phone: b.support_phone || '+91 96570 93006',
      address: b.address || 'Mangalwar Peth, Kolhapur',
      logo_url: b.logo_url || null,
      instagram: b.instagram || 'https://www.instagram.com/alankar_fashions_kop/',
      facebook: b.facebook || 'https://www.facebook.com/AlankarFashion/',
    }
  } catch { return { name: 'Alankar Fashions', tagline: '', support_email: 'hello@alankarfashions.com', support_phone: '+91 96570 93006', address: 'Kolhapur' } }
}

const FROM_DEFAULT = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
async function fromLine() { const b = await brand(); return `${b.name} <${FROM_DEFAULT}>` }

function esc(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

function shell({ b, title, preheader, body, cta }) {
  const logo = b.logo_url ? `<img src="${b.logo_url}" alt="${esc(b.name)}" style="max-height:56px"/>` : `<div style="font-family:Georgia,serif;color:#F5E9CE;font-size:26px;letter-spacing:3px">${esc(b.name.toUpperCase())}</div>`
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head><body style="margin:0;padding:0;background:#f8f2e6;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:#1c1917"><span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(preheader||'')}</span><div style="max-width:600px;margin:0 auto;padding:24px 12px"><div style="background:#3B1F1A;padding:28px;text-align:center;border-radius:10px 10px 0 0">${logo}<div style="color:#C7A25A;font-size:11px;letter-spacing:2px;margin-top:6px;text-transform:uppercase">${esc(b.tagline||'')}</div></div><div style="background:#ffffff;padding:32px;border:1px solid #E9D8B5;border-top:none">${body}${cta?`<div style="text-align:center;margin-top:24px"><a href="${cta.href}" style="display:inline-block;background:#3B1F1A;color:#F5E9CE;padding:14px 28px;text-decoration:none;letter-spacing:2px;font-size:13px;text-transform:uppercase">${esc(cta.label)}</a></div>`:''}</div><div style="background:#3B1F1A;padding:20px;color:#E9D8B5;font-size:12px;text-align:center;border-radius:0 0 10px 10px"><div style="opacity:0.85">${esc(b.address)}</div><div style="opacity:0.85;margin-top:4px">${esc(b.support_phone)} · <a href="mailto:${esc(b.support_email)}" style="color:#E9D8B5">${esc(b.support_email)}</a></div><div style="margin-top:8px"><a href="${esc(b.instagram)}" style="color:#C7A25A;margin:0 6px">Instagram</a>·<a href="${esc(b.facebook)}" style="color:#C7A25A;margin:0 6px">Facebook</a></div><div style="margin-top:10px;opacity:0.6">© ${new Date().getFullYear()} ${esc(b.name)}</div></div></div></body></html>`
}

export async function sendOrderConfirmation({ to, order }) {
  if (!resend || !to) return { skipped: true }
  const b = await brand()
  const rows = (order.items||[]).map(i => `<tr><td style="padding:12px 0;border-bottom:1px solid #f0e5ce;font-size:14px">${esc(i.name)}<div style="color:#8a7867;font-size:12px">${[i.size,i.color].filter(Boolean).map(esc).join(' · ')} · Qty ${i.quantity}</div></td><td style="padding:12px 0;border-bottom:1px solid #f0e5ce;text-align:right;font-size:14px">₹${Number(i.subtotal).toLocaleString('en-IN')}</td></tr>`).join('')
  const body = `<h1 style="font-family:Georgia,serif;color:#3B1F1A;margin:0 0 8px;font-size:26px">Thank you for your order</h1><p style="color:#5f544a;margin:0 0 20px">Order <strong>${esc(order.order_number)}</strong> · placed ${new Date(order.created_at||Date.now()).toLocaleDateString('en-IN')}</p><table style="width:100%;border-collapse:collapse;margin-top:8px">${rows}</table><table style="width:100%;margin-top:12px;font-size:14px"><tr><td style="color:#5f544a;padding:4px 0">Subtotal</td><td style="text-align:right">₹${Number(order.subtotal).toLocaleString('en-IN')}</td></tr>${order.discount>0?`<tr><td style="color:#059669;padding:4px 0">Discount</td><td style="text-align:right;color:#059669">− ₹${Number(order.discount).toLocaleString('en-IN')}</td></tr>`:''}<tr><td style="color:#5f544a;padding:4px 0">Shipping</td><td style="text-align:right">${order.shipping>0?'₹'+Number(order.shipping).toLocaleString('en-IN'):'Free'}</td></tr><tr><td style="padding:10px 0;font-weight:700;border-top:2px solid #3B1F1A;color:#3B1F1A;font-size:16px">Total</td><td style="text-align:right;padding:10px 0;font-weight:700;border-top:2px solid #3B1F1A;color:#3B1F1A;font-size:16px">₹${Number(order.total).toLocaleString('en-IN')}</td></tr></table><div style="margin-top:24px;padding:16px;background:#faf5e8;border-radius:6px"><div style="font-weight:600;margin-bottom:6px;color:#3B1F1A">Shipping to</div><div style="color:#5f544a;font-size:13px;line-height:1.7">${esc(order.shipping_address?.name||'')}<br>${esc(order.shipping_address?.line1||'')}${order.shipping_address?.line2?', '+esc(order.shipping_address.line2):''}<br>${esc(order.shipping_address?.city||'')}, ${esc(order.shipping_address?.state||'')} ${esc(order.shipping_address?.pincode||'')}<br>${esc(order.shipping_address?.phone||'')}</div></div><p style="color:#5f544a;font-size:13px;margin-top:20px">Your order is being prepared. We’ll email you tracking as soon as it ships.</p>`
  try {
    const r = await resend.emails.send({ from: await fromLine(), to, subject: `Order confirmed — ${order.order_number} • ${b.name}`, html: shell({ b, title:'Order confirmed', preheader:`Your order ${order.order_number} is confirmed`, body, cta: { label: 'View Order', href: `${BASE}/orders/${order.id}` } }) })
    return { ok: true, id: r?.data?.id }
  } catch (e) { console.error('order email fail', e); return { ok: false, error: e.message } }
}

export async function sendStatusUpdate({ to, order, status }) {
  if (!resend || !to) return { skipped: true }
  const b = await brand()
  const labels = { processing:['is being prepared','We’re carefully preparing your order.'], shipped:['has shipped','Your parcel is on its way!'], out_for_delivery:['is out for delivery','Expect your parcel today.'], delivered:['has been delivered','Hope you love it!'], cancelled:['has been cancelled','Refund will be initiated soon.'], refunded:['has been refunded','You should see the refund shortly.'] }
  const [label, note] = labels[status] || ['has been updated','']
  const body = `<h1 style="font-family:Georgia,serif;color:#3B1F1A;margin:0 0 8px;font-size:24px">Order ${label}</h1><p style="color:#5f544a">Your order <strong>${esc(order.order_number)}</strong> ${label}. ${esc(note)}</p><table style="width:100%;margin-top:12px;font-size:14px"><tr><td style="color:#5f544a">Total</td><td style="text-align:right;font-weight:600">₹${Number(order.total).toLocaleString('en-IN')}</td></tr></table>`
  try { await resend.emails.send({ from: await fromLine(), to, subject: `Order ${order.order_number} ${label}`, html: shell({ b, title: `Order ${status}`, preheader: `Your order ${order.order_number} ${label}`, body, cta:{ label:'Track Order', href:`${BASE}/orders/${order.id}` } }) }); return { ok:true } } catch(e){ console.error('status email fail', e); return { ok:false, error:e.message } }
}

export async function sendAbandonedCart({ to, order }) {
  if (!resend || !to) return { skipped: true }
  const b = await brand()
  const body = `<h1 style="font-family:Georgia,serif;color:#3B1F1A;margin:0 0 8px;font-size:24px">You left something behind</h1><p style="color:#5f544a">We noticed you didn’t complete your checkout. Your beautiful selections are still here waiting for you.</p><table style="width:100%;margin-top:12px;font-size:14px"><tr><td>Cart total</td><td style="text-align:right;font-weight:600">₹${Number(order.total).toLocaleString('en-IN')}</td></tr></table><p style="color:#5f544a;font-size:13px;margin-top:12px">Use code <strong style="color:#3B1F1A">ALANKAR10</strong> for 10% off if you complete your order today.</p>`
  try { await resend.emails.send({ from: await fromLine(), to, subject: `Complete your ${b.name} order`, html: shell({ b, title: 'You left something behind', preheader: 'Complete your checkout with 10% off', body, cta:{ label:'Complete Checkout', href:`${BASE}/checkout` } }) }); return { ok:true } } catch(e){ return { ok:false, error:e.message } }
}

export async function sendLowStockAlert({ product }) {
  if (!resend) return { skipped:true }
  const to = process.env.ADMIN_LOW_STOCK_EMAIL
  if (!to) return { skipped:true }
  const b = await brand()
  const body = `<h1 style="font-family:Georgia,serif;color:#3B1F1A;margin:0 0 8px;font-size:22px">Low stock alert</h1><p style="color:#5f544a">Product <strong>${esc(product.name)}</strong> is running low: <strong>${product.stock} left</strong>.</p>`
  try { await resend.emails.send({ from: await fromLine(), to, subject:`Low stock: ${product.name}`, html: shell({ b, title:'Low stock alert', body, cta:{ label:'Open Admin', href:`${BASE}/admin/products` } }) }); return { ok:true } } catch(e){ return { ok:false } }
}

export async function sendWelcome({ to, name }) {
  if (!resend || !to) return { skipped:true }
  const b = await brand()
  const body = `<h1 style="font-family:Georgia,serif;color:#3B1F1A;margin:0 0 8px;font-size:26px">Welcome to ${esc(b.name)}${name?`, ${esc(name)}`:''} ✨</h1><p style="color:#5f544a">Thank you for joining us. From our atelier in Mangalwar Peth, Kolhapur, we handcraft artificial jewellery that celebrates traditional Maharashtrian style with a contemporary sensibility.</p><p style="color:#5f544a">Here’s <strong>10% off</strong> your first order — use code <strong style="background:#faf5e8;padding:2px 8px;color:#3B1F1A">ALANKAR10</strong> at checkout.</p>`
  try { await resend.emails.send({ from: await fromLine(), to, subject:`Welcome to ${b.name}`, html: shell({ b, title:'Welcome', preheader:'10% off your first order inside', body, cta:{ label:'Start Shopping', href:BASE } }) }); return { ok:true } } catch(e){ return { ok:false, error:e.message } }
}

export async function sendTest({ to }) {
  if (!resend || !to) return { skipped:true, reason: !resend ? 'no_api_key' : 'no_to' }
  const b = await brand()
  const body = `<h1 style="font-family:Georgia,serif;color:#3B1F1A;margin:0 0 8px;font-size:24px">Test email delivery</h1><p style="color:#5f544a">If you’re reading this, Resend is wired correctly and your ${esc(b.name)} store can send transactional emails.</p>`
  try { const r = await resend.emails.send({ from: await fromLine(), to, subject:`Test email from ${b.name}`, html: shell({ b, title:'Test', body }) }); return { ok:true, id:r?.data?.id } } catch(e){ return { ok:false, error:e.message } }
}
