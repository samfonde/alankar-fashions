import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import WhatsAppFab from '@/components/whatsapp-fab'
import { MapPin, Phone, Mail, MessageCircle, Instagram, Facebook } from 'lucide-react'

export const metadata = {
  title: 'Contact & Visit Us in Kolhapur',
  description: 'Visit Alankar Fashions at Mangalwar Peth, Kolhapur. Call +91 96570 93006 or WhatsApp us for custom orders and bulk enquiries.',
}

export default function Contact() {
  const address = 'Shop No 1, 1354 B Ward, near Khari Corner, Mangalwar Peth, Kolhapur, Maharashtra 416012'
  const phone = '+919657093006'
  const jsonLd = {
    '@context':'https://schema.org', '@type':'LocalBusiness', '@id': 'https://alankarfashions.com/#business',
    name: 'Alankar Fashions', image: `${process.env.NEXT_PUBLIC_BASE_URL||''}/favicon.svg`,
    telephone: '+91 96570 93006', email: 'hello@alankarfashions.com',
    address: { '@type':'PostalAddress', streetAddress: 'Shop No 1, 1354 B Ward, near Khari Corner, Mangalwar Peth', addressLocality: 'Kolhapur', addressRegion: 'Maharashtra', postalCode: '416012', addressCountry: 'IN' },
    sameAs: ['https://www.instagram.com/alankar_fashions_kop/','https://www.facebook.com/AlankarFashion/'],
    priceRange: '₹₹', currenciesAccepted: 'INR',
  }
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-10 md:py-16">
        <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Get in touch</div>
        <h1 className="font-serif text-4xl md:text-5xl mt-2">Visit us in Kolhapur</h1>
        <div className="grid lg:grid-cols-2 gap-10 mt-10">
          <div className="space-y-6">
            <div className="flex gap-3"><MapPin className="h-5 w-5 text-gold-500 shrink-0 mt-0.5"/><div><div className="font-medium">Store Address</div><div className="text-muted-foreground text-sm mt-1">{address}</div><a href={`https://www.google.com/maps?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener" className="inline-block mt-2 text-sm underline">Get directions →</a></div></div>
            <div className="flex gap-3"><Phone className="h-5 w-5 text-gold-500 shrink-0 mt-0.5"/><div><div className="font-medium">Call</div><a href={`tel:${phone}`} className="text-muted-foreground text-sm">+91 96570 93006</a><div className="text-xs text-muted-foreground">Mon–Sat, 10am–9pm</div></div></div>
            <div className="flex gap-3"><MessageCircle className="h-5 w-5 text-gold-500 shrink-0 mt-0.5"/><div><div className="font-medium">WhatsApp</div><a href={`https://wa.me/919657093006`} target="_blank" rel="noopener" className="text-muted-foreground text-sm underline">+91 96570 93006</a><div className="text-xs text-muted-foreground">Fastest way to reach us for custom orders</div></div></div>
            <div className="flex gap-3"><Mail className="h-5 w-5 text-gold-500 shrink-0 mt-0.5"/><div><div className="font-medium">Email</div><a href="mailto:hello@alankarfashions.com" className="text-muted-foreground text-sm">hello@alankarfashions.com</a></div></div>
            <div className="flex gap-4 pt-2">
              <a href="https://www.instagram.com/alankar_fashions_kop/" target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm hover:bg-muted"><Instagram className="h-4 w-4"/> Instagram</a>
              <a href="https://www.facebook.com/AlankarFashion/" target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm hover:bg-muted"><Facebook className="h-4 w-4"/> Facebook</a>
            </div>
          </div>
          <div className="aspect-square w-full">
            <iframe src={mapSrc} className="w-full h-full border-0" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" title="Alankar Fashions store location"/>
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}/>
      </main>
      <SiteFooter/>
      <WhatsAppFab/>
    </div>
  )
}
