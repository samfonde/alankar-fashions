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
  const [gLoading, setGLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    const sb = getSupabaseBrowser()
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Welcome back')
    router.push(next)
  }
  const google = async () => {
    setGLoading(true)
    const sb = getSupabaseBrowser()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` }
    })
    if (error) { setGLoading(false); toast.error(error.message) }
  }
  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <h1 className="font-serif text-3xl text-center">Welcome back</h1>
          <p className="text-sm text-muted-foreground text-center mt-2">Sign in to your Alankar Fashions account</p>
          <button onClick={google} disabled={gLoading} type="button" className="mt-8 w-full h-12 border border-border bg-background text-sm inline-flex items-center justify-center gap-3 hover:bg-muted disabled:opacity-60" data-testid="google-login-btn">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            {gLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>
          <div className="my-6 flex items-center gap-4"><div className="flex-1 h-px bg-border"/><span className="text-xs uppercase tracking-widest text-muted-foreground">or</span><div className="flex-1 h-px bg-border"/></div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm" data-testid="login-email"/></label>
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
              <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm" data-testid="login-password"/></label>
            <button disabled={loading} className="w-full h-12 bg-primary text-primary-foreground text-sm uppercase tracking-widest" data-testid="login-submit">{loading?'Signing in…':'Sign In'}</button>
          </form>
          <div className="text-sm text-center mt-6 text-muted-foreground">New to Alankar Fashions? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="underline text-foreground">Create an account</Link></div>
        </div>
      </main>
      <SiteFooter/>
    </div>
  )
}
export default function Page() { return <Suspense fallback={null}><Login/></Suspense> }
