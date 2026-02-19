'use client'

import { useEffect, useState } from 'react'

export function EnvDiagnostics() {
  const [mounted, setMounted] = useState(false)
  const [supabaseUrl, setSupabaseUrl] = useState<boolean>(false)
  const [supabaseKey, setSupabaseKey] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    setSupabaseUrl(!!process.env.NEXT_PUBLIC_SUPABASE_URL)
    setSupabaseKey(!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])

  // Don't render anything until mounted on client
  if (!mounted) {
    return null
  }

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
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
