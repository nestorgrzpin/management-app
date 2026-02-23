import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Generate activity template for a project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, projectType } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Get all activities from the activities table (template)
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, code, name, base_duration_value, base_duration_unit, responsible_actor, phase_id, parent_activity_id, is_subactivity')
      .order('phase_id, code', { ascending: true })

    if (activitiesError) {
      console.error('[v0] Error fetching template activities:', activitiesError)
      return NextResponse.json(
        { error: 'Error fetching template activities', details: activitiesError.message },
        { status: 400 }
      )
    }

    if (!activities || activities.length === 0) {
      return NextResponse.json(
        { error: 'No template activities found' },
        { status: 400 }
      )
    }

    // Create project_activities for each template activity
    const projectActivitiesToCreate = activities.map((activity: any) => ({
      project_id: projectId,
      activity_id: activity.id,
      status: 'not_started',
      progress_percentage: 0,
      estimated_duration_days: activity.base_duration_value || 0,
    }))

    const { data: createdActivities, error: createError } = await supabase
      .from('project_activities')
      .insert(projectActivitiesToCreate)
      .select()

    if (createError) {
      console.error('[v0] Error creating project activities:', createError)
      return NextResponse.json(
        { error: 'Error creating project activities', details: createError.message },
        { status: 400 }
      )
    }

    console.log('[v0] Project template generated:', createdActivities?.length, 'activities created')
    return NextResponse.json({
      message: 'Template generated successfully',
      activitiesCount: createdActivities?.length || 0,
    })
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
