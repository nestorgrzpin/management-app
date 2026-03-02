import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Login endpoint called')
    
    const { email, password } = await request.json()
    console.log('[v0] Received credentials for email:', email)

    if (!email || !password) {
      console.warn('[v0] Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('[v0] Supabase env check:', {
      url: supabaseUrl ? 'configured' : 'MISSING',
      key: supabaseKey ? 'configured' : 'MISSING'
    })

    if (!supabaseUrl || !supabaseKey) {
      console.error('[v0] CRITICAL: Missing Supabase environment variables')
      return NextResponse.json(
        { 
          error: 'Supabase no está configurado. Verifica que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén en variables de entorno.' 
        },
        { status: 500 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
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

    console.log('[v0] Attempting to sign in with email:', email)

    let data: any, error: any
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      data = result.data
      error = result.error
      console.log('[v0] Auth response received:', { hasData: !!data, hasError: !!error })
    } catch (authError) {
      console.error('[v0] Exception during auth call:', authError)
      throw authError
    }

    if (error) {
      console.error('[v0] Supabase auth error:', error.message)
      return NextResponse.json(
        { error: error.message || 'Authentication failed' },
        { status: 401 }
      )
    }

    if (!data.session) {
      console.error('[v0] No session returned from auth')
      return NextResponse.json(
        { error: 'No session returned' },
        { status: 401 }
      )
    }

    console.log('[v0] Login successful for user:', data.user?.email)

    // Create response with session data
    const response = NextResponse.json({
      user: data.user,
      session: data.session,
    })

    console.log('[v0] Sending success response')
    return response
  } catch (error) {
    console.error('[v0] Login endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
