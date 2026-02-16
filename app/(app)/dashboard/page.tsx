'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedProject, setDraggedProject] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProjects = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch(`/api/projects?user_id=${session.user.id}`)
        const data = await response.json()
        
        console.log('[v0] Projects loaded from API:', data)
        
        if (Array.isArray(data)) {
          console.log('[v0] First project ingresos_maximo:', data[0]?.ingresos_maximo, 'Type:', typeof data[0]?.ingresos_maximo)
          console.log('[v0] First project full:', JSON.stringify(data[0]))
          setProjects(data)
        } else {
          console.error('[v0] API response is not an array:', data)
          setProjects([])
        }
      } catch (error) {
        console.error('[v0] Error loading projects:', error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [router, supabase])

  // Group projects by fase
  const groupedProjects = {
    'Preparación de propuesta': projects.filter(p => p.fase === 'Preparación de propuesta'),
    'Adjudicación y ejecución': projects.filter(p => ['Adjudicación', 'Ejecución'].includes(p.fase)),
    'Completados': projects.filter(p => p.fase === 'Cierre'),
  }

  // Calculate column metrics
  const getColumnMetrics = (projectList: any[]) => {
    const count = projectList.length
    const totalAmount = projectList.reduce((sum, p) => sum + (Number(p.ingresos_maximo) || 0), 0)
    const avgUtility = projectList.length > 0 
      ? projectList.reduce((sum, p) => sum + (Number(p.utilidad_porcentaje) || 0), 0) / projectList.length
      : 0

    return { count, totalAmount, avgUtility: Math.round(avgUtility) }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, project: any) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault()
    
    if (!draggedProject) return

    // Determine new fase based on target column
    let newFase = draggedProject.fase
    
    if (targetColumn === 'Adjudicación y ejecución') {
      newFase = 'Adjudicación'
    } else if (targetColumn === 'Completados') {
      newFase = 'Cierre'
    } else if (targetColumn === 'Preparación de propuesta') {
      newFase = 'Preparación de propuesta'
    }

    // Update in database
    try {
      const { error } = await supabase
        .from('projects')
        .update({ fase: newFase })
        .eq('id', draggedProject.id)

      if (!error) {
        // Update local state
        setProjects(projects.map(p => 
          p.id === draggedProject.id ? { ...p, fase: newFase } : p
        ))
      }
    } catch (error) {
      console.error('[v0] Error updating project:', error)
    } finally {
      setDraggedProject(null)
    }
  }

  const columnConfigs = [
    {
      title: 'Planificación',
      subtitle: 'Identificación de oportunidad y preparación de propuesta',
      key: 'Preparación de propuesta',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
      textColor: 'text-blue-700',
    },
    {
      title: 'En progreso',
      subtitle: 'Adjudicación y contratación; y ejecución',
      key: 'Adjudicación y ejecución',
      color: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
      textColor: 'text-amber-700',
    },
    {
      title: 'Completados',
      subtitle: 'Cierre',
      key: 'Completados',
      color: 'bg-green-50',
      borderColor: 'border-green-200',
      badgeColor: 'bg-green-100 text-green-800',
      textColor: 'text-green-700',
    },
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
          <p className="text-gray-500">Cargando proyectos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columnConfigs.map((config) => {
            const columnProjects = groupedProjects[config.key as keyof typeof groupedProjects] || []
            const metrics = getColumnMetrics(columnProjects)

            return (
              <div key={config.key} className="flex flex-col">
                {/* Column Header */}
                <div className={`${config.color} ${config.borderColor} border rounded-t-lg p-4 space-y-2`}>
                  <h2 className="text-lg font-bold text-gray-900">{config.title}</h2>
                  <p className="text-sm text-gray-600">{config.subtitle}</p>
                  
                  {/* Column Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className={`${config.badgeColor} px-2 py-1 rounded text-xs font-semibold text-center`}>
                      <div className="text-base">{metrics.count}</div>
                      <div className="text-xs">Proyectos</div>
                    </div>
                    <div className={`${config.badgeColor} px-2 py-1 rounded text-xs font-semibold text-center`}>
                      <div className="text-base">${metrics.totalAmount.toFixed(0)}M</div>
                      <div className="text-xs">Millones</div>
                    </div>
                    <div className={`${config.badgeColor} px-2 py-1 rounded text-xs font-semibold text-center`}>
                      <div className="text-base">{metrics.avgUtility}%</div>
                      <div className="text-xs">Utilidad</div>
                    </div>
                  </div>
                </div>

                {/* Column Cards */}
                <div 
                  className={`${config.color} ${config.borderColor} border border-t-0 rounded-b-lg p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px]`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, config.key)}
                >
                  {columnProjects.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">Sin proyectos en esta fase</p>
                    </div>
                  ) : (
                    columnProjects.map((project) => (
                      <Card 
                        key={project.id} 
                        className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow"
                        draggable
                        onDragStart={(e) => handleDragStart(e as any, project)}
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      >
                        <CardContent className="pt-6 space-y-3">
                          {/* Show different info based on column */}
                          {config.key === 'Preparación de propuesta' && (
                            <div className="space-y-3 text-xs">
                              {/* Title Section - First line: PROJECT NAME (METODO) */}
                              <div className="border-b pb-2 mb-2">
                                <p className="font-bold text-gray-900">{project.name} ({project.adjudication_type || 'SIN METODO'})</p>
                                <p className="text-gray-600 text-xs mt-1">{project.client} – {project.relacion} - {project.empresa}</p>
                              </div>

                              {/* Financial metrics - 4 columns */}
                              <div className="grid grid-cols-4 gap-1 border-b pb-2">
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.ingresos_maximo ? Number(project.ingresos_maximo).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Ingreso</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.costo ? Number(project.costo).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Costo</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.utilidad ? Number(project.utilidad).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Utilidad</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">{project.utilidad_porcentaje ? Number(project.utilidad_porcentaje) : '0'}%</p>
                                  <p className="text-gray-600">Utilidad</p>
                                </div>
                              </div>

                              {/* Dates */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{format(new Date(project.start_date), 'dd/MM/yyyy', { locale: es })}</p>
                                  <p className="text-gray-600">Fecha de inicio</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{format(new Date(project.estimated_execution_date), 'dd/MM/yyyy', { locale: es })}</p>
                                  <p className="text-gray-600">Fecha de fin</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {config.key === 'Adjudicación y ejecución' && (
                            <div className="space-y-3 text-xs">
                              {/* Title Section - First line: PROJECT NAME (METODO) */}
                              <div className="border-b pb-2 mb-2">
                                <p className="font-bold text-gray-900">{project.name} ({project.adjudication_type || 'SIN METODO'})</p>
                                <p className="text-gray-600 text-xs mt-1">{project.client} – {project.relacion} - {project.empresa}</p>
                              </div>

                              {/* Financial metrics - 4 columns */}
                              <div className="grid grid-cols-4 gap-1 border-b pb-2">
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.ingresos_maximo ? Number(project.ingresos_maximo).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Ingreso</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.costo ? Number(project.costo).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Costo</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.utilidad ? Number(project.utilidad).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Utilidad</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">{project.utilidad_porcentaje ? Number(project.utilidad_porcentaje) : '0'}%</p>
                                  <p className="text-gray-600">Utilidad</p>
                                </div>
                              </div>

                              {/* Payment metrics - 3 columns */}
                              <div className="grid grid-cols-3 gap-1 border-b pb-2">
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.devengado ? Number(project.devengado).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Devengado</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.pagado ? Number(project.pagado).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Pagado</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.por_cobrar ? Number(project.por_cobrar).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Por cobrar</p>
                                </div>
                              </div>

                              {/* Dates */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{format(new Date(project.start_date), 'dd/MM/yyyy', { locale: es })}</p>
                                  <p className="text-gray-600">Fecha de inicio</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{format(new Date(project.estimated_execution_date), 'dd/MM/yyyy', { locale: es })}</p>
                                  <p className="text-gray-600">Fecha de fin</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {config.key === 'Completados' && (
                            <div className="space-y-3 text-xs">
                              {/* Title Section - First line: PROJECT NAME (METODO) */}
                              <div className="border-b pb-2 mb-2">
                                <p className="font-bold text-gray-900">{project.name} ({project.adjudication_type || 'SIN METODO'})</p>
                                <p className="text-gray-600 text-xs mt-1">{project.client} – {project.relacion} - {project.empresa}</p>
                              </div>

                              {/* Financial metrics - 4 columns */}
                              <div className="grid grid-cols-4 gap-1 border-b pb-2">
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.ingresos_maximo ? Number(project.ingresos_maximo).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Ingreso</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.costo ? Number(project.costo).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Costo</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.utilidad ? Number(project.utilidad).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Utilidad</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">{project.utilidad_porcentaje ? Number(project.utilidad_porcentaje) : '0'}%</p>
                                  <p className="text-gray-600">Utilidad</p>
                                </div>
                              </div>

                              {/* Payment metrics - 3 columns */}
                              <div className="grid grid-cols-3 gap-1 border-b pb-2">
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.devengado ? Number(project.devengado).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Devengado</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.pagado ? Number(project.pagado).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Pagado</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-gray-900 text-sm">${project.por_cobrar ? Number(project.por_cobrar).toFixed(0) : '0'}m</p>
                                  <p className="text-gray-600">Por cobrar</p>
                                </div>
                              </div>

                              {/* Dates */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{format(new Date(project.start_date), 'dd/MM/yyyy', { locale: es })}</p>
                                  <p className="text-gray-600">Fecha de inicio</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{format(new Date(project.estimated_execution_date), 'dd/MM/yyyy', { locale: es })}</p>
                                  <p className="text-gray-600">Fecha de fin</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
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
