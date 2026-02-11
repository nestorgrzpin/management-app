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
      user_full_name,
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

    console.log('[v0] Ensuring user exists in users table...')
    // Use upsert to ensure user exists - don't fail if it already does
    const { error: userUpsertError } = await supabase
      .from('users')
      .upsert({
        id: user_id,
        email: user_email,
        full_name: user_full_name || user_email || 'Usuario',
        role: 'analyst',
      }, {
        onConflict: 'id'
      })

    if (userUpsertError) {
      console.error('[v0] Error ensuring user exists:', userUpsertError)
      return NextResponse.json({ error: `User sync failed: ${userUpsertError.message}` }, { status: 400 })
    }

    console.log('[v0] User synced successfully')

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

    // Clone template activities to project
    console.log('[v0] Cloning template activities...')
    const { data: templateActivities, error: templateError } = await supabase
      .from('activities')
      .select('*')
      .is('project_id', null)  // Get template activities (no project_id)
      .order('code', { ascending: true })

    if (templateError) {
      console.error('[v0] Error fetching template activities:', templateError)
    } else if (templateActivities && templateActivities.length > 0) {
      console.log(`[v0] Found ${templateActivities.length} template activities to clone`)
      
      const activitiesToInsert = templateActivities.map((template: any) => ({
        project_id: project.id,
        code: template.code,
        name: template.name,
        objective: template.objective,
        expected_info: template.expected_info,
        phase_id: template.phase_id,
        is_subactivity: template.is_subactivity,
        base_duration_value: template.base_duration_value,
        base_duration_unit: template.base_duration_unit,
        parent_activity_id: template.parent_activity_id,
      }))

      const { error: insertError, data: insertedActivities } = await supabase
        .from('activities')
        .insert(activitiesToInsert)
        .select()

      if (insertError) {
        console.error('[v0] Error inserting activities:', insertError)
      } else {
        console.log(`[v0] Successfully cloned ${insertedActivities?.length || 0} activities`)
      }
    }

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
