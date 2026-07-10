'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Instagram, Facebook, MapPin, Phone, MessageCircle, Mail } from 'lucide-react'
import BrandLogo from '@/components/brand-logo'

export default function SiteFooter() {
  const [brand, setBrand] = useState({ name:'Alankar Fashions', support_phone:'+91 96570 93006', support_email:'hello@alankarfashions.com', address:'Shop No 1, 1354 B Ward, near Khari Corner, Mangalwar Peth, Kolhapur, Maharashtra 416012', instagram:'https://www.instagram.com/alankar_fashions_kop/', facebook:'https://www.facebook.com/AlankarFashion/' })
  useEffect(() => {
    fetch('/api/brand').then(r=>r.json()).then(d => { if (d?.brand) setBrand(b => ({ ...b, ...d.brand })) }).catch(()=>{})
  }, [])
  const wa = `https://wa.me/${String(brand.support_phone||'').replace(/[^0-9]/g,'')}`
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container-tight py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <BrandLogo variant="dark" size="md"/>
          <p className="text-sm opacity-80 mt-4 leading-relaxed font-devanagari">स्त्रीचे सौंदर्य खुलवणारे</p>
          <p className="text-sm opacity-80 mt-2 leading-relaxed">Handcrafted artificial jewellery from Kolhapur. Traditional Maharashtrian designs and contemporary favourites.</p>
          <div className="flex gap-3 mt-4">
            {brand.instagram && <a href={brand.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="opacity-80 hover:opacity-100"><Instagram className="h-5 w-5"/></a>}
            {brand.facebook && <a href={brand.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="opacity-80 hover:opacity-100"><Facebook className="h-5 w-5"/></a>}
            <a href={wa} target="_blank" rel="noopener" aria-label="WhatsApp" className="opacity-80 hover:opacity-100"><MessageCircle className="h-5 w-5"/></a>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-60 mb-3">Shop</div>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link href="/products?category=pearls">Pearls</Link></li>
            <li><Link href="/products?category=traditionals">Traditionals</Link></li>
            <li><Link href="/products?category=necklace">Necklace</Link></li>
            <li><Link href="/products?category=bangles">Bangles</Link></li>
            <li><Link href="/products?category=earrings">Earrings</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-60 mb-3">Help</div>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link href="/account">My Account</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li>Shipping & Returns</li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-60 mb-3">Visit Us</div>
          <ul className="space-y-2 text-sm opacity-90">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 opacity-80"/><span>{brand.address}</span></li>
            {brand.support_phone && <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 opacity-80"/><a href={`tel:${brand.support_phone}`}>{brand.support_phone}</a></li>}
            {brand.support_email && <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 opacity-80"/><a href={`mailto:${brand.support_email}`}>{brand.support_email}</a></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-tight py-4 text-xs opacity-70 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
          <span>Terms · Privacy · Cookies</span>
        </div>
      </div>
    </footer>
  )
}
