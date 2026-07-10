'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import ProductCard from '@/components/product-card'
import WhatsAppFab from '@/components/whatsapp-fab'
import { inr } from '@/lib/format'
import { Heart, Truck, Shield, Undo2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

function PDP({ slug }) {
  const [data, setData] = useState(null)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [tab, setTab] = useState('desc')
  const router = useRouter()

  useEffect(() => { fetch(`/api/products/${slug}`).then(r=>r.json()).then(d => { setData(d); setColor(d.product?.colors?.[0]||''); setSize(d.product?.sizes?.[0]||'') }) }, [slug])

  if (!data) return (<div><SiteHeader/><div className="container-tight py-10 grid md:grid-cols-2 gap-10"><div className="skeleton aspect-[3/4]"/><div className="space-y-3"><div className="skeleton h-8 w-2/3"/><div className="skeleton h-4 w-1/3"/><div className="skeleton h-24"/></div></div></div>)
  if (data.error) return <div><SiteHeader/><div className="container-tight py-20 text-center"><h1 className="font-serif text-3xl">Product not found</h1></div></div>

  const p = data.product
  const discount = p.discount_price && p.price > p.discount_price ? Math.round((1 - p.discount_price / p.price) * 100) : 0
  const inStock = p.stock > 0

  const addToCart = () => {
    if (p.sizes?.length && !size) return toast.error('Please select a size')
    if (p.colors?.length && !color) return toast.error('Please select a color')
    if (!inStock) return toast.error('Out of stock')
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const key = `${p.id}|${size}|${color}`
    const idx = cart.findIndex(i => i.key === key)
    if (idx >= 0) cart[idx].quantity = Math.min(20, cart[idx].quantity + qty)
    else cart.push({ key, product_id: p.id, name: p.name, slug: p.slug, image: p.images?.[0], price: p.discount_price || p.price, size, color, quantity: qty })
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart:updated'))
    toast.success('Added to bag')
  }
  const buyNow = () => { addToCart(); router.push('/checkout') }

  const toggleWish = async () => {
    const r = await fetch('/api/wishlist/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: p.id }) })
    if (r.status === 401) return toast.error('Login to save items')
    const d = await r.json(); toast.success(d.inWishlist ? 'Added to wishlist' : 'Removed from wishlist')
  }

  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-6 md:py-10">
        <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">Home <ChevronRight className="h-3 w-3"/> Shop <ChevronRight className="h-3 w-3"/> <span className="text-foreground">{p.name}</span></div>
        <div className="grid md:grid-cols-2 gap-6 md:gap-12">
          <div>
            <div className="aspect-[3/4] bg-muted overflow-hidden">
              <img src={p.images?.[activeImg]} alt={p.name} className="w-full h-full object-cover"/>
            </div>
            {p.images?.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {p.images.map((im,i) => (
                  <button key={i} onClick={()=>setActiveImg(i)} className={`aspect-square overflow-hidden ${i===activeImg?'ring-2 ring-primary':''}`}><img src={im} alt="" className="w-full h-full object-cover"/></button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.brand || 'Aurelia'}</div>
            <h1 className="font-serif text-3xl md:text-4xl mt-2">{p.name}</h1>
            {p.rating_avg > 0 && <div className="text-sm text-muted-foreground mt-2">★ {Number(p.rating_avg).toFixed(1)} · {p.rating_count} reviews</div>}
            <div className="flex items-baseline gap-3 mt-5">
              <span className="text-2xl font-semibold">{inr(p.discount_price || p.price)}</span>
              {discount>0 && <><span className="text-muted-foreground line-through">{inr(p.price)}</span><span className="text-sm text-emerald-700 font-medium">-{discount}%</span></>}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</div>

            {p.colors?.length > 0 && (
              <div className="mt-6">
                <div className="text-xs uppercase tracking-widest mb-2">Color: <span className="text-muted-foreground">{color}</span></div>
                <div className="flex flex-wrap gap-2">
                  {p.colors.map(c => (
                    <button key={c} onClick={()=>setColor(c)} className={`px-3 py-1.5 text-xs border ${color===c?'bg-primary text-primary-foreground border-primary':'border-border'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}
            {p.sizes?.length > 0 && (
              <div className="mt-5">
                <div className="text-xs uppercase tracking-widest mb-2">Size</div>
                <div className="flex flex-wrap gap-2">
                  {p.sizes.map(s => (
                    <button key={s} onClick={()=>setSize(s)} className={`min-w-[3rem] px-3 py-2 text-xs border ${size===s?'bg-primary text-primary-foreground border-primary':'border-border'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-5">
              <div className="text-xs uppercase tracking-widest mb-2">Quantity</div>
              <div className="inline-flex items-center border border-border">
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-10 h-10 grid place-items-center">−</button>
                <div className="w-10 h-10 grid place-items-center border-x border-border">{qty}</div>
                <button onClick={()=>setQty(q=>Math.min(20,q+1))} className="w-10 h-10 grid place-items-center">+</button>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={addToCart} disabled={!inStock} className="flex-1 h-12 bg-primary text-primary-foreground text-sm uppercase tracking-widest disabled:opacity-50">{inStock?'Add to Bag':'Out of Stock'}</button>
              <button onClick={buyNow} disabled={!inStock} className="flex-1 h-12 border border-primary text-sm uppercase tracking-widest disabled:opacity-50">Buy Now</button>
              <button onClick={toggleWish} className="h-12 w-12 border border-border grid place-items-center" aria-label="Wishlist"><Heart className="h-4 w-4"/></button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 text-xs">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4"/> Free ship ₹999+</div>
              <div className="flex items-center gap-2"><Undo2 className="h-4 w-4"/> 15-day returns</div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4"/> Secure checkout</div>
            </div>

            <div className="mt-8 border-t border-border/60 pt-6">
              <div className="flex gap-6 text-xs uppercase tracking-widest border-b border-border/60">
                {[['desc','Description'],['details','Details'],['reviews','Reviews']].map(([k,l])=>(
                  <button key={k} onClick={()=>setTab(k)} className={`pb-3 ${tab===k?'border-b-2 border-primary':''}`}>{l}</button>
                ))}
              </div>
              <div className="py-4 text-sm text-muted-foreground leading-relaxed">
                {tab==='desc' && <p>{p.description}</p>}
                {tab==='details' && <ul className="list-disc pl-5 space-y-1"><li>SKU: {p.sku}</li><li>Sizes: {p.sizes?.join(', ') || 'One Size'}</li><li>Colors: {p.colors?.join(', ') || '—'}</li><li>Brand: {p.brand}</li></ul>}
                {tab==='reviews' && (data.reviews?.length ? data.reviews.map(r => (
                  <div key={r.id} className="border-b border-border/60 py-3"><div className="text-foreground">★ {r.rating} {r.is_verified && <span className="text-emerald-700 text-xs ml-2">Verified Purchase</span>}</div><div className="font-medium text-foreground mt-1">{r.title}</div><div>{r.body}</div></div>
                )) : <p>No reviews yet.</p>)}
              </div>
            </div>
          </div>
        </div>

        {data.related?.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl md:text-3xl mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {data.related.slice(0,4).map(rp => <ProductCard key={rp.id} p={rp}/>)}
            </div>
          </section>
        )}

        {Array.isArray(p.faqs) && p.faqs.length > 0 && (
          <section className="mt-16 max-w-3xl">
            <h2 className="font-serif text-2xl md:text-3xl mb-6">Frequently asked</h2>
            <div className="divide-y divide-border">
              {p.faqs.map((f,i) => (
                <details key={i} className="py-3 group">
                  <summary className="cursor-pointer font-medium flex justify-between items-center"><span>{f.q}</span><span className="text-gold-500 group-open:rotate-45 transition">+</span></summary>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context':'https://schema.org','@type':'Product',
          name: p.name, description: p.description, sku: p.sku, brand:{ '@type':'Brand', name: p.brand||'Alankar Fashions' },
          image: p.images||[], material: p.material||undefined,
          offers: { '@type':'Offer', priceCurrency:'INR', price: String(p.discount_price||p.price), availability: p.stock>0?'https://schema.org/InStock':'https://schema.org/OutOfStock', url: (process.env.NEXT_PUBLIC_BASE_URL||'')+`/products/${p.slug}` },
          aggregateRating: p.rating_count>0 ? { '@type':'AggregateRating', ratingValue: String(p.rating_avg||0), reviewCount: String(p.rating_count) } : undefined
        }) }}/>
      </main>
      <SiteFooter/>
      <WhatsAppFab/>
    </div>
  )
}

export default function Page({ params }) {
  const { slug } = use(params)
  return <PDP slug={slug}/>
}
