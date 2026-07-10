import './globals.css'
import { Playfair_Display, Inter } from 'next/font/google'
import { Toaster } from 'sonner'

const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap' })
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata = {
  title: 'Aurelia — Considered Fashion',
  description: 'Considered fashion. Crafted in India. Discover premium clothing, footwear and accessories at Aurelia.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
