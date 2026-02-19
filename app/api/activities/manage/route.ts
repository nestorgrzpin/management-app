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

// GET activities for a project with full details, grouped by phases
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json({ error: 'Missing project_id' }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    // Query project_activities with JOIN to activities and phases
    const { data, error } = await supabase
      .from('project_activities')
      .select(`
        id,
        project_id,
        activity_id,
        status,
        progress_percentage,
        responsible_user_id,
        responsible_department,
        sharepoint_link,
        actual_start_date,
        actual_end_date,
        duration_days,
        estimated_duration_days,
        notes,
        slack_days,
        created_at,
        updated_at,
        activities(
          id,
          code,
          name,
          objective,
          phase_id,
          parent_activity_id,
          is_subactivity,
          base_duration_value,
          base_duration_unit,
          responsible_actor,
          phases(id, name, order)
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching activities:', error)
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      )
    }

    console.log('[v0] Activities fetched successfully:', data?.length || 0)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH to update activity details
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      activity_id,
      status,
      progress_percentage,
      responsible_user_id,
      responsible_department,
      sharepoint_link,
      actual_start_date,
      actual_end_date,
      duration_days,
      estimated_duration_days,
      notes,
    } = body

    if (!activity_id) {
      return NextResponse.json({ error: 'Missing activity_id' }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (progress_percentage !== undefined) updateData.progress_percentage = progress_percentage
    if (responsible_user_id !== undefined) updateData.responsible_user_id = responsible_user_id
    if (responsible_department !== undefined) updateData.responsible_department = responsible_department
    if (sharepoint_link !== undefined) updateData.sharepoint_link = sharepoint_link
    if (actual_start_date !== undefined) updateData.actual_start_date = actual_start_date
    if (actual_end_date !== undefined) updateData.actual_end_date = actual_end_date
    if (duration_days !== undefined) updateData.duration_days = duration_days
    if (estimated_duration_days !== undefined) updateData.estimated_duration_days = estimated_duration_days
    if (notes !== undefined) updateData.notes = notes
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('project_activities')
      .update(updateData)
      .eq('id', activity_id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating activity:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[v0] Activity updated:', activity_id)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
