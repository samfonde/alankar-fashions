'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save, Upload, Send } from 'lucide-react'

export default function AdminSettings(){
  const [items,setItems] = useState([])
  const load = () => fetch('/api/admin/settings').then(r=>r.json()).then(d=>setItems(d.settings||[]))
  useEffect(()=>{ load() },[])
  const upsert = async (key, value) => { const r = await fetch('/api/admin/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ key, value }) }); if(!r.ok){const d=await r.json();return toast.error(d.error||'Failed')} toast.success('Saved'); load() }
  const rp = items.find(s => s.key === 'payment_razorpay')?.value || {}
  const brand = items.find(s => s.key === 'brand')?.value || {}
  const analytics = items.find(s => s.key === 'analytics')?.value || {}
  const seo = items.find(s => s.key === 'seo')?.value || {}

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-2xl">Settings</h1><p className="text-sm text-muted-foreground">Brand identity, payment, analytics, SEO and store settings.</p></div>

      <Section title="Brand identity" desc="Logo, contact info, address. Shown across storefront, emails and invoices.">
        <BrandForm initial={brand} onSave={v => upsert('brand', v)}/>
      </Section>

      <Section title="Payment — Razorpay" desc="Paste live keys once ready. Test keys start with rzp_test_. Set webhook URL to /api/webhooks/razorpay in Razorpay Dashboard.">
        <RazorpayForm initial={rp} onSave={v => upsert('payment_razorpay', v)}/>
      </Section>

      <Section title="Analytics" desc="Meta Pixel and Google Analytics 4 auto-inject site-wide with e-commerce events.">
        <AnalyticsForm initial={analytics} onSave={v => upsert('analytics', v)}/>
      </Section>

      <Section title="SEO" desc="Global meta description and Google Search Console verification.">
        <SEOForm initial={seo} onSave={v => upsert('seo', v)}/>
      </Section>

      <Section title="Email test" desc="Verify Resend email delivery.">
        <EmailTest defaultTo={brand.support_email}/>
      </Section>
    </div>
  )
}

function Section({ title, desc, children }){
  return (
    <div className="bg-card border border-border p-5">
      <h2 className="font-serif text-lg">{title}</h2>
      {desc && <p className="text-xs text-muted-foreground mt-1 mb-4">{desc}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}

function useUpload(){
  return async (file) => {
    const b64 = await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(file)})
    const r = await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({file:b64,filename:file.name,contentType:file.type})})
    const d = await r.json(); if (!r.ok) { toast.error(d.error||'Upload failed'); return null } return d.url
  }
}

function BrandForm({ initial, onSave }){
  const [f,setF] = useState({ name:'Alankar Fashions', tagline:'', support_email:'', support_phone:'', address:'', city:'', state:'', pincode:'', instagram:'', facebook:'', google_business:'', logo_url:null, favicon_url:null, whatsapp_message:'', gstin:'', ...(initial||{}) })
  useEffect(()=>{ setF({ name:'Alankar Fashions', ...(initial||{}) }) }, [initial])
  const upload = useUpload()
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <F label="Brand name"><input value={f.name||''} onChange={e=>setF({...f,name:e.target.value})} className="w-full h-10 px-3 border border-border"/></F>
        <F label="Tagline (Marathi supported)"><input value={f.tagline||''} onChange={e=>setF({...f,tagline:e.target.value})} className="w-full h-10 px-3 border border-border font-devanagari"/></F>
        <F label="Support email"><input value={f.support_email||''} onChange={e=>setF({...f,support_email:e.target.value})} className="w-full h-10 px-3 border border-border"/></F>
        <F label="Support phone / WhatsApp"><input value={f.support_phone||''} onChange={e=>setF({...f,support_phone:e.target.value})} className="w-full h-10 px-3 border border-border"/></F>
        <div className="md:col-span-2"><F label="Store address"><input value={f.address||''} onChange={e=>setF({...f,address:e.target.value})} className="w-full h-10 px-3 border border-border"/></F></div>
        <F label="Instagram"><input value={f.instagram||''} onChange={e=>setF({...f,instagram:e.target.value})} className="w-full h-10 px-3 border border-border"/></F>
        <F label="Facebook"><input value={f.facebook||''} onChange={e=>setF({...f,facebook:e.target.value})} className="w-full h-10 px-3 border border-border"/></F>
        <F label="Google Business Profile URL"><input value={f.google_business||''} onChange={e=>setF({...f,google_business:e.target.value})} className="w-full h-10 px-3 border border-border"/></F>
        <F label="GSTIN (optional)"><input value={f.gstin||''} onChange={e=>setF({...f,gstin:e.target.value})} className="w-full h-10 px-3 border border-border font-mono"/></F>
        <F label="WhatsApp prefilled message"><input value={f.whatsapp_message||''} onChange={e=>setF({...f,whatsapp_message:e.target.value})} className="w-full h-10 px-3 border border-border"/></F>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <F label="Logo">
          <div className="flex items-center gap-3">
            {f.logo_url ? <img src={f.logo_url} alt="" className="h-16 border border-border bg-primary p-2"/> : <div className="h-16 w-24 border border-dashed border-border grid place-items-center text-xs text-muted-foreground">No logo</div>}
            <label className="inline-flex items-center gap-2 h-9 px-3 border border-border cursor-pointer text-xs uppercase tracking-widest"><Upload className="h-4 w-4"/> Upload<input type="file" accept="image/*" hidden onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const url = await upload(file); if (url) setF({...f, logo_url: url}) }}/></label>
            {f.logo_url && <button onClick={()=>setF({...f, logo_url: null})} className="text-xs text-destructive">Remove</button>}
          </div>
        </F>
        <F label="Favicon">
          <div className="flex items-center gap-3">
            {f.favicon_url ? <img src={f.favicon_url} alt="" className="h-10 w-10 border border-border"/> : <div className="h-10 w-10 border border-dashed border-border"/>}
            <label className="inline-flex items-center gap-2 h-9 px-3 border border-border cursor-pointer text-xs uppercase tracking-widest"><Upload className="h-4 w-4"/> Upload<input type="file" accept="image/*" hidden onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const url = await upload(file); if (url) setF({...f, favicon_url: url}) }}/></label>
          </div>
        </F>
      </div>
      <div><button onClick={()=>onSave(f)} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Save className="h-4 w-4"/> Save brand</button></div>
    </div>
  )
}

