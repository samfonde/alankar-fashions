'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { inr, dateFmt } from '@/lib/format'
import { toast } from 'sonner'

function Account() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('orders')
  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.json()).then(d => { if (!d.user) return router.replace('/login'); setUser(d.user); setProfile(d.profile) })
    fetch('/api/orders').then(r=>r.json()).then(d => setOrders(d.orders||[]))
  }, [router])
  const logout = async () => { await getSupabaseBrowser().auth.signOut(); toast.success('Signed out'); router.push('/') }
  if (!user) return null
  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-8 md:py-14">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Account</div>
            <h1 className="font-serif text-3xl md:text-4xl mt-2">Hi, {profile?.full_name || user.email}</h1>
          </div>
          <button onClick={logout} className="text-xs uppercase tracking-widest border border-border px-4 py-2">Sign Out</button>
        </div>
        <div className="mt-8 flex gap-6 border-b border-border/60 text-xs uppercase tracking-widest">
          {[['orders','Orders'],['profile','Profile'],['wishlist','Wishlist']].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} className={`pb-3 ${tab===k?'border-b-2 border-primary':''}`}>{l}</button>
          ))}
        </div>
        {tab==='orders' && (
          <div className="mt-8 space-y-4">
            {orders.length===0 ? <div className="text-muted-foreground">No orders yet. <Link href="/products" className="underline">Start shopping</Link>.</div> : orders.map(o => (
              <Link key={o.id} href={`/orders/${o.id}`} className="block border border-border p-5 hover:bg-muted/40 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{o.order_number}</div>
                    <div className="text-xs text-muted-foreground">{dateFmt(o.created_at)} · {o.items?.length || 0} item{o.items?.length!==1?'s':''}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{inr(o.total)}</div>
                    <div className="text-xs uppercase tracking-widest">{o.status}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {tab==='profile' && (
          <div className="mt-8 max-w-lg space-y-3">
            <div><span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span><div>{user.email}</div></div>
            <div><span className="text-xs uppercase tracking-widest text-muted-foreground">Name</span><div>{profile?.full_name || '—'}</div></div>
            <div><span className="text-xs uppercase tracking-widest text-muted-foreground">Role</span><div className="capitalize">{profile?.role || 'customer'}</div></div>
          </div>
        )}
        {tab==='wishlist' && <WishlistTab/>}
      </main>
      <SiteFooter/>
    </div>
  )
}

function WishlistTab(){
  const [items,setItems] = useState(null)
  useEffect(()=>{ fetch('/api/wishlist').then(r=>r.json()).then(d=>setItems(d.items||[])) },[])
  if (items===null) return <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="skeleton aspect-[3/4]"/>) }</div>
  if (!items.length) return <div className="mt-8 text-muted-foreground">Your wishlist is empty.</div>
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {items.map(p => (
        <Link key={p.id} href={`/products/${p.slug}`} className="group">
          <div className="aspect-[3/4] bg-muted overflow-hidden"><img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:opacity-90"/></div>
          <div className="text-sm mt-2">{p.name}</div>
          <div className="text-sm font-semibold">{inr(p.discount_price||p.price)}</div>
        </Link>
      ))}
    </div>
  )
}

export default function Page() { return <Account/> }
