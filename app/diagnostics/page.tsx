import { getSupabaseServer } from '@/lib/supabase-server'

export default async function DiagnosticsPage() {
  const supabase = await getSupabaseServer()

  // Query information schema to get column names
  const { data: activitiesData } = await supabase.rpc('get_table_columns', {
    table_name: 'activities'
  }).catch(() => ({ data: null }))

  const { data: projectActivitiesData } = await supabase.rpc('get_table_columns', {
    table_name: 'project_activities'
  }).catch(() => ({ data: null }))

  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold mb-4">Database Diagnostics</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Activities Table Columns:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre>{JSON.stringify(activitiesData, null, 2)}</pre>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Project Activities Table Columns:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre>{JSON.stringify(projectActivitiesData, null, 2)}</pre>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm">Copy the column names above and share them so I can adapt the queries to your database structure.</p>
      </div>
    </div>
  )
}
