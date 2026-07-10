'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Copy, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function SetupPage(){
  const [status,setStatus] = useState('checking') // checking | needs_schema | ready
  const [sql,setSql] = useState('')
  const [adminForm,setAdminForm] = useState({ email:'admin@aurelia.local', password:'', token:'' })
  const [creating,setCreating] = useState(false)

  const check = async () => {
    setStatus('checking')
    try {
      const r = await fetch('/api/setup/check')
      const d = await r.json()
      setStatus(d.ready ? 'ready' : 'needs_schema')
    } catch { setStatus('needs_schema') }
  }

  useEffect(() => {
    check()
    fetch('/api/setup/schema').then(r=>r.text()).then(setSql)
  }, [])

  const copy = async () => { await navigator.clipboard.writeText(sql); toast.success('SQL copied to clipboard') }

  const projectRef = 'aelflqhophambreovyqj'
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`

  const createAdmin = async () => {
    setCreating(true)
    try {
      const r = await fetch('/api/admin/bootstrap', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(adminForm) })
      const d = await r.json()
      setCreating(false)
      if (!r.ok) return toast.error(d.error || 'Failed')
      toast.success('Admin created! Sign in below.')
    } catch { setCreating(false); toast.error('Failed') }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-tight py-10 max-w-3xl">
        <div className="text-center mb-10">
          <div className="font-serif text-3xl tracking-[0.25em]">AURELIA</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">One-time setup</div>
        </div>

        <div className="bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full grid place-items-center bg-primary text-primary-foreground text-sm font-medium">1</div>
            <h2 className="font-serif text-xl">Install database schema</h2>
            {status==='ready' && <CheckCircle2 className="h-5 w-5 text-emerald-600 ml-auto"/>}
            {status==='needs_schema' && <AlertCircle className="h-5 w-5 text-amber-600 ml-auto"/>}
            {status==='checking' && <Loader2 className="h-5 w-5 animate-spin ml-auto"/>}
          </div>
          {status==='needs_schema' && (
            <>
              <p className="text-sm text-muted-foreground mb-4">Copy the SQL below and paste it into your Supabase SQL Editor. This creates all tables, RLS policies, seed data (products, categories, homepage sections, coupons) and the storage bucket. Safe to re-run.</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={copy} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Copy className="h-4 w-4"/> Copy SQL</button>
                <a href={sqlEditorUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-10 px-4 border border-border text-xs uppercase tracking-widest"><ExternalLink className="h-4 w-4"/> Open Supabase SQL Editor</a>
                <button onClick={check} className="inline-flex items-center gap-2 h-10 px-4 border border-border text-xs uppercase tracking-widest">Verify Installation</button>
              </div>
              <textarea readOnly value={sql} className="w-full h-64 p-3 border border-border font-mono text-xs bg-muted/40"/>
              <ol className="text-xs text-muted-foreground mt-3 space-y-1 list-decimal pl-4">
                <li>Click <strong>Open Supabase SQL Editor</strong> above (opens in a new tab).</li>
                <li>Click <strong>Copy SQL</strong>, then paste into the editor.</li>
                <li>Click <strong>Run</strong> in Supabase. You should see “Aurelia schema installed successfully”.</li>
                <li>Come back here and click <strong>Verify Installation</strong>.</li>
              </ol>
            </>
          )}
          {status==='ready' && <p className="text-sm text-emerald-800">Database is installed and ready.</p>}
        </div>

        <div className="bg-card border border-border p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full grid place-items-center bg-primary text-primary-foreground text-sm font-medium">2</div>
            <h2 className="font-serif text-xl">Your admin login (pre-provisioned)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">A default admin account has been created for you. It will be promoted to admin role automatically when the SQL above runs.</p>
          <div className="bg-muted/40 border border-border p-4 font-mono text-sm space-y-1">
            <div><span className="text-muted-foreground">URL:</span> <a href="/admin/login" className="underline">/admin/login</a></div>
            <div><span className="text-muted-foreground">Email:</span> admin@aurelia.local</div>
            <div><span className="text-muted-foreground">Password:</span> AureliaAdmin!2026</div>
          </div>
          <details className="mt-4">
            <summary className="text-xs uppercase tracking-widest text-muted-foreground cursor-pointer">Create additional admins</summary>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-3">Use bootstrap token (last 8 chars of your Supabase service role key).</p>
              <div className="grid md:grid-cols-2 gap-3">
                <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span><input value={adminForm.email} onChange={e=>setAdminForm({...adminForm,email:e.target.value})} className="mt-1 w-full h-10 px-3 border border-border"/></label>
                <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span><input type="password" value={adminForm.password} onChange={e=>setAdminForm({...adminForm,password:e.target.value})} className="mt-1 w-full h-10 px-3 border border-border"/></label>
                <label className="block md:col-span-2"><span className="text-xs uppercase tracking-widest text-muted-foreground">Bootstrap Token</span><input value={adminForm.token} onChange={e=>setAdminForm({...adminForm,token:e.target.value})} className="mt-1 w-full h-10 px-3 border border-border font-mono"/></label>
              </div>
              <button disabled={creating || status!=='ready'} onClick={createAdmin} className="mt-4 h-10 px-5 bg-primary text-primary-foreground text-xs uppercase tracking-widest disabled:opacity-50">{creating?'Creating…':'Create Additional Admin'}</button>
            </div>
          </details>
        </div>

        <div className="bg-card border border-border p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full grid place-items-center bg-primary text-primary-foreground text-sm font-medium">3</div>
            <h2 className="font-serif text-xl">You’re ready to launch</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest">Visit Storefront</Link>
            <Link href="/admin/login" className="inline-flex items-center gap-2 h-10 px-4 border border-border text-xs uppercase tracking-widest">Admin Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
