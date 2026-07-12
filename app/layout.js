import './globals.css'
import { Cormorant_Garamond, Inter, Noto_Serif_Devanagari } from 'next/font/google'
import { Toaster } from 'sonner'
import Analytics from '@/components/analytics'
import CartDrawer from '@/components/cart-drawer'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-serif', display: 'swap' })
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const devanagari = Noto_Serif_Devanagari({ subsets: ['devanagari','latin'], weight: ['400','600','700'], variable: '--font-devanagari', display: 'swap' })

// Robust getBrand — NEVER throws. Always returns a fully-shaped object with plain object children.
// This is critical because it runs during server render on every fresh page load.
async function getBrand() {
  const fallback = { brand: {}, seo: {}, analytics: {} }
  try {
    const admin = getSupabaseAdmin()
    if (!admin) return fallback
    const { data, error } = await admin
      .from('settings')
      .select('key,value')
      .in('key', ['brand','seo','analytics'])
    if (error || !Array.isArray(data)) return fallback
    const map = {}
    for (const row of data) {
      // jsonb column may be null, string, array, or object — coerce to object safely.
      const v = row?.value
      map[row.key] = (v && typeof v === 'object' && !Array.isArray(v)) ? v : {}
    }
    return {
      brand: map.brand || {},
      seo: map.seo || {},
      analytics: map.analytics || {},
    }
  } catch (e) {
    console.error('[layout.getBrand] failed:', e?.message)
    return fallback
  }
}

export async function generateMetadata() {
  try {
    const { brand, seo } = await getBrand()
    const name = brand?.name || 'Alankar Fashions'
    const tagline = brand?.tagline || 'स्त्रीचे सौंदर्य खुलवणारे — Considered Indian jewellery from Kolhapur'
    const description = seo?.description || 'Alankar Fashions — handcrafted artificial jewellery from Kolhapur. Traditional Kolhapuri Saj, Thushi, Kundan, pearl sets, bangles and earrings. Free shipping across India.'
    const rawUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://alankarfashions.com'
    let metadataBase
    try { metadataBase = new URL(rawUrl) } catch { metadataBase = new URL('https://alankarfashions.com') }
    const meta = {
      metadataBase,
      title: { default: `${name} — ${tagline}`, template: `%s • ${name}` },
      description,
      keywords: ['artificial jewellery','Kolhapuri Saj','Thushi','Kundan necklace','pearl sets','Indian jewellery','Kolhapur','Chinchpeti','Tanmani','maharashtrian jewellery','bangles','earrings'],
      openGraph: { title: name, description, url: rawUrl, siteName: name, type: 'website', locale: 'en_IN' },
      twitter: { card: 'summary_large_image', title: name, description },
      icons: { icon: brand?.favicon_url || '/favicon.svg' },
    }
    if (seo?.gsc_verification) meta.verification = { google: seo.gsc_verification }
    return meta
  } catch (e) {
    console.error('[layout.generateMetadata] failed:', e?.message)
    return { title: 'Alankar Fashions', description: 'Handcrafted artificial jewellery from Kolhapur.' }
  }
}

export default async function RootLayout({ children }) {
  const { analytics } = await getBrand()
  const safeAnalytics = (analytics && typeof analytics === 'object') ? analytics : {}
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${devanagari.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        {children}
        <CartDrawer/>
        <Toaster position="top-center" richColors closeButton />
        <Analytics metaPixelId={safeAnalytics.meta_pixel_id || ''} ga4Id={safeAnalytics.ga4_id || ''} />
      </body>
    </html>
  )
}
