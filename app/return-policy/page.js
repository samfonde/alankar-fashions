import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Link from 'next/link'

export const metadata = {
  title: 'Return Policy',
  description: 'Return Policy for Alankar Fashions — easy returns within 15 days of delivery.'
}

export default function ReturnPolicyPage() {
  return (
    <>
      <SiteHeader/>
      <main className="container-tight py-12 md:py-20">
        <h1 className="font-serif text-4xl md:text-5xl mb-6">Return Policy</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground/70">Last updated: January 2025</p>
          
          <p>At Alankar Fashions, we want you to love every piece of jewellery you purchase. If for any reason you're not satisfied, we offer easy returns within 15 days of delivery.</p>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Return Window</h2>
            <p>You may return any item within <strong>15 days</strong> from the date of delivery. Returns requested after 15 days will not be accepted unless the item is defective or damaged.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Eligibility for Returns</h2>
            <p>To be eligible for a return, items must meet the following conditions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The item must be <strong>unused, unworn, and in the same condition</strong> as you received it</li>
              <li>The item must be in its <strong>original packaging</strong> with all tags and labels intact</li>
              <li>Any accessories, pouches, or certificates provided with the item must be included</li>
              <li>Items that show signs of wear, damage, or alteration are not eligible for return</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Non-Returnable Items</h2>
            <p>The following items cannot be returned:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Customized or personalized jewellery made to your specifications</li>
              <li>Items purchased during final sale or clearance events</li>
              <li>Gift cards or e-vouchers</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">How to Initiate a Return</h2>
            <p>To return an item, please follow these steps:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Contact Us:</strong> Email us at <a href="mailto:hello@alankarfashions.com" className="text-primary underline">hello@alankarfashions.com</a> or call <a href="tel:+919657093006" className="text-primary underline">+91 9657093006</a> within 15 days of delivery</li>
              <li><strong>Provide Details:</strong> Include your order number, reason for return, and photos of the item (if damaged or defective)</li>
              <li><strong>Return Authorization:</strong> Our team will review your request and provide a Return Merchandise Authorization (RMA) number within 2 business days</li>
              <li><strong>Ship the Item:</strong> Pack the item securely in its original packaging and ship it back to the address provided by our team</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Return Shipping Costs</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Defective or Incorrect Items:</strong> We will arrange free pickup or reimburse return shipping costs</li>
              <li><strong>Change of Mind or Size Issues:</strong> The customer is responsible for return shipping costs</li>
            </ul>
            <p className="text-sm">We recommend using a trackable shipping service for returns. Alankar Fashions is not responsible for items lost or damaged during return transit.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Inspection & Processing</h2>
            <p>Once we receive your returned item:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Our team will inspect the item within 2-3 business days</li>
              <li>If the return is approved, a refund will be processed within 5-7 business days</li>
              <li>You will receive an email confirmation once the refund has been initiated</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Exchanges</h2>
            <p>At this time, we do not offer direct exchanges. If you wish to exchange an item for a different size, color, or design:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Return the original item following the return process above</li>
              <li>Once your refund is processed, you can place a new order for the desired item</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item, please notify us within <strong>24 hours of delivery</strong> with photos. We will arrange for a free return pickup and provide a full refund or replacement.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Contact Us</h2>
            <p>For any return-related queries, please reach out to us:</p>
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
