import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Alankar Fashions — how we collect, use, and protect your personal information.'
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader/>
      <main className="container-tight py-12 md:py-20">
        <h1 className="font-serif text-4xl md:text-5xl mb-6">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground/70">Last updated: January 2025</p>
          
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Information We Collect</h2>
            <p>When you shop with Alankar Fashions, we collect the following information to process and fulfill your orders:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Information:</strong> Name, phone number, email address, and delivery address</li>
              <li><strong>Order History:</strong> Details of products purchased, order dates, and transaction amounts</li>
              <li><strong>Payment Information:</strong> Processed securely via Razorpay payment gateway. We do not store your card details, CVV, or banking passwords</li>
              <li><strong>Device & Usage Data:</strong> IP address, browser type, pages visited, and interaction data to improve your experience</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">How We Use Your Information</h2>
            <p>We use the information collected to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and deliver your orders</li>
              <li>Send order confirmations, shipping updates, and delivery notifications</li>
              <li>Provide customer support and respond to your queries</li>
              <li>Improve our website, products, and services</li>
              <li>Send promotional offers and updates (you can opt-out anytime)</li>
              <li>Comply with legal obligations and prevent fraudulent transactions</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Payment Security</h2>
            <p>All payment transactions are processed through Razorpay, a PCI-DSS compliant payment gateway. Your card details are never stored on our servers and are transmitted securely using industry-standard encryption.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Information Sharing</h2>
            <p>We do not sell, rent, or trade your personal information. We may share your data only with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Delivery Partners:</strong> To ship your orders</li>
              <li><strong>Payment Processors:</strong> To complete transactions securely</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access, update, or delete your personal information</li>
              <li>Opt-out of promotional communications</li>
              <li>Request a copy of your data</li>
            </ul>
            <p>To exercise these rights, please contact us at <a href="mailto:hello@alankarfashions.com" className="text-primary underline">hello@alankarfashions.com</a>.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Cookies</h2>
            <p>We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Contact Us</h2>
            <p>For any privacy-related queries or concerns, please reach out to us:</p>
            <div className="bg-muted/30 p-4 rounded-lg mt-4">
              <p className="font-semibold text-foreground">Alankar Fashions</p>
              <p>Shop No 1, 1354 B Ward, near Khari Corner, Mangalwar Peth, Kolhapur, Maharashtra 416012</p>
              <p>Phone: <a href="tel:+919657093006" className="text-primary underline">+91 9657093006</a></p>
              <p>Email: <a href="mailto:hello@alankarfashions.com" className="text-primary underline">hello@alankarfashions.com</a></p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground mt-8">Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
          </section>
        </div>
      </main>
      <SiteFooter/>
    </>
  )
}
