import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

export const metadata = {
  title: 'About Us',
  description: 'Learn about Alankar Fashions — a heritage jewellery store in Kolhapur offering traditional Maharashtrian and contemporary designs since generations.'
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader/>
      <main className="container-tight py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-center">About Alankar Fashions</h1>
          <p className="font-devanagari text-2xl text-primary text-center mb-12">स्त्रीचे सौंदर्य खुलवणारे</p>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <p className="text-lg">
                Welcome to <strong className="text-foreground">Alankar Fashions</strong>, your trusted destination for exquisite artificial jewellery in Kolhapur. For generations, we have been dedicated to celebrating the beauty and elegance of every woman through our carefully curated collection of traditional Maharashtrian and contemporary jewellery designs.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-foreground">Our Heritage</h2>
              <p>
                Located in the heart of Kolhapur at Mangalwar Peth, Alankar Fashions has been a cherished part of the local community for years. Our store embodies the rich cultural heritage of Kolhapur, known for its exquisite craftsmanship and artistic traditions. We take pride in being a trusted name for families looking for jewellery that blends tradition with modern aesthetics.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-foreground">What We Offer</h2>
              <p>Our collection features a wide range of handcrafted artificial jewellery, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Traditional Maharashtrian Jewellery:</strong> Kolhapuri Saj, Thushi, Tanmani, Chinchpeti, and more — perfect for weddings and festivals</li>
                <li><strong>Kundan & Pearl Sets:</strong> Elegant necklaces, earrings, and maang tikkas that add grace to any occasion</li>
                <li><strong>Contemporary Designs:</strong> Modern bangles, bracelets, and statement pieces for everyday wear</li>
                <li><strong>Festive Collections:</strong> Specially curated designs for Diwali, Navratri, weddings, and other celebrations</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-foreground">Why Choose Alankar Fashions?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Quality Craftsmanship</h3>
                  <p className="text-sm">Every piece is crafted with attention to detail, ensuring durability and timeless beauty.</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Affordable Luxury</h3>
                  <p className="text-sm">We believe elegance should be accessible. Our jewellery offers premium designs at prices that won't break the bank.</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Trusted by Generations</h3>
                  <p className="text-sm">Families across Kolhapur have relied on us for their jewellery needs, from everyday wear to special occasions.</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Personalized Service</h3>
                  <p className="text-sm">Whether shopping online or in-store, our team is here to help you find the perfect piece.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-foreground">Our Commitment</h2>
              <p>
                At Alankar Fashions, we are committed to providing you with jewellery that not only enhances your beauty but also tells a story. We understand that every piece you wear carries meaning — whether it's a gift from a loved one, a symbol of tradition, or a reflection of your personal style. That's why we strive to offer designs that resonate with your emotions and celebrate your individuality.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-foreground">Visit Our Store</h2>
              <p>
                We invite you to visit our store in Kolhapur to experience our collection in person. Our knowledgeable staff will be delighted to assist you in finding the perfect jewellery for any occasion.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg mt-4 space-y-3">
                <p className="font-semibold text-foreground text-lg">Alankar Fashions</p>
                <div className="space-y-2 text-sm">
                  <p className="flex gap-3 items-start">
                    <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5"/>
                    <span>Shop No 1, 1354 B Ward, near Khari Corner, Mangalwar Peth, Kolhapur, Maharashtra 416012</span>
                  </p>
                  <p className="flex gap-3 items-center">
                    <Phone className="h-5 w-5 shrink-0 text-primary"/>
                    <a href="tel:+919657093006" className="text-primary underline">+91 9657093006</a>
                  </p>
                  <p className="flex gap-3 items-center">
                    <Mail className="h-5 w-5 shrink-0 text-primary"/>
                    <a href="mailto:hello@alankarfashions.com" className="text-primary underline">hello@alankarfashions.com</a>
                  </p>
                  <div className="flex gap-3 items-center">
                    <span className="text-foreground">Follow us:</span>
                    <a href="https://www.instagram.com/alankar_fashions_kop/" target="_blank" rel="noopener" className="text-primary hover:opacity-80" aria-label="Instagram">
                      <Instagram className="h-5 w-5"/>
                    </a>
                    <a href="https://www.facebook.com/AlankarFashion/" target="_blank" rel="noopener" className="text-primary hover:opacity-80" aria-label="Facebook">
                      <Facebook className="h-5 w-5"/>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <section className="text-center mt-12">
              <p className="text-lg mb-6">Thank you for choosing Alankar Fashions. We look forward to being a part of your special moments.</p>
              <Link href="/products" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium">
                Explore Our Collection
              </Link>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter/>
    </>
  )
}
