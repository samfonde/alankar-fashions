'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

export default function AdminSettings(){
  const [items,setItems] = useState([])
  useEffect(()=>{ fetch('/api/admin/settings').then(r=>r.json()).then(d=>setItems(d.settings||[])) },[])
  const upsert = async (key, value) => { const r = await fetch('/api/admin/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ key, value }) }); if(!r.ok){const d=await r.json();return toast.error(d.error||'Failed')} toast.success('Saved') }
  const rp = items.find(s => s.key === 'payment_razorpay')?.value || {}
  const brand = items.find(s => s.key === 'brand')?.value || {}

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-2xl">Settings</h1><p className="text-sm text-muted-foreground">Payment gateway, brand and store settings.</p></div>

      <div className="bg-card border border-border p-5">
        <h2 className="font-serif text-lg mb-3">Payment — Razorpay</h2>
        <p className="text-xs text-muted-foreground mb-4">Paste your Razorpay keys here. Test keys start with <code>rzp_test_</code>, live keys with <code>rzp_live_</code>. Get keys from <a target="_blank" rel="noopener" href="https://dashboard.razorpay.com/app/keys" className="underline">Razorpay Dashboard → Keys</a>. Webhook secret from <a target="_blank" rel="noopener" href="https://dashboard.razorpay.com/app/webhooks" className="underline">Webhooks</a>. Set webhook URL to <code>/api/webhooks/razorpay</code>.</p>
        <RazorpayForm initial={rp} onSave={v => upsert('payment_razorpay', v)}/>
      </div>

      <div className="bg-card border border-border p-5">
        <h2 className="font-serif text-lg mb-3">Brand</h2>
        <BrandForm initial={brand} onSave={v => upsert('brand', v)}/>
      </div>

      <div className="bg-card border border-border p-5">
        <h2 className="font-serif text-lg mb-3">Bootstrap Token</h2>
        <p className="text-xs text-muted-foreground">To create additional admins, use the last 8 characters of your Supabase service role key at <code>/admin/login → First-time setup</code>. Keep it private.</p>
      </div>
    </div>
  )
}

function RazorpayForm({ initial, onSave }){
  const [f,setF] = useState({ key_id:'', key_secret:'', webhook_secret:'', live_mode:false, ...(initial||{}) })
  useEffect(()=>{ setF({ key_id:'', key_secret:'', webhook_secret:'', live_mode:false, ...(initial||{}) }) }, [initial])
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Key ID</span><input value={f.key_id||''} onChange={e=>setF({...f,key_id:e.target.value})} className="mt-1 w-full h-10 px-3 border border-border font-mono text-sm"/></label>
      <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Key Secret</span><input value={f.key_secret||''} onChange={e=>setF({...f,key_secret:e.target.value})} type="password" className="mt-1 w-full h-10 px-3 border border-border font-mono text-sm"/></label>
      <label className="block md:col-span-2"><span className="text-xs uppercase tracking-widest text-muted-foreground">Webhook Secret</span><input value={f.webhook_secret||''} onChange={e=>setF({...f,webhook_secret:e.target.value})} type="password" className="mt-1 w-full h-10 px-3 border border-border font-mono text-sm"/></label>
      <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!f.live_mode} onChange={e=>setF({...f,live_mode:e.target.checked})}/> Live mode</label>
      <div className="md:col-span-2"><button onClick={()=>onSave(f)} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Save className="h-4 w-4"/> Save</button></div>
    </div>
  )
}

function BrandForm({ initial, onSave }){
  const [f,setF] = useState({ name:'Aurelia', tagline:'', support_email:'', support_phone:'', ...(initial||{}) })
  useEffect(()=>{ setF({ name:'Aurelia', tagline:'', support_email:'', support_phone:'', ...(initial||{}) }) }, [initial])
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <label className="block"><span className="text-xs text-muted-foreground">Brand Name</span><input value={f.name||''} onChange={e=>setF({...f,name:e.target.value})} className="mt-1 w-full h-10 px-3 border border-border"/></label>
      <label className="block"><span className="text-xs text-muted-foreground">Tagline</span><input value={f.tagline||''} onChange={e=>setF({...f,tagline:e.target.value})} className="mt-1 w-full h-10 px-3 border border-border"/></label>
      <label className="block"><span className="text-xs text-muted-foreground">Support email</span><input value={f.support_email||''} onChange={e=>setF({...f,support_email:e.target.value})} className="mt-1 w-full h-10 px-3 border border-border"/></label>
      <label className="block"><span className="text-xs text-muted-foreground">Support phone</span><input value={f.support_phone||''} onChange={e=>setF({...f,support_phone:e.target.value})} className="mt-1 w-full h-10 px-3 border border-border"/></label>
      <div className="md:col-span-2"><button onClick={()=>onSave(f)} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Save className="h-4 w-4"/> Save</button></div>
    </div>
  )
}
