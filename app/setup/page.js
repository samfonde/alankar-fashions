'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Copy, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function SetupPage(){
  const [status,setStatus] = useState('checking') // checking | needs_schema | needs_migration | ready
  const [schemaSQL,setSchemaSQL] = useState('')
  const [migrationSQL,setMigrationSQL] = useState('')

  const check = async () => {
    setStatus('checking')
    try {
      const r = await fetch('/api/setup/check'); const d = await r.json()
      if (!d.ready) setStatus('needs_schema')
      else if (!d.migrated) setStatus('needs_migration')
      else setStatus('ready')
    } catch { setStatus('needs_schema') }
  }

  useEffect(() => {
    check()
    fetch('/api/setup/schema').then(r=>r.text()).then(setSchemaSQL)
    fetch('/api/setup/migration').then(r=>r.text()).then(setMigrationSQL)
  }, [])

  const projectRef = 'aelflqhophambreovyqj'
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`
  const copy = async (text, label) => { await navigator.clipboard.writeText(text); toast.success(`${label} copied`) }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-tight py-10 max-w-3xl">
        <div className="text-center mb-10">
          <div className="font-serif text-3xl tracking-[0.15em] text-primary">ALANKAR FASHIONS</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">One-time setup</div>
        </div>

        <StepCard step={1} title="Install base schema" state={status==='needs_schema'?'active':status==='checking'?'checking':'done'}>
          {status==='needs_schema' && (
            <>
              <p className="text-sm text-muted-foreground mb-4">Creates tables, RLS policies, storage bucket. Safe to re-run.</p>
              <ActionRow onCopy={()=>copy(schemaSQL,'Schema SQL')} sqlEditorUrl={sqlEditorUrl} onCheck={check}/>
              <textarea readOnly value={schemaSQL} className="w-full h-40 p-3 border border-border font-mono text-xs bg-muted/40 mt-3"/>
            </>
          )}
        </StepCard>

        <StepCard step={2} title="Apply Alankar rebrand migration" state={status==='needs_migration'?'active':status==='ready'?'done':'pending'}>
          {status!=='needs_schema' && status!=='ready' && (
            <>
              <p className="text-sm text-muted-foreground mb-4">Reseeds jewellery categories (Pearls, Traditionals, Necklace, Bangles, Earrings + subcategories), seeds 13 jewellery products, updates homepage sections & brand settings. Safe to re-run.</p>
              <ActionRow onCopy={()=>copy(migrationSQL,'Migration SQL')} sqlEditorUrl={sqlEditorUrl} onCheck={check}/>
              <textarea readOnly value={migrationSQL} className="w-full h-40 p-3 border border-border font-mono text-xs bg-muted/40 mt-3"/>
            </>
          )}
          {status==='ready' && <p className="text-sm text-emerald-800">Database is fully installed and branded for Alankar Fashions.</p>}
        </StepCard>

        <div className="bg-card border border-border p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full grid place-items-center bg-primary text-primary-foreground text-sm font-medium">3</div>
            <h2 className="font-serif text-xl">Your admin login</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">A default admin account has been provisioned for you.</p>
          <div className="bg-muted/40 border border-border p-4 font-mono text-sm space-y-1">
            <div><span className="text-muted-foreground">URL:</span> <a href="/admin/login" className="underline">/admin/login</a></div>
            <div><span className="text-muted-foreground">Email:</span> admin@aurelia.local</div>
            <div><span className="text-muted-foreground">Password:</span> AureliaAdmin!2026</div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Change your password after first login. To create a real branded email like admin@alankarfashions.com, sign up in the store then promote the user to admin via SQL or the bootstrap flow.</p>
        </div>

        <div className="bg-card border border-border p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full grid place-items-center bg-primary text-primary-foreground text-sm font-medium">4</div>
            <h2 className="font-serif text-xl">You’re ready</h2>
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

function StepCard({ step, title, state, children }){
  const iconColor = state==='done' ? 'text-emerald-600' : state==='active' ? 'text-amber-600' : 'text-muted-foreground'
  const Icon = state==='done' ? CheckCircle2 : state==='checking' ? Loader2 : AlertCircle
  return (
    <div className={`bg-card border border-border p-6 mt-6 ${state==='pending'?'opacity-60':''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-8 w-8 rounded-full grid place-items-center ${state==='done'?'bg-emerald-600':'bg-primary'} text-primary-foreground text-sm font-medium`}>{step}</div>
        <h2 className="font-serif text-xl">{title}</h2>
        <Icon className={`h-5 w-5 ml-auto ${iconColor} ${state==='checking'?'animate-spin':''}`}/>
      </div>
      {children}
    </div>
  )
}

function ActionRow({ onCopy, sqlEditorUrl, onCheck }){
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onCopy} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Copy className="h-4 w-4"/> Copy SQL</button>
      <a href={sqlEditorUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-10 px-4 border border-border text-xs uppercase tracking-widest"><ExternalLink className="h-4 w-4"/> Open Supabase SQL Editor</a>
      <button onClick={onCheck} className="inline-flex items-center gap-2 h-10 px-4 border border-border text-xs uppercase tracking-widest">Verify</button>
    </div>
  )
}
