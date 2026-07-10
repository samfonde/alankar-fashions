'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { toast } from 'sonner'

function Login() {
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/account'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    const sb = getSupabaseBrowser()
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Welcome back')
    // Sync cookies via server route (already synced by supabase-js)
    router.push(next)
  }
  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <h1 className="font-serif text-3xl text-center">Welcome back</h1>
          <p className="text-sm text-muted-foreground text-center mt-2">Sign in to your Aurelia account</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm"/></label>
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
              <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm"/></label>
            <button disabled={loading} className="w-full h-12 bg-primary text-primary-foreground text-sm uppercase tracking-widest">{loading?'Signing in…':'Sign In'}</button>
          </form>
          <div className="text-sm text-center mt-6 text-muted-foreground">New to Aurelia? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="underline text-foreground">Create an account</Link></div>
        </div>
      </main>
      <SiteFooter/>
    </div>
  )
}
export default function Page() { return <Suspense fallback={null}><Login/></Suspense> }
