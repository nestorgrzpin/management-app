import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (!code) {
      return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[v0] Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
    }

    // Redirect to the specified URL or dashboard
    const baseUrl = request.nextUrl.clone()
    baseUrl.pathname = next
    baseUrl.searchParams.delete('code')
    return NextResponse.redirect(baseUrl)
  } catch (error) {
    console.error('[v0] Callback error:', error)
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }
}
