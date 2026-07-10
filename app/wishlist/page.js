'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { inr } from '@/lib/format'

function Wishlist(){
  const [items,setItems] = useState(null)
  useEffect(()=>{ fetch('/api/wishlist').then(r=>r.json()).then(d=>setItems(d.items||[])) },[])
  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-8 md:py-14">
        <h1 className="font-serif text-3xl md:text-4xl">Wishlist</h1>
        {items===null ? (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="skeleton aspect-[3/4]"/>) }</div>
        ) : items.length===0 ? (
          <div className="mt-8 text-muted-foreground">Your wishlist is empty. <Link href="/products" className="underline">Browse products</Link>.</div>
        ) : (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {items.map(p => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group">
                <div className="aspect-[3/4] bg-muted overflow-hidden"><img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:opacity-90"/></div>
                <div className="text-sm mt-2">{p.name}</div>
                <div className="text-sm font-semibold">{inr(p.discount_price||p.price)}</div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter/>
    </div>
  )
}
export default function Page(){ return <Wishlist/> }
