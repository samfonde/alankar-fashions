'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import WhatsAppFab from '@/components/whatsapp-fab'
import ProductCard from '@/components/product-card'
import { ArrowRight } from 'lucide-react'

function Hero({ data }) {
  const [idx, setIdx] = useState(0)
  const slides = data?.slides || []
  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setIdx(i => (i+1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [slides.length])
  if (!slides.length) return null
  const s = slides[idx]
  return (
    <section className="relative h-[70vh] md:h-[86vh] w-full overflow-hidden bg-primary">
      {slides.map((sl, i) => (
        <img key={i} src={sl.image} alt={sl.heading} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i===idx?'opacity-100':'opacity-0'}`}/>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10"/>
      <div className="relative h-full flex items-end md:items-center">
        <div className="container-tight pb-16 md:pb-0">
          <div className="max-w-xl text-white">
            <div className="text-xs md:text-sm uppercase tracking-[0.35em] opacity-80">{new Date().getFullYear()} Collection</div>
            <h1 className="font-serif text-4xl md:text-6xl leading-tight mt-3">{s.heading}</h1>
            <p className="mt-4 text-base md:text-lg opacity-90">{s.subheading}</p>
            <Link href={s.cta_link || '/products'} className="inline-flex items-center gap-2 mt-8 bg-white text-primary px-6 py-3 text-sm uppercase tracking-widest hover:bg-white/90 transition">
              {s.cta_label || 'Shop Now'} <ArrowRight className="h-4 w-4"/>
            </Link>
          </div>
        </div>
      </div>
      {slides.length>1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_,i)=>(<button key={i} onClick={()=>setIdx(i)} className={`h-1 transition-all ${i===idx?'w-10 bg-white':'w-5 bg-white/50'}`} aria-label={`slide ${i+1}`}/>))}
        </div>
      )}
    </section>
  )
}

function CategoryGrid({ data }) {
  const items = data?.items || []
  if (!items.length) return null
  return (
    <section className="container-tight py-14 md:py-20">
      <div className="text-center mb-10">
        <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Shop by</div>
        <h2 className="font-serif text-3xl md:text-4xl mt-2">Categories</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map(c => (
          <Link key={c.title} href={c.link} className="group relative aspect-[3/4] overflow-hidden bg-muted">
            <img src={c.image} alt={c.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <div className="font-serif text-xl">{c.title}</div>
              <div className="text-xs uppercase tracking-widest opacity-80 mt-1 flex items-center gap-1">Shop Now <ArrowRight className="h-3 w-3"/></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProductStrip({ title, products }) {
  if (!products?.length) return null
  return (
    <section className="container-tight py-10 md:py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Curated</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-2">{title}</h2>
        </div>
        <Link href="/products" className="hidden md:inline-flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-70">View All <ArrowRight className="h-4 w-4"/></Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map(p => <ProductCard key={p.id} p={p}/>)}
      </div>
    </section>
  )
}

function Editorial({ data }) {
  if (!data) return null
  return (
    <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-primary">
      <img src={data.image} alt={data.heading} className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0 bg-black/40"/>
      <div className="relative h-full flex items-center">
        <div className="container-tight text-white text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl">{data.heading}</h2>
          <p className="mt-4 opacity-90">{data.subheading}</p>
          {data.cta_label && <Link href={data.cta_link||'/products'} className="inline-flex items-center gap-2 mt-6 bg-white text-primary px-6 py-3 text-sm uppercase tracking-widest">{data.cta_label}</Link>}
        </div>
      </div>
    </section>
  )
}

function Benefits(){
  const items = [
    { t:'Free Shipping', s:'On orders above ₹999' },
    { t:'Easy Returns', s:'15-day hassle-free returns' },
    { t:'Secure Payment', s:'UPI · Cards · Netbanking' },
    { t:'100% Authentic', s:'Direct from the brand' },
  ]
  return (
    <section className="container-tight grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-y border-border/60">
      {items.map(i => (
        <div key={i.t} className="text-center">
          <div className="font-medium text-sm uppercase tracking-widest">{i.t}</div>
          <div className="text-xs text-muted-foreground mt-1">{i.s}</div>
        </div>
      ))}
    </section>
  )
}

function Home() {
  const [sections, setSections] = useState(null)
  const [needsSetup, setNeedsSetup] = useState(false)
  useEffect(() => {
    fetch('/api/homepage').then(r=>r.json()).then(d => {
      if (Array.isArray(d.sections)) setSections(d.sections)
      else setSections([])
    }).catch(()=>setSections([]))
    fetch('/api/setup/check').then(r=>r.json()).then(d => setNeedsSetup(!d.ready)).catch(()=>{})
  }, [])

  if (needsSetup) return (
    <section className="container-tight py-20 text-center">
      <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Almost there</div>
      <h1 className="font-serif text-4xl md:text-5xl mt-3">Complete setup to launch your store</h1>
      <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Your database needs a one-time schema install. It takes ~30 seconds and installs everything: tables, security policies, seed products and homepage content.</p>
      <a href="/setup" className="inline-flex items-center gap-2 mt-8 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-widest">Go to Setup</a>
    </section>
  )

  if (!sections) return (
    <div className="space-y-4">
      <div className="skeleton h-[70vh] w-full"/>
      <div className="container-tight grid grid-cols-2 md:grid-cols-4 gap-4 py-10">
        {[...Array(8)].map((_,i)=><div key={i} className="skeleton aspect-[3/4]"/>) }
      </div>
    </div>
  )

  return (
    <>
      {sections.map(s => {
        if (s.section_key === 'announcement_bar') return null
        if (s.section_type === 'hero') return <Hero key={s.id} data={s.data}/>
        if (s.section_type === 'categories') return <CategoryGrid key={s.id} data={s.data}/>
        if (s.section_type === 'products') return <ProductStrip key={s.id} title={s.title} products={s.products}/>
        if (s.section_type === 'editorial') return <Editorial key={s.id} data={s.data}/>
        return null
      })}
      <Benefits/>
    </>
  )
}

function App() {
  return (
    <div>
      <SiteHeader/>
      <main><Home/></main>
      <SiteFooter/>
      <WhatsAppFab/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context':'https://schema.org','@type':'LocalBusiness',name:'Alankar Fashions',image:(process.env.NEXT_PUBLIC_BASE_URL||'')+'/favicon.svg',
        telephone:'+91 96570 93006',email:'hello@alankarfashions.com',priceRange:'₹₹',currenciesAccepted:'INR',
        address:{'@type':'PostalAddress',streetAddress:'Shop No 1, 1354 B Ward, near Khari Corner, Mangalwar Peth',addressLocality:'Kolhapur',addressRegion:'Maharashtra',postalCode:'416012',addressCountry:'IN'},
        sameAs:['https://www.instagram.com/alankar_fashions_kop/','https://www.facebook.com/AlankarFashion/']
      }) }}/>
    </div>
  )
}

export default App
