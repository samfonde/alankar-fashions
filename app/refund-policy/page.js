import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Link from 'next/link'

export const metadata = {
  title: 'Refund Policy',
  description: 'Refund Policy for Alankar Fashions — conditions, timelines, and process for refunds.'
}

export default function RefundPolicyPage() {
  return (
    <>
      <SiteHeader/>
      <main className="container-tight py-12 md:py-20">
        <h1 className="font-serif text-4xl md:text-5xl mb-6">Refund Policy</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground/70">Last updated: January 2025</p>
          
          <p>At Alankar Fashions, we strive to ensure your complete satisfaction with every purchase. If you are not entirely happy with your order, we're here to help.</p>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Eligibility for Refunds</h2>
            <p>Refunds are available under the following conditions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Damaged or Defective Items:</strong> If you receive a damaged or defective product, you are eligible for a full refund or replacement</li>
              <li><strong>Wrong Item Received:</strong> If you receive an incorrect item, we will issue a full refund or send the correct item at no additional cost</li>
              <li><strong>Order Cancellation:</strong> If you cancel your order before it has been shipped, you will receive a full refund</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Non-Refundable Items</h2>
            <p>The following items are not eligible for refunds:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Customized or personalized jewellery pieces made to your specifications</li>
              <li>Items purchased during final sale or clearance events (unless damaged or defective)</li>
              <li>Jewellery that has been worn, altered, or damaged after delivery</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Refund Process</h2>
            <p>To request a refund:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact us within 15 days of receiving your order at <a href="mailto:hello@alankarfashions.com" className="text-primary underline">hello@alankarfashions.com</a> or call <a href="tel:+919657093006" className="text-primary underline">+91 9657093006</a></li>
              <li>Provide your order number, reason for refund, and photos if the item is damaged or incorrect</li>
              <li>Our team will review your request and respond within 2 business days</li>
              <li>If approved, we will arrange for product pickup or provide return shipping instructions</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Refund Timeline</h2>
            <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund.</p>
            <p>If approved:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds to your original payment method will be processed within <strong>5-7 business days</strong></li>
              <li>You will receive a confirmation email once the refund has been initiated</li>
              <li>Depending on your bank or payment provider, it may take an additional 3-5 business days for the amount to reflect in your account</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Refund Method</h2>
            <p>Refunds will be issued to the original payment method used during purchase:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Credit/Debit Card:</strong> Refund credited to the same card</li>
              <li><strong>UPI/Net Banking:</strong> Refund credited to the source account</li>
              <li><strong>Cash on Delivery (COD):</strong> Bank transfer to your provided account details</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Partial Refunds</h2>
            <p>In certain situations, partial refunds may be granted:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Items returned without original packaging or with missing accessories</li>
              <li>Items showing signs of use or minor damage not reported within 24 hours of delivery</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Contact Us</h2>
            <p>For any refund-related queries, please reach out to us:</p>
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
