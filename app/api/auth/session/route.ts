import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (error || !session) {
      console.log('[v0] No active session found')
      return NextResponse.json({ session: null })
    }

    console.log('[v0] Session found for user:', session.user?.email)
    return NextResponse.json({ session })
  } catch (error) {
    console.error('[v0] Session check error:', error)
    return NextResponse.json({ session: null })
  }
}
