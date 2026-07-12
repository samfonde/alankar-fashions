import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/account'
  if (!code) return NextResponse.redirect(`${origin}/login?error=missing_code`)

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)

  // Ensure a profile row exists for OAuth users (email/password signup already handles this via trigger or upsert on first login)
  try {
    const user = data?.user
    if (user) {
      const admin = getSupabaseAdmin()
      if (admin) {
        const { data: existing } = await admin.from('profiles').select('id').eq('id', user.id).maybeSingle()
        if (!existing) {
          const meta = user.user_metadata || {}
          const full_name = meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : '')
          await admin.from('profiles').upsert({
            id: user.id,
            email: user.email,
            full_name,
            role: 'customer',
          }, { onConflict: 'id' })
        }
      }
    }
  } catch (e) { console.error('[oauth callback] profile upsert failed', e?.message) }

  const safeNext = next.startsWith('/') ? next : '/account'
  return NextResponse.redirect(`${origin}${safeNext}`)
}
