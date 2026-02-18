export async function GET() {
  return Response.json({
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
