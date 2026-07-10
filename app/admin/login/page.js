'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBootstrap, setShowBootstrap] = useState(false)
  const [token, setToken] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    const sb = getSupabaseBrowser()
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) { setLoading(false); return toast.error(error.message) }
    // Verify admin
    const r = await fetch('/api/auth/me').then(r=>r.json())
    if (r.profile?.role !== 'admin') {
      setLoading(false)
      if (!r.profile) { toast.error('Database not ready. Redirecting to setup…'); router.push('/setup'); return }
      await sb.auth.signOut(); return toast.error('You are not an admin.')
    }
    toast.success('Welcome, admin')
    setLoading(false)
    router.push('/admin')
  }

  const bootstrap = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const r = await fetch('/api/admin/bootstrap', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, token }) })
      const d = await r.json()
      if (!r.ok) { setLoading(false); return toast.error(d.error || 'Failed') }
      toast.success('Admin created. Please sign in.')
      setShowBootstrap(false); setLoading(false)
    } catch { setLoading(false); toast.error('Failed') }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-primary text-primary-foreground p-4">
      <div className="w-full max-w-md bg-background text-foreground p-8">
        <div className="text-center">
          <div className="font-serif text-2xl tracking-[0.25em]">AURELIA</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Admin Portal</div>
        </div>
        {!showBootstrap ? (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm"/></label>
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
              <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm"/></label>
            <button disabled={loading} className="w-full h-11 bg-primary text-primary-foreground text-sm uppercase tracking-widest">{loading?'Signing in…':'Sign In'}</button>
            <button type="button" onClick={()=>setShowBootstrap(true)} className="w-full text-xs text-muted-foreground underline mt-2">First-time setup: create admin account</button>
          </form>
        ) : (
          <form onSubmit={bootstrap} className="mt-8 space-y-4">
            <p className="text-xs text-muted-foreground">One-time admin creation. Requires bootstrap token (last 8 chars of SUPABASE_SERVICE_ROLE_KEY).</p>
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Admin email</span>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm"/></label>
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Password (min 6)</span>
              <input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm"/></label>
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Bootstrap token</span>
              <input required value={token} onChange={e=>setToken(e.target.value)} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm font-mono"/></label>
            <button disabled={loading} className="w-full h-11 bg-primary text-primary-foreground text-sm uppercase tracking-widest">{loading?'Creating…':'Create Admin'}</button>
            <button type="button" onClick={()=>setShowBootstrap(false)} className="w-full text-xs text-muted-foreground underline">Back to sign in</button>
          </form>
        )}
      </div>
    </div>
  )
}
