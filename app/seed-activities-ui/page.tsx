'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, Loader } from 'lucide-react'

export default function SeedActivitiesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/seed/activities', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Poblar Actividades de Plantilla</CardTitle>
            <CardDescription>
              Crear actividades basadas en la plantilla del PDF para todos los proyectos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                Esta acción creará <strong>72 actividades</strong> por cada proyecto existente basadas en la plantilla de 6 fases (Identificación, Preparación, Adjudicación, Ejecución, Monitoreo y Cierre).
              </p>
            </div>

            <Button
              onClick={handleSeed}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Generar Actividades'
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-sm text-red-800 mt-1">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900">Éxito</h3>
                    <p className="text-sm text-green-800 mt-1">{result.message}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-gray-900 mb-2">Resumen:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>✓ Actividades creadas: {result.data?.length || 0}</li>
                    <li>✓ Fases incluidas: 6 (Identificación, Preparación, Adjudicación, Ejecución, Monitoreo, Cierre)</li>
                    <li>✓ Todas las actividades comienzan en estado "Por iniciar"</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
