import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

export async function GET() {
  try {
    const supabase = await getSupabaseServer()

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
