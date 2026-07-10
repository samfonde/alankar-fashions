'use client'
import { useEffect, useState, use, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { inr, dateFmt } from '@/lib/format'
import { CheckCircle2, Package, Truck, Home } from 'lucide-react'

function OrderDetail({ id }) {
  const [data, setData] = useState(null)
  const sp = useSearchParams()
  const success = sp.get('success') === '1'
  useEffect(() => { fetch(`/api/orders/${id}`).then(r=>r.json()).then(setData) }, [id])

  if (!data) return <div><SiteHeader/><div className="container-tight py-10 skeleton h-64"/></div>
  if (data.error) return <div><SiteHeader/><div className="container-tight py-20 text-center"><h1 className="font-serif text-3xl">Order not found</h1></div></div>
  const o = data.order
  const steps = ['pending','processing','shipped','out_for_delivery','delivered']
  const currentStep = steps.indexOf(o.status)
  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-8 md:py-14">
        {success && (
          <div className="mb-8 bg-emerald-50 text-emerald-900 border border-emerald-200 p-6 rounded-sm text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto"/>
            <div className="font-serif text-2xl mt-2">Order confirmed</div>
            <div className="text-sm mt-1">Thank you — a confirmation email is on its way to <strong>{o.email}</strong>.</div>
          </div>
        )}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Order</div>
            <h1 className="font-serif text-3xl md:text-4xl mt-1">{o.order_number}</h1>
            <div className="text-xs text-muted-foreground mt-1">Placed {dateFmt(o.created_at)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Payment</div>
            <div className={`text-sm ${o.payment_status==='paid'?'text-emerald-700':'text-amber-700'}`}>{o.payment_status.toUpperCase()}</div>
            <div className="text-2xl font-semibold mt-1">{inr(o.total)}</div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-5 gap-2">
          {[['pending','Placed', Package],['processing','Processing', Package],['shipped','Shipped', Truck],['out_for_delivery','Out for Delivery', Truck],['delivered','Delivered', Home]].map(([k,l,Ic], i) => (
            <div key={k} className={`p-3 text-center border ${i<=currentStep?'bg-primary text-primary-foreground border-primary':'border-border text-muted-foreground'}`}>
              <Ic className="h-4 w-4 mx-auto"/><div className="text-[11px] uppercase tracking-widest mt-1">{l}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <h2 className="font-serif text-xl mb-4">Items</h2>
            <div className="divide-y divide-border border border-border">
              {(o.items||[]).map((i,idx) => (
                <div key={idx} className="flex gap-4 p-4">
                  <img src={i.image} alt="" className="w-16 h-20 object-cover"/>
                  <div className="flex-1 text-sm"><div>{i.name}</div><div className="text-xs text-muted-foreground">{[i.size,i.color].filter(Boolean).join(' · ')} · Qty {i.quantity}</div></div>
                  <div className="text-sm font-medium">{inr(i.subtotal)}</div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="font-serif text-lg mb-2">Timeline</h3>
              <div className="space-y-2 text-sm">
                {(data.history||[]).map(h => (
                  <div key={h.id} className="flex justify-between border-b border-border/60 py-2"><span className="capitalize">{h.status.replace(/_/g,' ')} {h.note && <span className="text-muted-foreground">— {h.note}</span>}</span><span className="text-xs text-muted-foreground">{dateFmt(h.created_at)}</span></div>
                ))}
                {!data.history?.length && <div className="text-muted-foreground">No updates yet.</div>}
              </div>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="border border-border p-5 bg-card">
              <h3 className="font-serif text-lg mb-3">Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(o.subtotal)}</span></div>
                {o.discount>0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>− {inr(o.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{o.shipping>0?inr(o.shipping):'Free'}</span></div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border"><span>Total</span><span>{inr(o.total)}</span></div>
              </div>
            </div>
            <div className="border border-border p-5 bg-card">
              <h3 className="font-serif text-lg mb-3">Shipping to</h3>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {o.shipping_address?.name}<br/>
                {o.shipping_address?.line1}{o.shipping_address?.line2?', '+o.shipping_address.line2:''}<br/>
                {o.shipping_address?.city}, {o.shipping_address?.state} {o.shipping_address?.pincode}<br/>
                {o.shipping_address?.phone}
              </div>
            </div>
            <Link href="/products" className="block text-center border border-border py-3 text-xs uppercase tracking-widest">Continue Shopping</Link>
          </aside>
        </div>
      </main>
      <SiteFooter/>
    </div>
  )
}

export default function Page({ params }) {
  const { id } = use(params)
  return <Suspense fallback={null}><OrderDetail id={id}/></Suspense>
}
