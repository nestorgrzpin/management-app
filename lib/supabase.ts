import { createBrowserClient } from '@supabase/ssr'

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  if (cachedClient) return cachedClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase URL and Anonymous Key are required. Add them to Vars section in v0.'
    )
  }

  try {
    cachedClient = createBrowserClient(url, key)
    return cachedClient
  } catch (error) {
    console.error('[v0] Supabase client creation failed:', error)
    throw error
  }
}
