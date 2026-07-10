export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://alankarfashions.com'
  const r = await fetch(`${base}/api/sitemap`, { cache: 'no-store' })
  const xml = await r.text()
  return new Response(xml, { headers: { 'content-type': 'application/xml' } })
}
export const dynamic = 'force-dynamic'
