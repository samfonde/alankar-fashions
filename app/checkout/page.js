'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { inr } from '@/lib/format'
import { toast } from 'sonner'
import { Lock, ChevronRight } from 'lucide-react'

function Checkout() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ email:'', phone:'', name:'', line1:'', line2:'', city:'', state:'', pincode:'', country:'India' })
  const [coupon, setCoupon] = useState('')
  const [applied, setApplied] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem('cart')||'[]'); setItems(c)
    if (!c.length) router.replace('/cart')
    fetch('/api/auth/me').then(r=>r.json()).then(d => { setUser(d.user); if (d.user?.email) setForm(f=>({...f, email: d.user.email})) })
  }, [router])

  const subtotal = items.reduce((s,i)=>s + i.price*i.quantity, 0)
  const shipping = subtotal >= 999 ? 0 : 79
  const discount = applied?.discount || 0
  const total = Math.max(0, subtotal - discount + shipping)

  const applyCoupon = async () => {
    if (!coupon.trim()) return
    const r = await fetch('/api/coupons/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code: coupon.trim().toUpperCase(), subtotal }) })
    const d = await r.json()
    if (!r.ok) return toast.error(d.error || 'Invalid coupon')
    setApplied(d); toast.success(`Applied – saved ${inr(d.discount)}`)
  }

  const placeOrder = async () => {
    for (const k of ['email','phone','name','line1','city','state','pincode']) if (!form[k]) return toast.error('Please fill all required fields')
    setLoading(true)
    try {
      const r = await fetch('/api/checkout/create', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        email: form.email, phone: form.phone,
        address: { name: form.name, phone: form.phone, line1: form.line1, line2: form.line2||null, city: form.city, state: form.state, pincode: form.pincode, country: form.country },
        items: items.map(i => ({ product_id: i.product_id, size: i.size||null, color: i.color||null, quantity: i.quantity })),
        coupon: applied?.code || null,
      }) })
      const d = await r.json()
      if (!r.ok) { setLoading(false); return toast.error(d.error || 'Failed to place order') }

      // If Razorpay configured, open checkout; else mark paid in test mode
      if (d.razorpay_order_id && d.razorpay_key_id && !d.razorpay_key_id.includes('placeholder') && typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: d.razorpay_key_id, amount: Math.round(total*100), currency: 'INR',
          name: 'Aurelia', description: `Order ${d.order_number}`,
          order_id: d.razorpay_order_id,
          prefill: { name: form.name, email: form.email, contact: form.phone },
          theme: { color: '#1c1917' },
          handler: async (response) => {
            const vr = await fetch('/api/checkout/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ order_id: d.order_id, ...response }) })
            const vd = await vr.json()
            if (!vr.ok) return toast.error(vd.error || 'Verification failed')
            localStorage.setItem('cart','[]'); window.dispatchEvent(new Event('cart:updated'))
            router.push(`/orders/${d.order_id}?success=1`)
          },
          modal: { ondismiss: () => setLoading(false) },
        })
        rzp.open()
      } else {
        // Test/placeholder mode
        const vr = await fetch('/api/checkout/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ order_id: d.order_id }) })
        const vd = await vr.json()
        if (!vr.ok) { setLoading(false); return toast.error(vd.error || 'Verification failed') }
        localStorage.setItem('cart','[]'); window.dispatchEvent(new Event('cart:updated'))
        router.push(`/orders/${d.order_id}?success=1`)
      }
    } catch (e) { toast.error('Something went wrong'); setLoading(false) }
  }

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload"/>
      <SiteHeader/>
      <main className="container-tight py-8 md:py-14">
        <h1 className="font-serif text-3xl md:text-4xl">Checkout</h1>
        <div className="mt-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <section className="border border-border p-6 bg-card">
              <h2 className="font-serif text-xl mb-4">Contact</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Email" value={form.email} onChange={v=>setForm({...form,email:v})} type="email"/>
                <Input label="Phone" value={form.phone} onChange={v=>setForm({...form,phone:v})}/>
              </div>
              {!user && <div className="text-xs text-muted-foreground mt-3">Have an account? <a href="/login?next=/checkout" className="underline">Sign in</a> for faster checkout.</div>}
            </section>
            <section className="border border-border p-6 bg-card">
              <h2 className="font-serif text-xl mb-4">Shipping Address</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Full name" value={form.name} onChange={v=>setForm({...form,name:v})}/>
                <Input label="Pincode" value={form.pincode} onChange={v=>setForm({...form,pincode:v})}/>
                <div className="md:col-span-2"><Input label="Address line 1" value={form.line1} onChange={v=>setForm({...form,line1:v})}/></div>
                <div className="md:col-span-2"><Input label="Address line 2 (optional)" value={form.line2} onChange={v=>setForm({...form,line2:v})}/></div>
                <Input label="City" value={form.city} onChange={v=>setForm({...form,city:v})}/>
                <Input label="State" value={form.state} onChange={v=>setForm({...form,state:v})}/>
              </div>
            </section>
            <section className="border border-border p-6 bg-card">
              <h2 className="font-serif text-xl mb-3">Payment</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="h-4 w-4"/> Secure payment via Razorpay — UPI, Cards, Netbanking, Wallets</div>
              <p className="text-xs text-muted-foreground mt-2">You will be redirected to Razorpay's secure hosted checkout to complete your payment.</p>
            </section>
          </div>
          <aside className="bg-card border border-border p-6 h-fit lg:sticky lg:top-24">
            <h2 className="font-serif text-xl">Order Summary</h2>
            <div className="mt-4 divide-y divide-border">
              {items.map(i => (
                <div key={i.key} className="flex gap-3 py-3">
                  <img src={i.image} alt="" className="w-14 h-16 object-cover"/>
                  <div className="flex-1 text-sm">
                    <div className="line-clamp-1">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{[i.size,i.color].filter(Boolean).join(' · ')} · Qty {i.quantity}</div>
                  </div>
                  <div className="text-sm font-medium">{inr(i.price*i.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="Coupon" className="flex-1 h-10 px-3 border border-border bg-background text-sm"/>
              <button onClick={applyCoupon} className="px-4 h-10 border border-border text-xs uppercase tracking-widest">Apply</button>
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
              {applied && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>− {inr(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping===0?'Free':inr(shipping)}</span></div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border"><span>Total</span><span>{inr(total)}</span></div>
            </div>
            <button onClick={placeOrder} disabled={loading} className="mt-5 w-full h-12 bg-primary text-primary-foreground text-sm uppercase tracking-widest disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {loading ? 'Processing…' : <>Pay {inr(total)} <ChevronRight className="h-4 w-4"/></>}
            </button>
            <div className="text-[11px] text-muted-foreground mt-3 text-center">By placing this order, you agree to our Terms & Privacy.</div>
          </aside>
        </div>
      </main>
      <SiteFooter/>
    </div>
  )
}

function Input({ label, value, onChange, type='text' }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm"/>
    </label>
  )
}

export default function Page() { return <Checkout/> }
