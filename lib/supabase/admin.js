import { createClient } from '@supabase/supabase-js'

// Server-only client using the service role key. Bypasses RLS. Never expose to browser.
// Returns null if env vars are missing (never throws) so callers can degrade gracefully.
let _admin
export function getSupabaseAdmin() {
  if (_admin) return _admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  try {
    _admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    return _admin
  } catch (e) {
    console.error('[supabase-admin] init failed:', e?.message)
    return null
  }
}
