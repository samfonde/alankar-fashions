import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Stub server client for when env vars are missing
function stubServerClient() {
  const noSession = { data: { user: null, session: null }, error: null }
  const stubSub = { data: { subscription: { unsubscribe() {} } } }
  const err = () => ({ data: null, error: new Error('Authentication is temporarily unavailable') })
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
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      insert: () => Promise.resolve({ data: null, error: err().error }),
      update: () => Promise.resolve({ data: null, error: err().error }),
      delete: () => Promise.resolve({ data: null, error: err().error }),
    }),
  }
}

export async function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('[supabase-server] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing — returning stub client')
    return stubServerClient()
  }
  
  try {
    const cookieStore = await cookies()
    return createServerClient(url, key, {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    })
  } catch (e) {
    console.error('[supabase-server] createServerClient failed:', e?.message)
    return stubServerClient()
  }
}
