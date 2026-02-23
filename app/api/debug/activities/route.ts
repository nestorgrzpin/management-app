import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Check template activities (project_id IS NULL)
    const { data: templateActivities, error: templateError } = await supabase
      .from('activities')
      .select('id, code, name, project_id, base_duration_value, base_duration_unit')
      .is('project_id', null)
      .limit(5)

    // Check all projects
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id, name, created_at')
      .limit(5)

    // Check activities for first project
    let projectActivities = []
    if (projects && projects.length > 0) {
      const { data: acts } = await supabase
        .from('activities')
        .select('id, code, name, project_id')
        .eq('project_id', projects[0].id)
        .limit(5)
      projectActivities = acts || []
    }

    return NextResponse.json({
      template_activities_count: templateActivities?.length || 0,
      template_activities: templateActivities,
      template_error: templateError,
      projects_count: projects?.length || 0,
      projects: projects,
      project_error: projectError,
      first_project_activities: projectActivities,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
