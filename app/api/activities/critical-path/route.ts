import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

interface ActivityNode {
  id: string
  code: string
  duration_days: number
  predecessor_code: string | null
  phase_id: string | null
}

interface CalculatedActivity extends ActivityNode {
  earliest_start: number
  earliest_end: number
  latest_start: number
  latest_end: number
  slack_days: number
  is_critical: boolean
}

// Calculate critical path using forward and backward pass
function calculateCriticalPath(activities: ActivityNode[]): CalculatedActivity[] {
  const activityMap = new Map(activities.map(a => [a.code, a]))
  const results: CalculatedActivity[] = []

  // First pass: Calculate earliest start and end times
  const processed = new Set<string>()
  const calculateEarliest = (code: string): { start: number; end: number } => {
    const activity = activityMap.get(code)
    if (!activity) return { start: 0, end: 0 }

    if (processed.has(code)) {
      const result = results.find(r => r.code === code)
      return result ? { start: result.earliest_start, end: result.earliest_end } : { start: 0, end: 0 }
    }

    let earliestStart = 0
    if (activity.predecessor_code) {
      const predecessor = calculateEarliest(activity.predecessor_code)
      earliestStart = predecessor.end
    }

    const earliestEnd = earliestStart + activity.duration_days

    results.push({
      ...activity,
      earliest_start: earliestStart,
      earliest_end: earliestEnd,
      latest_start: 0,
      latest_end: 0,
      slack_days: 0,
      is_critical: false,
    })

    processed.add(code)
    return { start: earliestStart, end: earliestEnd }
  }

  activities.forEach(a => calculateEarliest(a.code))

  // Find the project end date (max earliest_end)
  const projectEnd = Math.max(...results.map(r => r.earliest_end), 0)

  // Second pass: Calculate latest start and end times (backward pass)
  const processedBackward = new Set<string>()
  const calculateLatest = (code: string, projectEnd: number): { start: number; end: number } => {
    const activity = activityMap.get(code)
    if (!activity) return { start: projectEnd, end: projectEnd }

    if (processedBackward.has(code)) {
      const result = results.find(r => r.code === code)
      return result ? { start: result.latest_start, end: result.latest_end } : { start: projectEnd, end: projectEnd }
    }

    // Find all successors
    const successors = activities.filter(a => a.predecessor_code === code)

    let latestEnd = projectEnd
    if (successors.length > 0) {
      const successorEnds = successors.map(s => calculateLatest(s.code, projectEnd).start)
      latestEnd = Math.min(...successorEnds)
    } else if (!activity.predecessor_code) {
      // If this is the first activity, latest end = earliest end + slack
      const result = results.find(r => r.code === code)
      if (result) latestEnd = result.earliest_end
    }

    const latestStart = latestEnd - activity.duration_days

    const resultIndex = results.findIndex(r => r.code === code)
    if (resultIndex >= 0) {
      results[resultIndex].latest_start = latestStart
      results[resultIndex].latest_end = latestEnd
      results[resultIndex].slack_days = latestStart - results[resultIndex].earliest_start
      results[resultIndex].is_critical = results[resultIndex].slack_days === 0
    }

    processedBackward.add(code)
    return { start: latestStart, end: latestEnd }
  }

  activities.forEach(a => calculateLatest(a.code, projectEnd))

  return results
}

export async function POST(request: NextRequest) {
  try {
    const { project_id } = await request.json()

    if (!project_id) {
      return NextResponse.json({ error: 'Missing project_id' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Fetch all activities for the project
    const { data: projectActivities, error: fetchError } = await supabase
      .from('project_activities')
      .select(`
        id,
        activities(
          code,
          name,
          phase_id,
          predecessor_code,
          base_duration_value,
          base_duration_unit
        ),
        duration_days,
        estimated_duration_days
      `)
      .eq('project_id', project_id)

    if (fetchError) {
      console.error('[v0] Error fetching activities:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    if (!projectActivities || projectActivities.length === 0) {
      return NextResponse.json({ critical_path: [], message: 'No activities found' })
    }

    // Transform to activity nodes
    const activityNodes: ActivityNode[] = projectActivities
      .filter((pa: any) => pa.activities)
      .map((pa: any) => ({
        id: pa.id,
        code: pa.activities.code,
        duration_days: pa.duration_days || pa.estimated_duration_days || 1,
        predecessor_code: pa.activities.predecessor_code,
        phase_id: pa.activities.phase_id,
      }))

    // Calculate critical path
    const criticalPath = calculateCriticalPath(activityNodes)

    // Save slack times back to database
    for (const activity of criticalPath) {
      const { error: updateError } = await supabase
        .from('project_activities')
        .update({
          slack_days: activity.slack_days,
        })
        .eq('id', activity.id)

      if (updateError) {
        console.error(`[v0] Error updating slack for ${activity.code}:`, updateError)
      }
    }

    console.log('[v0] Critical path calculated:', criticalPath.filter(a => a.is_critical).map(a => a.code))
    return NextResponse.json({
      critical_path: criticalPath,
      project_duration_days: Math.max(...criticalPath.map(a => a.earliest_end), 0),
    })
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
