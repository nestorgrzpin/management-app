import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get schema info for activities table
    const { data: activitiesColumns, error: activitiesError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'activities')

    // Get schema info for project_activities table
    const { data: projectActivitiesColumns, error: projectActivitiesError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'project_activities')

    return NextResponse.json({
      activities_columns: activitiesColumns || [],
      activities_error: activitiesError?.message,
      project_activities_columns: projectActivitiesColumns || [],
      project_activities_error: projectActivitiesError?.message,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
