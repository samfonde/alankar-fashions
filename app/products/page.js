'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import ProductCard from '@/components/product-card'
import { SlidersHorizontal, X } from 'lucide-react'

function PLP() {
  const sp = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState(null)
  const [openFilters, setOpenFilters] = useState(false)
  const category = sp.get('category') || ''
  const filter = sp.get('filter') || ''
  const q = sp.get('q') || ''
  const sort = sp.get('sort') || 'newest'
  const min = sp.get('min') || ''
  const max = sp.get('max') || ''
  const size = sp.get('size') || ''
  const color = sp.get('color') || ''

  useEffect(() => {
    setProducts(null)
    const qs = new URLSearchParams()
    for (const [k,v] of sp.entries()) if (v) qs.set(k,v)
    fetch(`/api/products?${qs.toString()}`).then(r=>r.json()).then(d => setProducts(d.products||[]))
  }, [sp])

  const setParam = (k, v) => {
    const qs = new URLSearchParams(sp.toString())
    if (v) qs.set(k, v); else qs.delete(k)
    router.push(`/products?${qs.toString()}`)
  }
  const clearAll = () => router.push('/products' + (category ? `?category=${category}` : ''))

  const heading = q ? `Results for “${q}”` : filter === 'new' ? 'New Arrivals' : filter === 'trending' ? 'Trending Now' : filter === 'featured' ? 'Featured' : category ? category.charAt(0).toUpperCase()+category.slice(1) : 'Shop All'

  const sizes = ['XS','S','M','L','XL','30','32','34','36','UK 6','UK 7','UK 8','UK 9','UK 10']
  const colors = ['Black','White','Ivory','Camel','Navy','Charcoal','Cognac','Sage']

  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Shop</div>
            <h1 className="font-serif text-3xl md:text-5xl mt-2">{heading}</h1>
            {products && <div className="text-sm text-muted-foreground mt-2">{products.length} product{products.length!==1?'s':''}</div>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setOpenFilters(v=>!v)} className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm uppercase tracking-widest"><SlidersHorizontal className="h-4 w-4"/> Filters</button>
            <select value={sort} onChange={e=>setParam('sort', e.target.value)} className="h-10 px-3 border border-border bg-background text-sm">
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {openFilters && (
          <div className="mb-6 p-5 border border-border bg-card grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest mb-3">Price</div>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" defaultValue={min} onBlur={e=>setParam('min', e.target.value)} className="w-full h-10 px-3 border border-border"/>
                <input type="number" placeholder="Max" defaultValue={max} onBlur={e=>setParam('max', e.target.value)} className="w-full h-10 px-3 border border-border"/>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest mb-3">Size</div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button key={s} onClick={()=>setParam('size', size===s?'':s)} className={`px-3 py-1.5 text-xs border ${size===s?'bg-primary text-primary-foreground border-primary':'border-border'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest mb-3">Color</div>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button key={c} onClick={()=>setParam('color', color===c?'':c)} className={`px-3 py-1.5 text-xs border ${color===c?'bg-primary text-primary-foreground border-primary':'border-border'}`}>{c}</button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={clearAll} className="text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1"><X className="h-4 w-4"/> Clear filters</button>
            </div>
          </div>
        )}

        {products === null ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_,i)=><div key={i} className="skeleton aspect-[3/4]"/>) }
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-serif text-2xl">No products found</div>
            <p className="text-muted-foreground mt-2 mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={clearAll} className="px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-widest">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(p => <ProductCard key={p.id} p={p}/>)}
          </div>
        )}
      </main>
      <SiteFooter/>
    </div>
  )
}

export default function Page() { return <Suspense fallback={null}><PLP/></Suspense> }
