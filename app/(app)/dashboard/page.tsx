'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
  fase: string
  presupuesto: number
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      console.log('[v0] Loading projects from API')
      
      // Fetch projects directly without user_id
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Projects loaded:', data?.length || 0)
        setProjects(data || [])
      } else {
        console.error('[v0] API error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('[v0] Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mapear fases a etapas según reglas de negocio
  const mapFaseToEtapa = (fase: string) => {
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
          <p className="text-gray-600 mt-1">Gestión centralizada de proyectos y actividades</p>
        </div>
        <Button onClick={() => router.push('/dashboard/projects/new')} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando proyectos...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {stages.map((stage) => {
            const stageProjects = projects.filter((p) => mapFaseToEtapa(p.fase) === stage)
            return (
              <Card key={stage} className="flex flex-col">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg">{stage}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {stageProjects.length} proyecto{stageProjects.length !== 1 ? 's' : ''}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 pt-4 flex-1">
                  {stageProjects.length > 0 ? (
                    stageProjects.map((project) => (
                      <Card 
                        key={project.id} 
                        className="p-3 cursor-pointer hover:bg-blue-50 transition border"
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      >
                        <p className="font-medium text-sm text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Presupuesto: ${project.presupuesto}M
                        </p>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">Sin proyectos</p>
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
