export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://alankarfashions.com'
  const txt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\nDisallow: /setup\nDisallow: /account\nDisallow: /checkout\n\nSitemap: ${base}/sitemap.xml\n`
  return new Response(txt, { headers: { 'content-type': 'text/plain' } })
}
