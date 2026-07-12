'use client'
import { useEffect, useState } from 'react'
import { inr, dateFmt } from '@/lib/format'
import { X } from 'lucide-react'
import { toast } from 'sonner'

const STATUSES = ['pending','processing','shipped','out_for_delivery','delivered','cancelled','refunded']

export default function AdminOrders(){
  const [items,setItems] = useState([])
  const [detail,setDetail] = useState(null)
  const [filter,setFilter] = useState('')
  const load = () => fetch('/api/admin/orders').then(r=>r.json()).then(d=>setItems(d.orders||[]))
  useEffect(() => { load() }, [])
  const updateStatus = async (id, status, note) => { const r = await fetch(`/api/admin/orders/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status, note }) }); if (!r.ok) return toast.error('Failed'); toast.success(`Order updated: ${status}`); load(); if (detail) setDetail({...detail, status}) }
  const markCodCollected = async (id) => {
    if (!confirm('Mark COD payment as collected? This will decrement stock.')) return
    const r = await fetch(`/api/admin/orders/${id}/cod-collected`, { method:'POST' })
    if (!r.ok) { const d = await r.json(); return toast.error(d.error||'Failed') }
    toast.success('Marked as paid'); load(); if (detail) setDetail({...detail, payment_status: 'paid'})
  }
  const filtered = items.filter(o => !filter || o.status === filter)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl">Orders</h1><p className="text-sm text-muted-foreground">{items.length} total</p></div>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="h-10 px-3 border border-border bg-background text-sm"><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Status</th></tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} onClick={()=>setDetail(o)} className="cursor-pointer hover:bg-muted/30">
                <td className="p-3 font-medium">{o.order_number}</td>
                <td className="p-3"><div>{o.email}</div><div className="text-xs text-muted-foreground">{o.phone}</div></td>
                <td className="p-3 text-muted-foreground">{dateFmt(o.created_at)}</td>
                <td className="p-3">{inr(o.total)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 ${o.payment_status==='paid'?'bg-emerald-50 text-emerald-800':o.payment_status==='cod_pending'?'bg-orange-50 text-orange-800':'bg-amber-50 text-amber-800'}`}>{o.payment_status}</span>
                  {o.payment_method === 'cod' && <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-900 uppercase tracking-widest" data-testid={`order-cod-badge-${o.id}`}>COD</span>}
                </td>
                <td className="p-3"><span className="text-xs uppercase tracking-widest">{o.status}</span></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders</td></tr>}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background w-full max-w-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background"><div><div className="font-serif text-xl">{detail.order_number}</div><div className="text-xs text-muted-foreground">{dateFmt(detail.created_at)}</div></div><button onClick={()=>setDetail(null)}><X className="h-5 w-5"/></button></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-xs uppercase tracking-widest text-muted-foreground">Customer</div><div>{detail.email}</div><div>{detail.phone}</div></div>
                <div><div className="text-xs uppercase tracking-widest text-muted-foreground">Shipping</div><div className="text-xs leading-relaxed">{detail.shipping_address?.name}<br/>{detail.shipping_address?.line1}<br/>{detail.shipping_address?.city}, {detail.shipping_address?.state} {detail.shipping_address?.pincode}</div></div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Items</div>
                <div className="border border-border divide-y divide-border">
                  {(detail.items||[]).map((i,idx)=>(<div key={idx} className="flex gap-3 p-3"><img src={i.image} className="w-12 h-14 object-cover"/><div className="flex-1 text-sm">{i.name} <div className="text-xs text-muted-foreground">{[i.size,i.color].filter(Boolean).join(' · ')} · Qty {i.quantity}</div></div><div className="text-sm">{inr(i.subtotal)}</div></div>))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Total <span className="font-semibold">{inr(detail.total)}</span></div>
                <div>Payment <span className={detail.payment_status==='paid'?'text-emerald-700':'text-amber-700'}>{detail.payment_status}</span></div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Update Status:</span>
                {STATUSES.map(s => (
                  <button key={s} onClick={()=>updateStatus(detail.id, s)} className={`px-3 py-1.5 text-xs border ${detail.status===s?'bg-primary text-primary-foreground border-primary':'border-border'}`}>{s}</button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                {detail.payment_method === 'cod' && detail.payment_status !== 'paid' && (
                  <button onClick={()=>markCodCollected(detail.id)} className="inline-flex items-center gap-2 h-9 px-3 bg-orange-600 text-white text-xs uppercase tracking-widest" data-testid="admin-mark-cod-collected">Mark Payment Collected</button>
                )}
                <a href={`/api/invoice/${detail.id}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-9 px-3 border border-border text-xs uppercase tracking-widest">Invoice / Print</a>
                <a href={`https://wa.me/${(detail.phone||'').replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`Hi ${detail.shipping_address?.name||''}! Your order ${detail.order_number} from Alankar Fashions is confirmed. Total: ₹${detail.total}. Thank you!`)}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-9 px-3 border border-border text-xs uppercase tracking-widest">WhatsApp Customer</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
