// Simple in-memory rate limiter (fine for single-node Hostinger deployment)
const buckets = new Map()
export function rateLimit({ key, limit = 10, windowMs = 60_000 }) {
  const now = Date.now()
  const rec = buckets.get(key) || { count: 0, reset: now + windowMs }
  if (now > rec.reset) { rec.count = 0; rec.reset = now + windowMs }
  rec.count += 1
  buckets.set(key, rec)
  return { allowed: rec.count <= limit, remaining: Math.max(0, limit - rec.count), reset: rec.reset }
}
export function clientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
