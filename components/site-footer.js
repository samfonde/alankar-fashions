import Link from 'next/link'
import { Instagram, Facebook, Twitter } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container-tight py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif text-2xl tracking-[0.25em]">AURELIA</div>
          <p className="text-sm opacity-80 mt-4 leading-relaxed">Considered fashion. Crafted in India. Built to last, styled forever.</p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Instagram" className="opacity-80 hover:opacity-100"><Instagram className="h-5 w-5"/></a>
            <a href="#" aria-label="Facebook" className="opacity-80 hover:opacity-100"><Facebook className="h-5 w-5"/></a>
            <a href="#" aria-label="Twitter" className="opacity-80 hover:opacity-100"><Twitter className="h-5 w-5"/></a>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-60 mb-3">Shop</div>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link href="/products?category=women">Women</Link></li>
            <li><Link href="/products?category=men">Men</Link></li>
            <li><Link href="/products?category=footwear">Footwear</Link></li>
            <li><Link href="/products?category=accessories">Accessories</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-60 mb-3">Help</div>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link href="/account">My Account</Link></li>
            <li><Link href="/products">Shop All</Link></li>
            <li>Shipping & Returns</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-60 mb-3">Company</div>
          <ul className="space-y-2 text-sm opacity-90">
            <li>About</li>
            <li>Sustainability</li>
            <li>Careers</li>
            <li>Press</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-tight py-4 text-xs opacity-70 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Aurelia. All rights reserved.</span>
          <span>Terms · Privacy · Cookies</span>
        </div>
      </div>
    </footer>
  )
}
