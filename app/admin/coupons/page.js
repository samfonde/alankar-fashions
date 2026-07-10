'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { dateFmt } from '@/lib/format'

export default function AdminCoupons(){
  const [items,setItems] = useState([])
  const [form,setForm] = useState(null)
  const load = () => fetch('/api/admin/coupons').then(r=>r.json()).then(d=>setItems(d.coupons||[]))
  useEffect(load,[])
  const save = async () => { if(!form.code||!form.discount_value) return toast.error('Code and value required'); const r = await fetch('/api/admin/coupons', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, code: form.code.toUpperCase(), discount_value: Number(form.discount_value), min_order_value: Number(form.min_order_value||0) }) }); if(!r.ok){const d=await r.json();return toast.error(d.error||'Failed')} toast.success('Saved'); setForm(null); load() }
  const del = async (id) => { if(!confirm('Delete?')) return; await fetch(`/api/admin/coupons/${id}`,{method:'DELETE'}); load() }
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div><h1 className="font-serif text-2xl">Coupons</h1><p className="text-sm text-muted-foreground">{items.length} total</p></div>
        <button onClick={()=>setForm({ code:'', discount_type:'percent', discount_value:10, min_order_value:0, is_active:true })} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Plus className="h-4 w-4"/> New</button>
      </div>
      <div className="bg-card border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Value</th><th className="p-3">Min Order</th><th className="p-3">Valid Until</th><th className="p-3">Active</th><th className="p-3"></th></tr></thead>
          <tbody className="divide-y divide-border">{items.map(c=>(<tr key={c.id}><td className="p-3 font-mono">{c.code}</td><td className="p-3">{c.discount_type}</td><td className="p-3">{c.discount_type==='percent'?`${c.discount_value}%`:`₹${c.discount_value}`}</td><td className="p-3">₹{c.min_order_value||0}</td><td className="p-3 text-muted-foreground">{c.valid_until?dateFmt(c.valid_until):'—'}</td><td className="p-3">{c.is_active?'Yes':'No'}</td><td className="p-3 text-right"><button onClick={()=>del(c.id)} className="text-destructive"><Trash2 className="h-4 w-4"/></button></td></tr>))}</tbody>
        </table>
      </div>
      {form && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
          <div className="bg-background w-full max-w-md border border-border p-5">
            <div className="flex justify-between items-center mb-4"><h2 className="font-serif text-xl">New Coupon</h2><button onClick={()=>setForm(null)}><X className="h-5 w-5"/></button></div>
            <div className="space-y-3">
              <input placeholder="Code (e.g. SUMMER20)" value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} className="w-full h-10 px-3 border border-border font-mono"/>
              <select value={form.discount_type} onChange={e=>setForm({...form,discount_type:e.target.value})} className="w-full h-10 px-3 border border-border"><option value="percent">Percent (%)</option><option value="fixed">Fixed (₹)</option></select>
              <input type="number" placeholder="Value" value={form.discount_value} onChange={e=>setForm({...form,discount_value:e.target.value})} className="w-full h-10 px-3 border border-border"/>
              <input type="number" placeholder="Min order value" value={form.min_order_value} onChange={e=>setForm({...form,min_order_value:e.target.value})} className="w-full h-10 px-3 border border-border"/>
              <input type="datetime-local" value={form.valid_until||''} onChange={e=>setForm({...form,valid_until:e.target.value})} className="w-full h-10 px-3 border border-border"/>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/> Active</label>
            </div>
            <div className="flex justify-end gap-2 mt-5"><button onClick={()=>setForm(null)} className="h-10 px-4 border border-border text-xs uppercase tracking-widest">Cancel</button><button onClick={save} className="h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest">Save</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
