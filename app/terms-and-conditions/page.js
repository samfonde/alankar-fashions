import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'

export const metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and Conditions for Alankar Fashions — usage terms, pricing, intellectual property, and legal disclaimers.'
}

export default function TermsAndConditionsPage() {
  return (
    <>
      <SiteHeader/>
      <main className="container-tight py-12 md:py-20">
        <h1 className="font-serif text-4xl md:text-5xl mb-6">Terms and Conditions</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground/70">Last updated: January 2025</p>
          
          <p>Welcome to Alankar Fashions. By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.</p>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Acceptance of Terms</h2>
            <p>By using the Alankar Fashions website (alankarfashions.com) and placing orders, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy, Refund Policy, and Shipping Policy.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Use of Website</h2>
            <p>You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use of this site by any third party. Prohibited activities include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Attempting to gain unauthorized access to our systems or user accounts</li>
              <li>Engaging in any activity that disrupts or interferes with the website's functionality</li>
              <li>Using automated systems (bots, scrapers) to access or extract data from the site</li>
              <li>Posting or transmitting any harmful, offensive, or illegal content</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Account Registration</h2>
            <p>To access certain features or place orders, you may need to create an account. You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Product Information & Pricing</h2>
            <p>We make every effort to display accurate product descriptions, images, and prices. However:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Colors and appearance may vary slightly due to photography and screen settings</li>
              <li>Prices are subject to change without prior notice</li>
              <li>We reserve the right to correct any pricing errors on our website or orders</li>
              <li>Product availability is not guaranteed and may change without notice</li>
            </ul>
            <p>In case of a pricing error, we will notify you and offer the option to proceed at the correct price or cancel the order for a full refund.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Orders & Payment</h2>
            <p>By placing an order, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information for order processing and delivery</li>
              <li>Pay the full amount due, including product price, shipping charges, and applicable taxes</li>
              <li>Receive order confirmation via email (order confirmation does not guarantee acceptance)</li>
            </ul>
            <p>We reserve the right to refuse or cancel any order for reasons including but not limited to product unavailability, pricing errors, or suspected fraudulent transactions.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Intellectual Property</h2>
            <p>All content on this website, including text, images, logos, product designs, graphics, and software, is the property of Alankar Fashions or its content suppliers and is protected by Indian and international copyright, trademark, and intellectual property laws.</p>
            <p>You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reproduce, distribute, or display any content from this site without written permission</li>
              <li>Use product images or descriptions for commercial purposes</li>
              <li>Modify or create derivative works from any website content</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Alankar Fashions shall not be liable for any indirect, incidental, consequential, or punitive damages arising from:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use or inability to use our website or services</li>
              <li>Delays or errors in order processing or delivery</li>
              <li>Unauthorized access to or alteration of your data</li>
              <li>Any third-party content or conduct on the site</li>
            </ul>
            <p>Our total liability for any claim related to our services shall not exceed the amount you paid for the product in question.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Third-Party Links</h2>
            <p>Our website may contain links to third-party websites (e.g., payment gateways, social media). We are not responsible for the content, privacy practices, or terms of these external sites. Accessing third-party links is at your own risk.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Indemnification</h2>
            <p>You agree to indemnify and hold harmless Alankar Fashions, its owners, employees, and partners from any claims, losses, damages, or expenses (including legal fees) arising from:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your violation of these Terms and Conditions</li>
              <li>Your misuse of our website or services</li>
              <li>Your violation of any third-party rights</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Governing Law & Dispute Resolution</h2>
            <p>These Terms and Conditions are governed by the laws of India. Any disputes arising from your use of this website or our services shall be subject to the exclusive jurisdiction of the courts in Kolhapur, Maharashtra.</p>
            <p>We encourage you to contact us first to resolve any issues amicably before pursuing legal action.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Changes to Terms</h2>
            <p>We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on this page. Your continued use of the website after changes are posted constitutes acceptance of the revised terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us:</p>
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
