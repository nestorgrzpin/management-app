import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      client,
      start_date,
      estimated_amount,
      procurement_type,
      execution_date,
      user_id,
    } = await request.json()

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        client,
        start_date,
        estimated_amount,
        procurement_type,
        execution_date,
        user_id,
        status: 'planning',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Clone template activities
    const { data: templateActivities } = await supabase
      .from('template_activities')
      .select('*')
      .order('code', { ascending: true })

    if (templateActivities && templateActivities.length > 0) {
      const activitiesToInsert = templateActivities.map((template: any) => ({
        project_id: project.id,
        phase: template.phase,
        code: template.code,
        name: template.name,
        duration_hours: template.duration_hours,
        duration_days: template.duration_days,
      }))

      await supabase.from('project_activities').insert(activitiesToInsert)
    }

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
