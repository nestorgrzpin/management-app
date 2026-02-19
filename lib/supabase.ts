import { createBrowserClient } from '@supabase/ssr'

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  if (cachedClient) return cachedClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // If URL and key are provided (not empty after defaults), create the client
  if (url && key && !url.endsWith('undefined') && !key.endsWith('undefined')) {
    cachedClient = createBrowserClient(url, key)
    return cachedClient
  }

  // If variables are truly missing, throw helpful error
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase configuration is missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vars section.'
    )
  }

  // Fallback - should not reach here
  cachedClient = createBrowserClient(url, key)
  return cachedClient
}
