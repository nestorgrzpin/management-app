'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

export function EnvDiagnostics() {
  const [mounted, setMounted] = useState(false)
  const [hasUrl, setHasUrl] = useState(false)
  const [hasKey, setHasKey] = useState(false)

  useEffect(() => {
    // Check if environment variables are available
    const url = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined
    const key = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined

    setHasUrl(!!url)
    setHasKey(!!key)
    setMounted(true)
  }, [])

  // Only render after hydration to prevent mismatch
  if (!mounted) {
    return null
  }

  // If both variables are present, don't show anything
  if (hasUrl && hasKey) {
    return null
  }

  // Show error if variables are missing
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold text-red-900">Configuración Incompleta</h3>
        <ul className="text-sm text-red-800 mt-2 space-y-1">
          {!hasUrl && <li>✗ NEXT_PUBLIC_SUPABASE_URL no está configurada</li>}
          {!hasKey && <li>✗ NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada</li>}
        </ul>
        <p className="text-xs text-red-700 mt-3">
          Configura estas variables en la sección Vars de v0 y recarga la página.
        </p>
      </div>
    </div>
  )
}
