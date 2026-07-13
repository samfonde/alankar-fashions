'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Search, ShoppingBag, User, Heart, Menu, X, MapPin, Phone, Plus, Minus } from 'lucide-react'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/brand-logo'

const NAV = [
  { label: 'Pearls', href: '/products?category=pearls', subs: [ ['Chinchpeti','chinchpeti'], ['Tanmani','tanmani'], ['Nakelace','nakelace'] ] },
  { label: 'Traditionals', href: '/products?category=traditionals', subs: [ ['Kolhapuri Saj','kolhapuri-saj'], ['Thushi','thushi'], ['Jondhale Pot','jondhale-pot'], ['Vjratik','vjratik'] ] },
  { label: 'Necklace', href: '/products?category=necklace', subs: [ ['Short','short'], ['Long','long'], ['Kundan','kundan'], ['Short AD','short-ad-necklace'] ] },
  { label: 'Bangles', href: '/products?category=bangles', subs: [ ['Golden','golden'], ['Silver','silver'] ] },
  { label: 'Earrings', href: '/products?category=earrings' },
  { label: 'New', href: '/products?filter=new' },
]

export default function SiteHeader() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [openSearch, setOpenSearch] = useState(false)
  const [q, setQ] = useState('')
  const [suggest, setSuggest] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [hoverIdx, setHoverIdx] = useState(-1)
  const [openSubs, setOpenSubs] = useState({}) // { [categoryLabel]: true/false } — which mobile submenus are expanded
  const router = useRouter()

  useEffect(() => {
    const sb = getSupabaseBrowser()
    sb.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user || null))
    return () => sub.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!user) { setProfile(null); return }
    fetch('/api/auth/me').then(r=>r.json()).then(d => setProfile(d.profile)).catch(()=>{})
  }, [user])
  useEffect(() => {
    const load = () => { try { const c = JSON.parse(localStorage.getItem('cart') || '[]'); setCartCount(c.reduce((s,i)=>s+i.quantity,0)) } catch { setCartCount(0) } }
    load(); window.addEventListener('cart:updated', load); window.addEventListener('storage', load)
    return () => { window.removeEventListener('cart:updated', load); window.removeEventListener('storage', load) }
  }, [])
  useEffect(() => {
    fetch('/api/homepage').then(r=>r.json()).then(d => {
      const a = (d.sections||[]).find(s => s.section_key === 'announcement_bar')
      if (a?.is_active) setAnnouncement(a.data?.text || '')
    }).catch(()=>{})
  }, [])
  useEffect(() => {
    if (q.length < 2) { setSuggest([]); return }
    const t = setTimeout(() => { fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`).then(r=>r.json()).then(d => setSuggest(d.items||[])) }, 200)
    return () => clearTimeout(t)
  }, [q])
  // Lock body scroll while the mobile menu drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const submitSearch = (e) => { e.preventDefault(); if (q.trim()) { router.push(`/products?q=${encodeURIComponent(q.trim())}`); setOpenSearch(false); setMobileOpen(false) } }
  const isAdmin = profile?.role === 'admin'
  const openCart = () => window.dispatchEvent(new Event('cart:open'))
  const toggleSub = (label) => setOpenSubs(prev => ({ ...prev, [label]: !prev[label] }))

  return (
    <>
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/60">
      {announcement && (<div className="bg-primary text-primary-foreground text-xs text-center py-2 px-4 tracking-wider">{announcement}</div>)}
      <div className="hidden md:flex bg-primary/95 text-primary-foreground text-[11px]">
        <div className="container-tight py-2 flex items-center justify-between">
          <div className="flex items-center gap-4 opacity-90"><span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> Mangalwar Peth, Kolhapur</span><a href="tel:+919657093006" className="flex items-center gap-1 hover:opacity-100"><Phone className="h-3 w-3"/> +91 96570 93006</a></div>
          <div className="opacity-90">Free shipping across India · COD available · WhatsApp us for custom orders</div>
        </div>
      </div>
      <div className="container-tight">
        <div className="flex items-center justify-between h-20 md:h-24 gap-4">
          <button className="md:hidden -ml-2 p-2" onClick={()=>setMobileOpen(true)} aria-label="Menu"><Menu className="h-5 w-5"/></button>
          <Link href="/" className="flex-shrink-0"><BrandLogo variant="light" size="md"/></Link>
          <nav className="hidden md:flex items-center gap-7 text-sm" onMouseLeave={()=>setHoverIdx(-1)}>
            {NAV.map((n,i) => (
              <div key={n.label} className="relative" onMouseEnter={()=>setHoverIdx(i)}>
                <Link href={n.href} className="hover:text-gold-500 transition py-6">{n.label}</Link>
                {n.subs && hoverIdx===i && (
                  <div className="absolute left-0 top-full bg-background border border-border shadow-lg py-2 min-w-[180px]">
                    {n.subs.map(([label,slug]) => (
                      <Link key={slug} href={`/products?category=${slug}`} className="block px-4 py-2 text-sm hover:bg-muted">{label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <button aria-label="Search" onClick={()=>setOpenSearch(v=>!v)} className="p-2 hover:opacity-70"><Search className="h-5 w-5"/></button>
            <Link href={user ? '/account' : '/login'} aria-label="Account" className="p-2 hover:opacity-70"><User className="h-5 w-5"/></Link>
            <Link href="/wishlist" aria-label="Wishlist" className="hidden sm:inline-flex p-2 hover:opacity-70"><Heart className="h-5 w-5"/></Link>
            <button aria-label="Cart" onClick={openCart} className="relative p-2 hover:opacity-70"><ShoppingBag className="h-5 w-5"/>{cartCount>0 && <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-primary-foreground rounded-full text-[10px] w-5 h-5 grid place-items-center font-medium">{cartCount}</span>}</button>
          </div>
        </div>
        {openSearch && (
          <div className="pb-4">
            <form onSubmit={submitSearch} className="relative">
              <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search jewellery…" className="w-full h-12 pl-10 pr-4 border border-border rounded-sm bg-background"/>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            </form>
            {suggest.length>0 && (
              <div className="mt-2 border border-border rounded-sm bg-card divide-y divide-border">
                {suggest.map(s => (<Link key={s.slug} href={`/products/${s.slug}`} className="flex items-center gap-3 p-2 hover:bg-muted" onClick={()=>setOpenSearch(false)}><img src={s.images?.[0]} alt="" className="w-10 h-12 object-cover"/><span className="text-sm">{s.name}</span></Link>))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>

      {/* Backdrop overlay — inline styles to bypass any Tailwind JIT class-detection issues */}
      <div
        onClick={()=>setMobileOpen(false)}
        aria-hidden="true"
        data-testid="mobile-menu-backdrop"
        className="md:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 998,
          backgroundColor: 'rgba(0,0,0,0.55)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity 280ms ease-out',
        }}
      />

      {/* Mobile menu drawer — solid opaque background (fixed: was an invalid CSS var() causing transparency) */}
      <div
        role="dialog"
        aria-label="Main menu"
        aria-hidden={!mobileOpen}
        data-testid="mobile-menu-drawer"
        className="md:hidden"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 999,
          width: '85%',
          maxWidth: '384px',
          backgroundColor: 'hsl(var(--background))',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform',
        }}
      >
        {/* Sticky logo header — stays pinned at top while the nav list below it scrolls */}
        <div
          className="flex items-center justify-between h-16 border-b border-border px-4"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: 'hsl(var(--background))',
          }}
        >
          <BrandLogo variant="light" size="sm"/>
          <button onClick={()=>setMobileOpen(false)} aria-label="Close" className="p-2 -mr-2" data-testid="mobile-menu-close"><X className="h-6 w-6"/></button>
        </div>

        <nav className="flex flex-col p-2 text-base">
          {NAV.map(n => {
            const expanded = !!openSubs[n.label]
            return (
              <div key={n.label} className="border-b border-border/60">
                <div className="flex items-center justify-between">
                  <Link href={n.href} onClick={()=>setMobileOpen(false)} className="flex-1 py-3 px-2">{n.label}</Link>
                  {n.subs && (
                    <button
                      onClick={()=>toggleSub(n.label)}
                      aria-label={expanded ? `Collapse ${n.label}` : `Expand ${n.label}`}
                      aria-expanded={expanded}
                      className="p-3 text-muted-foreground"
                    >
                      {expanded ? <Minus className="h-4 w-4"/> : <Plus className="h-4 w-4"/>}
                    </button>
                  )}
                </div>
                {n.subs && (
                  <div
                    style={{
                      maxHeight: expanded ? `${n.subs.length * 44 + 8}px` : '0px',
                      overflow: 'hidden',
                      transition: 'max-height 250ms ease-out',
                    }}
                  >
                    <div className="pl-4 pb-2">
                      {n.subs.map(([l,s]) => (
                        <Link key={s} href={`/products?category=${s}`} onClick={()=>setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground">{l}</Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <Link href={user ? '/account' : '/login'} onClick={()=>setMobileOpen(false)} className="py-3 px-2 border-b border-border/60">Account</Link>
          <Link href="/wishlist" onClick={()=>setMobileOpen(false)} className="py-3 px-2 border-b border-border/60">Wishlist</Link>
        </nav>
      </div>
    </>
  )
}
