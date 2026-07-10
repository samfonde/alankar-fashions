'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Image, Settings, LogOut, Menu, X, Layers } from 'lucide-react'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { toast } from 'sonner'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') { setLoading(false); return }
    fetch('/api/auth/me').then(r=>r.json()).then(d => {
      if (!d.user || d.profile?.role !== 'admin') { router.replace('/admin/login'); return }
      setProfile(d.profile); setLoading(false)
    })
  }, [pathname, router])

  const logout = async () => { await getSupabaseBrowser().auth.signOut(); toast.success('Signed out'); router.push('/admin/login') }

  if (pathname === '/admin/login') return children
  if (loading) return <div className="min-h-screen grid place-items-center bg-background"><div className="text-sm text-muted-foreground">Loading admin…</div></div>

  const nav = [
    ['Dashboard', '/admin', LayoutDashboard],
    ['Products', '/admin/products', Package],
    ['Categories', '/admin/categories', Layers],
    ['Orders', '/admin/orders', ShoppingCart],
    ['Customers', '/admin/customers', Users],
    ['Coupons', '/admin/coupons', Tag],
    ['Homepage', '/admin/homepage', Image],
    ['Settings', '/admin/settings', Settings],
  ]

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground transform ${open?'translate-x-0':'-translate-x-full'} lg:translate-x-0 transition-transform`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border">
          <Link href="/admin" className="font-serif tracking-[0.25em] text-lg">AURELIA</Link>
          <button className="lg:hidden" onClick={()=>setOpen(false)}><X className="h-5 w-5"/></button>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map(([l,h,I]) => {
            const active = pathname === h || (h !== '/admin' && pathname.startsWith(h))
            return <Link key={h} href={h} onClick={()=>setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground':'hover:bg-sidebar-accent/60'}`}><I className="h-4 w-4"/> {l}</Link>
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs opacity-70 truncate">{profile?.email}</div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-sidebar-accent/60 rounded-sm"><LogOut className="h-4 w-4"/> Sign Out</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="h-14 bg-background border-b border-border flex items-center px-4 lg:px-8 gap-3">
          <button className="lg:hidden" onClick={()=>setOpen(true)}><Menu className="h-5 w-5"/></button>
          <div className="font-medium">Admin Panel</div>
          <div className="ml-auto text-sm"><Link href="/" className="text-muted-foreground hover:text-foreground">View storefront →</Link></div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