function RazorpayForm({ initial, onSave }){
  const [f,setF] = useState({ key_id:'', key_secret:'', webhook_secret:'', live_mode:false, ...(initial||{}) })
  useEffect(()=>{ setF({ key_id:'', key_secret:'', webhook_secret:'', live_mode:false, ...(initial||{}) }) }, [initial])
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <F label="Key ID"><input value={f.key_id||''} onChange={e=>setF({...f,key_id:e.target.value})} className="w-full h-10 px-3 border border-border font-mono text-sm"/></F>
      <F label="Key Secret"><input value={f.key_secret||''} onChange={e=>setF({...f,key_secret:e.target.value})} type="password" className="w-full h-10 px-3 border border-border font-mono text-sm"/></F>
      <div className="md:col-span-2"><F label="Webhook Secret"><input value={f.webhook_secret||''} onChange={e=>setF({...f,webhook_secret:e.target.value})} type="password" className="w-full h-10 px-3 border border-border font-mono text-sm"/></F></div>
      <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!f.live_mode} onChange={e=>setF({...f,live_mode:e.target.checked})}/> Live mode</label>
      <div className="md:col-span-2"><button onClick={()=>onSave(f)} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Save className="h-4 w-4"/> Save payment</button></div>
    </div>
  )
}

function AnalyticsForm({ initial, onSave }){
  const [f,setF] = useState({ meta_pixel_id:'', ga4_id:'', ...(initial||{}) })
  useEffect(()=>{ setF({ meta_pixel_id:'', ga4_id:'', ...(initial||{}) }) }, [initial])
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <F label="Meta Pixel ID"><input value={f.meta_pixel_id||''} onChange={e=>setF({...f,meta_pixel_id:e.target.value})} placeholder="e.g. 1234567890" className="w-full h-10 px-3 border border-border font-mono text-sm"/></F>
      <F label="Google Analytics 4 ID"><input value={f.ga4_id||''} onChange={e=>setF({...f,ga4_id:e.target.value})} placeholder="G-XXXXXXX" className="w-full h-10 px-3 border border-border font-mono text-sm"/></F>
      <div className="md:col-span-2"><button onClick={()=>onSave(f)} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Save className="h-4 w-4"/> Save analytics</button></div>
      <div className="md:col-span-2 text-xs text-muted-foreground">Changes take effect after a page refresh. Site-wide PageView is auto-tracked; product ViewContent/AddToCart/Purchase are tracked on the respective actions.</div>
    </div>
  )
}

function SEOForm({ initial, onSave }){
  const [f,setF] = useState({ description:'', gsc_verification:'', ...(initial||{}) })
  useEffect(()=>{ setF({ description:'', gsc_verification:'', ...(initial||{}) }) }, [initial])
  return (
    <div className="space-y-3">
      <F label="Default meta description"><textarea rows={3} value={f.description||''} onChange={e=>setF({...f,description:e.target.value})} className="w-full px-3 py-2 border border-border"/></F>
      <F label="Google Search Console verification (meta content value)"><input value={f.gsc_verification||''} onChange={e=>setF({...f,gsc_verification:e.target.value})} placeholder="Paste the value from the &lt;meta name='google-site-verification' content='...'/&gt; tag" className="w-full h-10 px-3 border border-border"/></F>
      <button onClick={()=>onSave(f)} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Save className="h-4 w-4"/> Save SEO</button>
    </div>
  )
}

function EmailTest({ defaultTo }){
  const [to,setTo] = useState(defaultTo||'')
  const [sending,setSending] = useState(false)
  const [result,setResult] = useState(null)
  useEffect(()=>{ if (defaultTo && !to) setTo(defaultTo) }, [defaultTo, to])
  const send = async () => {
    setSending(true); setResult(null)
    const r = await fetch('/api/admin/email-test', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ to }) })
    const d = await r.json()
    setSending(false); setResult(d)
    if (d.ok) toast.success('Test email sent'); else toast.error(d.error||'Failed to send')
  }
  return (
    <div className="flex gap-2 items-end">
      <F label="Send test email to"><input value={to} onChange={e=>setTo(e.target.value)} type="email" className="w-full h-10 px-3 border border-border"/></F>
      <button disabled={sending || !to} onClick={send} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest disabled:opacity-50"><Send className="h-4 w-4"/> {sending?'Sending…':'Send test'}</button>
      {result && <div className="text-xs text-muted-foreground">{result.ok ? `Sent (id: ${result.id})` : (result.error||'')}</div>}
    </div>
  )
}

function F({label, children}) { return <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label> }
