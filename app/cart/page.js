'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { inr } from '@/lib/format'
import { Trash2, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

function Cart() {
  const [items, setItems] = useState([])
  const [coupon, setCoupon] = useState('')
  const [applied, setApplied] = useState(null)
  const router = useRouter()
  useEffect(() => { setItems(JSON.parse(localStorage.getItem('cart')||'[]')) }, [])
  const persist = (arr) => { setItems(arr); localStorage.setItem('cart', JSON.stringify(arr)); window.dispatchEvent(new Event('cart:updated')) }
  const setQty = (key, q) => persist(items.map(i => i.key===key?{...i, quantity: Math.max(1, Math.min(20, q))}:i))
  const remove = (key) => persist(items.filter(i => i.key !== key))
  const subtotal = items.reduce((s,i)=>s + i.price*i.quantity, 0)
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79
  const discount = applied?.discount || 0
  const total = Math.max(0, subtotal - discount + shipping)

  const applyCoupon = async () => {
    if (!coupon.trim()) return
    try {
      const r = await fetch('/api/coupons/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code: coupon.trim().toUpperCase(), subtotal }) })
      const d = await r.json()
      if (!r.ok) return toast.error(d.error || 'Invalid coupon')
      setApplied(d); toast.success(`Applied ${d.code} — saved ${inr(d.discount)}`)
    } catch { toast.error('Failed to apply coupon') }
  }

  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-8 md:py-14">
        <h1 className="font-serif text-3xl md:text-4xl">Shopping Bag</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground"/>
            <div className="font-serif text-2xl mt-4">Your bag is empty</div>
            <p className="text-muted-foreground mt-2 mb-6">Discover our latest arrivals and add your favourites.</p>
            <Link href="/products" className="inline-block px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-widest">Continue Shopping</Link>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 divide-y divide-border">
              {items.map(i => (
                <div key={i.key} className="flex gap-4 py-5">
                  <Link href={`/products/${i.slug}`} className="w-24 md:w-32 aspect-[3/4] bg-muted overflow-hidden shrink-0"><img src={i.image} alt={i.name} className="w-full h-full object-cover"/></Link>
                  <div className="flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <Link href={`/products/${i.slug}`} className="font-medium">{i.name}</Link>
                        <div className="text-xs text-muted-foreground mt-1">{[i.size, i.color].filter(Boolean).join(' · ') || 'One Size'}</div>
                      </div>
                      <div className="text-sm font-semibold">{inr(i.price * i.quantity)}</div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center border border-border">
                        <button onClick={()=>setQty(i.key, i.quantity-1)} className="w-8 h-8">−</button>
                        <div className="w-8 h-8 grid place-items-center text-sm">{i.quantity}</div>
                        <button onClick={()=>setQty(i.key, i.quantity+1)} className="w-8 h-8">+</button>
                      </div>
                      <button onClick={()=>remove(i.key)} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"><Trash2 className="h-3.5 w-3.5"/> Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="bg-card border border-border p-6 h-fit sticky top-24">
              <h2 className="font-serif text-xl">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
                {applied && <div className="flex justify-between text-emerald-700"><span>Discount ({applied.code})</span><span>− {inr(discount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping===0?'Free':inr(shipping)}</span></div>
                <div className="flex justify-between text-base font-semibold pt-3 border-t border-border"><span>Total</span><span>{inr(total)}</span></div>
              </div>
              <div className="mt-5 flex gap-2">
                <input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="flex-1 h-11 px-3 border border-border bg-background text-sm"/>
                <button onClick={applyCoupon} className="px-4 h-11 border border-border text-xs uppercase tracking-widest">Apply</button>
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">Try WELCOME10 or FLAT500</div>
              <button onClick={()=>router.push('/checkout')} className="mt-5 w-full h-12 bg-primary text-primary-foreground text-sm uppercase tracking-widest">Checkout</button>
              <Link href="/products" className="block text-center text-xs uppercase tracking-widest text-muted-foreground mt-3">Continue Shopping</Link>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter/>
    </div>
  )
}

export default function Page() { return <Cart/> }
