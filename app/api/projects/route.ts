import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

async function getSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const {
      name,
      client,
      start_date,
      estimated_amount,
      adjudication_type,
      estimated_execution_date,
      user_id,
      user_email,
    } = await request.json()

    console.log('[v0] Creating project with data:', {
      name,
      client,
      start_date,
      estimated_amount,
      adjudication_type,
      estimated_execution_date,
      user_id,
    })

    // Ensure user exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single()

    if (checkError || !existingUser) {
      console.log('[v0] User not in users table, creating entry...')
      const { error: userInsertError } = await supabase
        .from('users')
        .insert({
          id: user_id,
          email: user_email,
          role: 'analyst',
        })

      if (userInsertError) {
        console.error('[v0] Error creating user entry:', userInsertError)
        // Continue anyway - might already exist
      }
    }

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        client,
        start_date,
        estimated_amount,
        adjudication_type,
        estimated_execution_date,
        created_by: user_id,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating project:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[v0] Project created:', project)

    return NextResponse.json(project)
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    console.log('[v0] Fetching projects for user:', userId)

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching projects:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[v0] Projects fetched:', data?.length || 0)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
