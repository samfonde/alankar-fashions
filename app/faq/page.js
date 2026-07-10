import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import WhatsAppFab from '@/components/whatsapp-fab'

const FAQ = [
  { q: 'What materials do you use?', a: 'Our jewellery is crafted from brass, copper alloys and premium plating (antique gold, rhodium, silver oxidised). Kundan and AD pieces use high-quality stones. All pieces are nickel-free and safe for daily wear.' },
  { q: 'Is this real gold?', a: 'No. Alankar Fashions offers artificial (imitation) jewellery designed to look and feel like traditional gold jewellery at accessible prices. This is clearly stated on every product page.' },
  { q: 'How do I care for my jewellery?', a: 'Store in a dry box or airtight pouch. Keep away from water, perfume, sweat, and humidity. Clean gently with a soft cotton cloth. Do not use polish liquids or ultrasonic cleaners.' },
  { q: 'Do you ship across India?', a: 'Yes, we ship pan-India via reputed logistics partners. Free shipping on orders above ₹999. Cash on Delivery (COD) is available on eligible pincodes.' },
  { q: 'How long does delivery take?', a: 'Metro cities: 3–5 business days. Rest of India: 5–8 business days. You will receive a tracking link by email and WhatsApp once dispatched.' },
  { q: 'What is your return policy?', a: '15-day easy returns on unused pieces in original packaging. Refund is initiated within 3 business days of receiving the returned item.' },
  { q: 'Can I visit your store?', a: 'Yes! Visit us at Shop No 1, 1354 B Ward, near Khari Corner, Mangalwar Peth, Kolhapur, Maharashtra 416012. Call +91 96570 93006 before visiting.' },
  { q: 'Do you take custom orders?', a: 'Yes, we take custom orders for weddings and bulk gifting. WhatsApp us at +91 96570 93006 with your requirement and we will get back to you within 24 hours.' },
]

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Alankar Fashions artificial jewellery — materials, care, shipping, returns, and custom orders.',
}

export default function FaqPage() {
  const jsonLd = { '@context':'https://schema.org', '@type':'FAQPage', mainEntity: FAQ.map(x => ({ '@type':'Question', name: x.q, acceptedAnswer: { '@type':'Answer', text: x.a } })) }
  return (
    <div>
      <SiteHeader/>
      <main className="container-tight py-10 md:py-16 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Help</div>
        <h1 className="font-serif text-4xl md:text-5xl mt-2">Frequently asked questions</h1>
        <div className="mt-8 divide-y divide-border">
          {FAQ.map((x,i) => (
            <details key={i} className="py-4 group">
              <summary className="cursor-pointer font-medium text-lg flex justify-between items-center"><span>{x.q}</span><span className="text-gold-500 group-open:rotate-45 transition">+</span></summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">{x.a}</p>
            </details>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>
      </main>
      <SiteFooter/>
      <WhatsAppFab/>
    </div>
  )
}
