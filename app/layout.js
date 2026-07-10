import './globals.css'
import { Cormorant_Garamond, Inter, Noto_Serif_Devanagari } from 'next/font/google'
import { Toaster } from 'sonner'
import Analytics from '@/components/analytics'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-serif', display: 'swap' })
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const devanagari = Noto_Serif_Devanagari({ subsets: ['devanagari','latin'], weight: ['400','600','700'], variable: '--font-devanagari', display: 'swap' })

async function getBrand() {
  try {
    const admin = getSupabaseAdmin()
    const { data } = await admin.from('settings').select('key,value').in('key', ['brand','seo','analytics'])
    const map = Object.fromEntries((data||[]).map(x => [x.key, x.value]))
    return { brand: map.brand || {}, seo: map.seo || {}, analytics: map.analytics || {} }
  } catch { return { brand: {}, seo: {}, analytics: {} } }
}

export async function generateMetadata() {
  const { brand, seo } = await getBrand()
  const name = brand.name || 'Alankar Fashions'
  const tagline = brand.tagline || 'स्त्रीचे सौंदर्य खुलवणारे — Considered Indian jewellery from Kolhapur'
  const description = seo.description || 'Alankar Fashions — handcrafted artificial jewellery from Kolhapur. Traditional Kolhapuri Saj, Thushi, Kundan, pearl sets, bangles and earrings. Free shipping across India.'
  const url = process.env.NEXT_PUBLIC_BASE_URL || 'https://alankarfashions.com'
  return {
    metadataBase: new URL(url),
    title: { default: `${name} — ${tagline}`, template: `%s • ${name}` },
    description,
    keywords: ['artificial jewellery','Kolhapuri Saj','Thushi','Kundan necklace','pearl sets','Indian jewellery','Kolhapur','Chinchpeti','Tanmani','maharashtrian jewellery','bangles','earrings'],
    openGraph: { title: name, description, url, siteName: name, type: 'website', locale: 'en_IN' },
    twitter: { card: 'summary_large_image', title: name, description },
    icons: { icon: brand.favicon_url || '/favicon.svg' },
    verification: seo.gsc_verification ? { google: seo.gsc_verification } : undefined,
  }
}

export default async function RootLayout({ children }) {
  const { brand, analytics } = await getBrand()
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${devanagari.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors closeButton />
        <Analytics metaPixelId={analytics?.meta_pixel_id} ga4Id={analytics?.ga4_id} />
      </body>
    </html>
  )
}
