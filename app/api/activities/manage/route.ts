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

    // First, get all project_activities for this project
    const { data: projectActivitiesData, error: paError } = await supabase
      .from('project_activities')
      .select('id, project_id, activity_id, status, progress_percentage, responsible_user_id, responsible_department, sharepoint_link, actual_start_date, actual_end_date, duration_days, estimated_duration_days, notes, slack_days, created_at, updated_at')
      .eq('project_id', projectId)

    if (paError) {
      console.error('[v0] Error fetching project_activities:', paError)
      return NextResponse.json({ error: paError.message, code: paError.code }, { status: 400 })
    }

    // Then, get all activities referenced by these project_activities
    if (!projectActivitiesData || projectActivitiesData.length === 0) {
      console.log('[v0] No project_activities found for this project')
      return NextResponse.json([])
    }

    const activityIds = projectActivitiesData.map((pa: any) => pa.activity_id).filter(Boolean)
    
    const { data: activitiesData, error: aError } = await supabase
      .from('activities')
      .select('id, code, name, objective, phase_id, parent_activity_id, is_subactivity, base_duration_value, base_duration_unit, responsible_actor')
      .in('id', activityIds)

    if (aError) {
      console.error('[v0] Error fetching activities:', aError)
      return NextResponse.json({ error: aError.message, code: aError.code }, { status: 400 })
    }

    // Then, get all phases for these activities
    const phaseIds = activitiesData.map((a: any) => a.phase_id).filter(Boolean)
    
    const { data: phasesData, error: phError } = await supabase
      .from('phases')
      .select('id, name, phase_number, description')
      .in('id', phaseIds)

    if (phError) {
      console.error('[v0] Error fetching phases:', phError)
      return NextResponse.json({ error: phError.message, code: phError.code }, { status: 400 })
    }

    // Create lookup maps for efficient merging
    const activitiesMap = activitiesData.reduce((acc: any, a: any) => {
      acc[a.id] = a
      return acc
    }, {})

    const phasesMap = phasesData.reduce((acc: any, p: any) => {
      acc[p.id] = p
      return acc
    }, {})

    // Merge data together
    const mergedData = projectActivitiesData.map((pa: any) => ({
      ...pa,
      activities: activitiesMap[pa.activity_id] ? {
        ...activitiesMap[pa.activity_id],
        phases: phasesMap[activitiesMap[pa.activity_id].phase_id] || null
      } : null
    }))

    console.log('[v0] Activities fetched successfully:', mergedData.length)
    return NextResponse.json(mergedData)
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
