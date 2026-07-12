import { createBrowserClient } from '@supabase/ssr'

// Stub client — used when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are missing from the client bundle
// (typically happens when the build step didn't have those env vars available — because
// NEXT_PUBLIC_* is inlined at build time, not read at runtime). Prevents "Your project's URL
// and API key are required to create a Supabase client" from throwing on fresh page loads.
function stubClient() {
  const noSession = { data: { user: null, session: null }, error: null }
  const stubSub = { data: { subscription: { unsubscribe() {} } } }
  const err = () => ({ data: null, error: new Error('Authentication is temporarily unavailable. Please try again shortly.') })
  return {
    auth: {
      getUser: async () => noSession,
      getSession: async () => noSession,
      onAuthStateChange: () => stubSub,
      signInWithPassword: async () => err(),
      signInWithOAuth: async () => err(),
      signUp: async () => err(),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async () => err(),
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: err().error }),
      update: () => Promise.resolve({ data: null, error: err().error }),
      delete: () => Promise.resolve({ data: null, error: err().error }),
    }),
  }
}

let _client
let _warned = false
export function getSupabaseBrowser() {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    if (typeof window !== 'undefined' && !_warned) {
      _warned = true
      // Loud warning so this is visible in production console when misconfigured
      // eslint-disable-next-line no-console
      console.error(
        '[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing from the client bundle. ' +
        'These are inlined by Next.js at BUILD time — set them in your build environment (not just runtime) and rebuild.'
      )
    }
    _client = stubClient()
    return _client
  }
  try {
    _client = createBrowserClient(url, key)
    return _client
  } catch (e) {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('[supabase] createBrowserClient failed:', e?.message)
    }
    _client = stubClient()
    return _client
  }
}
