'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { toast } from 'sonner'

function Signup() {
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/account'
  const [form, setForm] = useState({ fullName:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    const sb = getSupabaseBrowser()
    const { data, error } = await sb.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.fullName } } })
    setLoading(false)
    if (error) return toast.error(error.message)
    if (data.session) { toast.success('Account created'); router.push(next) }
    else { toast.success('Check your email to verify your account.'); router.push('/login') }
  }
  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <h1 className="font-serif text-3xl text-center">Create your account</h1>
          <p className="text-sm text-muted-foreground text-center mt-2">Faster checkout, order tracking & wishlist</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Full name</span>
              <input required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm"/></label>
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm"/></label>
            <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Password (min 6)</span>
              <input required minLength={6} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-1 w-full h-11 px-3 border border-border bg-background text-sm"/></label>
            <button disabled={loading} className="w-full h-12 bg-primary text-primary-foreground text-sm uppercase tracking-widest">{loading?'Creating…':'Create Account'}</button>
          </form>
          <div className="text-sm text-center mt-6 text-muted-foreground">Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline text-foreground">Sign in</Link></div>
        </div>
      </main>
      <SiteFooter/>
    </div>
  )
}
export default function Page() { return <Suspense fallback={null}><Signup/></Suspense> }
