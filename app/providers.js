'use client'
import { useEffect } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/browser'

export function Providers({ children }) {
  useEffect(() => {
    // Ensure client is initialized so auth cookies get set on load
    getSupabaseBrowser()
  }, [])
  return <>{children}</>
}
