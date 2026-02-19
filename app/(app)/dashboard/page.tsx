'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
  client: string
  ingresos_maximo: number
  status: string
  fase?: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      console.log('[v0] Loading projects from API')
      
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Projects loaded:', data?.length || 0)
        setProjects(data || [])
      } else {
        console.error('[v0] API error:', response.status, response.statusText)
        setError('Error al cargar proyectos')
      }
    } catch (err) {
      console.error('[v0] Error loading projects:', err)
      setError('Fallo al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  const mapFaseToEtapa = (fase?: string) => {
    if (!fase) return 'Planeación'
    
    if (fase === 'Identificación de oportunidades' || fase === 'Preparación de propuesta') {
      return 'Planeación'
    }
    if (fase === 'Adjudicación y contratación' || fase === 'Ejecución' || fase === 'Monitoreo y control') {
      return 'Ejecución'
    }
    if (fase === 'Cierre') {
      return 'Cierre'
    }
    return 'Planeación'
  }

  const stages = ['Planeación', 'Ejecución', 'Cierre']
  
  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Panel Ejecutivo</h1>
          <p className="text-gray-600">Gestión centralizada de proyectos y actividades</p>
        </div>
        <Button onClick={() => router.push('/dashboard/projects/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando proyectos...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {stages.map((stage) => {
            const stageProjects = projects.filter((p) => mapFaseToEtapa(p.fase) === stage)
            return (
              <Card key={stage} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{stage}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {stageProjects.length} proyecto{stageProjects.length !== 1 ? 's' : ''}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  {stageProjects.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Sin proyectos</p>
                  ) : (
                    stageProjects.map((project) => (
                      <Card 
                        key={project.id} 
                        className="p-3 cursor-pointer hover:bg-gray-50 transition border-gray-200"
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      >
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.client}</p>
                        <p className="text-xs text-gray-400 mt-1">${project.ingresos_maximo}M</p>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
