import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Link from 'next/link'

export const metadata = {
  title: 'Shipping Policy',
  description: 'Shipping Policy for Alankar Fashions — delivery timelines, free shipping, COD, and tracking.'
}

export default function ShippingPolicyPage() {
  return (
    <>
      <SiteHeader/>
      <main className="container-tight py-12 md:py-20">
        <h1 className="font-serif text-4xl md:text-5xl mb-6">Shipping Policy</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground/70">Last updated: January 2025</p>
          
          <p>At Alankar Fashions, we are committed to delivering your order quickly and securely. Here's everything you need to know about our shipping process.</p>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Delivery Timeline</h2>
            <p>We currently ship across India. Delivery timelines vary based on your location:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Metro Cities (Mumbai, Delhi, Bangalore, etc.):</strong> 3-5 business days</li>
              <li><strong>Other Cities & Towns:</strong> 5-7 business days</li>
              <li><strong>Remote Areas:</strong> 7-10 business days</li>
            </ul>
            <p className="text-sm">Orders are typically dispatched within 1-2 business days. Delivery timelines are indicative and may vary during festive seasons or due to unforeseen circumstances.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Free Shipping</h2>
            <p>We offer <strong>FREE shipping on all orders above ₹999</strong>. For orders below ₹999, a flat shipping charge of ₹99 applies.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Cash on Delivery (COD)</h2>
            <p>Cash on Delivery is available across most locations in India. A nominal COD handling fee may apply for certain orders. Payment can be made in cash to the delivery partner at the time of delivery.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Order Tracking</h2>
            <p>Once your order is dispatched, you will receive:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>An <strong>order confirmation email</strong> with order details</li>
              <li>A <strong>shipment notification email</strong> with tracking number and courier partner details</li>
              <li>You can track your order in real-time using the tracking link provided</li>
              <li>Logged-in customers can view order status and tracking information in their <Link href="/account" className="text-primary underline">Account Dashboard</Link></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Shipping Partners</h2>
            <p>We partner with trusted courier services including Delhivery, Blue Dart, and India Post to ensure safe and timely delivery of your jewellery.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Packaging</h2>
            <p>All jewellery items are carefully packed in secure, tamper-proof packaging to ensure they reach you in perfect condition. Each piece is wrapped individually to prevent damage during transit.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Failed Delivery Attempts</h2>
            <p>If the courier is unable to deliver your order due to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Incorrect or incomplete address</li>
              <li>Recipient unavailable</li>
              <li>Refusal to accept delivery</li>
            </ul>
            <p>The courier will make <strong>2-3 delivery attempts</strong>. After failed attempts, the order will be returned to us. You may be charged return shipping fees if the failure was due to incorrect information provided.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">International Shipping</h2>
            <p>We currently ship only within India. International shipping is not available at this time. We are working to expand our services globally and will update this policy accordingly.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Order Issues</h2>
            <p>If you experience any issues with your delivery, such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Delayed delivery beyond the estimated timeline</li>
              <li>Damaged packaging or missing items</li>
              <li>Incorrect or incomplete order</li>
            </ul>
            <p>Please contact us immediately at <a href="mailto:hello@alankarfashions.com" className="text-primary underline">hello@alankarfashions.com</a> or <a href="tel:+919657093006" className="text-primary underline">+91 9657093006</a>. We will resolve the issue promptly.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Contact Us</h2>
            <p>For any shipping-related queries, please reach out to us:</p>
            <div className="bg-muted/30 p-4 rounded-lg mt-4">
              <p className="font-semibold text-foreground">Alankar Fashions</p>
              <p>Shop No 1, 1354 B Ward, near Khari Corner, Mangalwar Peth, Kolhapur, Maharashtra 416012</p>
              <p>Phone: <a href="tel:+919657093006" className="text-primary underline">+91 9657093006</a></p>
              <p>Email: <a href="mailto:hello@alankarfashions.com" className="text-primary underline">hello@alankarfashions.com</a></p>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter/>
    </>
  )
}
