'use client'

export function EnvDiagnostics() {
  const supabaseUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : null
  const supabaseKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : null

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-bold text-red-900 mb-2">Verificación de Configuración</h3>
        <ul className="text-sm text-red-800 space-y-1">
          <li>NEXT_PUBLIC_SUPABASE_URL: {supabaseUrl ? '✓' : '✗ No configurada'}</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {supabaseKey ? '✓' : '✗ No configurada'}</li>
        </ul>
        <p className="text-xs text-red-700 mt-3">
          Asegúrate de que las variables están en la sección Vars de v0. Puede necesitar recargar la página.
        </p>
      </div>
    )
  }

  return null
}
