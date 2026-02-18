import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('[v0] Supabase URL available:', !!url)
  console.log('[v0] Supabase Key available:', !!key)

  if (!url || !key) {
    throw new Error(
      `Missing Supabase credentials. URL: ${!!url}, Key: ${!!key}. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in environment variables.`
    )
  }

  return createBrowserClient(url, key)
}
