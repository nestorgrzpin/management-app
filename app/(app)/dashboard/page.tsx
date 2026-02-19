'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import Image from 'next/image'

interface Project {
  id: string
  name: string
  client: string
  relacion?: string
  empresa?: string
  ingresos_maximo: number
  costo: number
  utilidad: number
  utilidad_porcentaje: number
  devengado?: number
  pagado?: number
  por_cobrar?: number
  start_date: string
  estimated_execution_date: string
  status: string
  fase?: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data || [])
      } else {
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

  const getNewFaseFromEtapa = (etapa: string) => {
    if (etapa === 'Planeación') return 'Identificación de oportunidades'
    if (etapa === 'Ejecución') return 'Adjudicación y contratación'
    if (etapa === 'Cierre') return 'Cierre'
    return 'Identificación de oportunidades'
  }

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetEtapa: string) => {
    e.preventDefault()

    if (!draggedProject) return

    const newFase = getNewFaseFromEtapa(targetEtapa)

    // Optimistic update
    setProjects(projects.map(p =>
      p.id === draggedProject.id ? { ...p, fase: newFase } : p
    ))

    try {
      const response = await fetch(`/api/projects/${draggedProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fase: newFase })
      })

      if (!response.ok) {
        // Revert on error
        setProjects(projects.map(p =>
          p.id === draggedProject.id ? draggedProject : p
        ))
      }
    } catch (err) {
      console.error('[v0] Error updating project:', err)
      // Revert on error
      setProjects(projects.map(p =>
        p.id === draggedProject.id ? draggedProject : p
      ))
    } finally {
      setDraggedProject(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const stages = ['Planeación', 'Ejecución', 'Cierre']

  // Calculate stage statistics
  const getStageStats = (stage: string) => {
    const stageProjects = projects.filter((p) => mapFaseToEtapa(p.fase) === stage)
    const totalProjects = stageProjects.length
    const totalIngresos = stageProjects.reduce((sum, p) => sum + (p.ingresos_maximo || 0), 0)
    const percentage = projects.length > 0 ? Math.round((totalProjects / projects.length) * 100) : 0

    return { totalProjects, totalIngresos, percentage, projects: stageProjects }
  }

  return (
    <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
      {/* Header con logos */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Panel Ejecutivo</h1>
          <p className="text-gray-600">Gestión centralizada de proyectos y actividades</p>
        </div>
        <div className="flex gap-6 items-center">
          <div className="relative w-20 h-10">
            <Image 
              src="/images/SIE.png" 
              alt="SIE Technologies" 
              fill
              className="object-contain"
            />
          </div>
          <div className="relative w-32 h-10">
            <Image 
              src="/images/Telinfra.png" 
              alt="Telinfra Sistemas" 
              fill
              className="object-contain"
            />
          </div>
          <Button onClick={() => router.push('/dashboard/projects/new')} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </Button>
        </div>
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
            const { totalProjects, totalIngresos, percentage, projects: stageProjects } = getStageStats(stage)
            return (
              <div
                key={stage}
                className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Header con estadísticas mejorado */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 rounded-t-lg">
                  <h2 className="text-lg font-bold text-gray-900">{stage}</h2>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="bg-white rounded p-2 border border-blue-200">
                      <p className="text-sm font-bold text-blue-700">{totalProjects}</p>
                      <p className="text-xs text-gray-600">Proyectos</p>
                    </div>
                    <div className="bg-white rounded p-2 border border-indigo-200">
                      <p className="text-sm font-bold text-indigo-700">${totalIngresos}M</p>
                      <p className="text-xs text-gray-600">Ingresos</p>
                    </div>
                    <div className="bg-white rounded p-2 border border-green-200">
                      <p className="text-sm font-bold text-green-700">{percentage}%</p>
                      <p className="text-xs text-gray-600">Del total</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-96">
                  {stageProjects.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Sin proyectos</p>
                  ) : (
                    stageProjects.map((project) => (
                      <div
                        key={project.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, project)}
                        className="bg-white border border-gray-300 rounded p-3 cursor-move hover:shadow-md transition hover:border-gray-400 select-none"
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      >
                        {/* Título y relación */}
                        <h3 className="font-bold text-sm leading-tight">
                          {project.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {project.client && project.relacion && project.empresa
                            ? `${project.client} - ${project.relacion} - ${project.empresa}`
                            : project.client || 'Sin cliente'}
                        </p>

                        {/* Métricas financieras principales */}
                        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              {project.ingresos_maximo}m
                            </p>
                            <p className="text-xs text-gray-600">Ingreso</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              {project.costo || 0}m
                            </p>
                            <p className="text-xs text-gray-600">Costo</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              {project.utilidad || 0}m
                            </p>
                            <p className="text-xs text-gray-600">Utilidad</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              {project.utilidad_porcentaje || 0}%
                            </p>
                            <p className="text-xs text-gray-600">Util %</p>
                          </div>
                        </div>

                        {/* Datos de ejecución (visible solo en etapa Ejecución) */}
                        {stage === 'Ejecución' && (project.devengado || project.pagado || project.por_cobrar) && (
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-xs font-semibold text-gray-800">
                                {project.devengado || 0}m
                              </p>
                              <p className="text-xs text-gray-600">Devengado</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800">
                                {project.pagado || 0}m
                              </p>
                              <p className="text-xs text-gray-600">Pagado</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800">
                                {project.por_cobrar || 0}m
                              </p>
                              <p className="text-xs text-gray-600">Por cobrar</p>
                            </div>
                          </div>
                        )}

                        {/* Fechas */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              {formatDate(project.start_date)}
                            </p>
                            <p className="text-xs text-gray-600">Inicio</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              {formatDate(project.estimated_execution_date)}
                            </p>
                            <p className="text-xs text-gray-600">Fin</p>
                          </div>
                        </div>
                      </div>
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
