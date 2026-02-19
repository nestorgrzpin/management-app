'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  fase: string
  presupuesto: number
  estado: string
  fecha_inicio?: string
  fecha_fin?: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [groupedProjects, setGroupedProjects] = useState<Record<string, Project[]>>({})
  const router = useRouter()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        groupProjectsByPhase(data)
      }
    } catch (error) {
      console.error('[v0] Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupProjectsByPhase = (projectsList: Project[]) => {
    const grouped: Record<string, Project[]> = {
      'Identificación': [],
      'Preparación de propuesta': [],
      'Adjudicación': [],
      'Completados': []
    }

    projectsList.forEach((project) => {
      const fase = project.fase || 'Identificación'
      if (grouped[fase]) {
        grouped[fase].push(project)
      } else {
        grouped['Identificación'].push(project)
      }
    })

    setGroupedProjects(grouped)
  }

  const columns = [
    {
      key: 'Identificación',
      title: 'Identificación de Oportunidades',
      subtitle: 'Análisis y evaluación inicial',
      color: 'bg-blue-50',
      borderColor: 'border-blue-300',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'Preparación de propuesta',
      title: 'Preparación de Propuesta',
      subtitle: 'Diseño y cotizaciones',
      color: 'bg-purple-50',
      borderColor: 'border-purple-300',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'Adjudicación',
      title: 'Adjudicación y Ejecución',
      subtitle: 'Contratación e implementación',
      color: 'bg-green-50',
      borderColor: 'border-green-300',
      badgeColor: 'bg-green-100 text-green-800'
    },
    {
      key: 'Completados',
      title: 'Completados',
      subtitle: 'Proyectos finalizados',
      color: 'bg-gray-50',
      borderColor: 'border-gray-300',
      badgeColor: 'bg-gray-100 text-gray-800'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Ejecutivo</h1>
          <p className="text-gray-600 mt-1">Gestiona tus proyectos con vista por fases</p>
        </div>
        <Button onClick={() => router.push('/dashboard/projects/new')} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Cargando proyectos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {columns.map((column) => {
            const columnProjects = groupedProjects[column.key] || []
            const totalAmount = columnProjects.reduce((sum, p) => sum + (p.presupuesto || 0), 0)

            return (
              <div key={column.key} className="flex flex-col">
                {/* Column Header */}
                <div className={`${column.color} ${column.borderColor} border rounded-t-lg p-4 space-y-2`}>
                  <h2 className="text-lg font-bold text-gray-900">{column.title}</h2>
                  <p className="text-sm text-gray-600">{column.subtitle}</p>
                  <div className="flex justify-between pt-2">
                    <div className={`${column.badgeColor} px-3 py-1 rounded text-xs font-semibold`}>
                      {columnProjects.length} proyectos
                    </div>
                    <div className={`${column.badgeColor} px-3 py-1 rounded text-xs font-semibold`}>
                      ${(totalAmount / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                {/* Projects List */}
                <div className={`${column.color} rounded-b-lg border border-t-0 ${column.borderColor} p-4 space-y-3 min-h-96 overflow-y-auto`}>
                  {columnProjects.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">Sin proyectos</p>
                  ) : (
                    columnProjects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="block"
                      >
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold line-clamp-2">
                              {project.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="text-xs text-gray-600">
                              <p>Presupuesto: ${(project.presupuesto / 1000000).toFixed(1)}M</p>
                              <p className="capitalize">Estado: {project.estado || 'Sin definir'}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
