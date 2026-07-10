'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { inr } from '@/lib/format'
import { toast } from 'sonner'

export default function ProductCard({ p }) {
  const [wish, setWish] = useState(false)
  const img = p.images?.[0] || 'https://images.unsplash.com/photo-1596993100471-c3905dafa78e?w=800'
  const img2 = p.images?.[1]
  const discount = p.discount_price && p.price > p.discount_price ? Math.round((1 - p.discount_price / p.price) * 100) : 0
  const toggleWish = async (e) => {
    e.preventDefault()
    try {
      const r = await fetch('/api/wishlist/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: p.id }) })
      const d = await r.json()
      if (r.status === 401) { toast.error('Please login to save items'); return }
      setWish(d.inWishlist); toast.success(d.inWishlist ? 'Added to wishlist' : 'Removed from wishlist')
    } catch { toast.error('Something went wrong') }
  }
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img src={img} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" loading="lazy"/>
        {img2 && <img src={img2} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" loading="lazy"/>}
        {discount > 0 && <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-destructive text-destructive-foreground px-2 py-1">-{discount}%</span>}
        {p.is_new && <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-2 py-1" style={{top: discount?36:12}}>New</span>}
        <button onClick={toggleWish} className="absolute top-3 right-3 h-9 w-9 grid place-items-center bg-background/80 rounded-full hover:bg-background transition" aria-label="Wishlist">
          <Heart className={`h-4 w-4 ${wish ? 'fill-primary text-primary' : ''}`}/>
        </button>
      </div>
      <div className="pt-3 space-y-1">
        <div className="text-sm font-medium line-clamp-1">{p.name}</div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">{inr(p.discount_price || p.price)}</span>
          {discount>0 && <span className="text-muted-foreground line-through text-xs">{inr(p.price)}</span>}
        </div>
        {p.rating_avg > 0 && <div className="text-xs text-muted-foreground">★ {Number(p.rating_avg).toFixed(1)} ({p.rating_count || 0})</div>}
      </div>
    </Link>
  )
}
