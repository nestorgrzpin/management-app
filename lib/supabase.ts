import { createBrowserClient } from '@supabase/ssr'

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  // Return cached client if it exists
  if (cachedClient) return cachedClient

  // Get environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if we're in a browser environment and variables are available
  if (typeof window === 'undefined') {
    throw new Error('createClient can only be used in browser environment')
  }

  if (!url || !key) {
    console.error('[v0] Missing Supabase credentials:', { url: !!url, key: !!key })
    throw new Error(
      'Supabase URL and Anonymous Key are required. Please check your environment variables in Vars section.'
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
