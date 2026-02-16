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
        
        if (Array.isArray(data)) {
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
    const totalAmount = projectList.reduce((sum, p) => sum + (Number(p.ingresos) || 0), 0)
    const avgUtility = projectList.length > 0 
      ? projectList.reduce((sum, p) => sum + (Number(p.utilidad_porcentaje) || 0), 0) / projectList.length
      : 0

    return { count, totalAmount, avgUtility: Math.round(avgUtility) }
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
                      <div className="text-base">${(metrics.totalAmount / 1000).toFixed(0)}M</div>
                      <div className="text-xs">Millones</div>
                    </div>
                    <div className={`${config.badgeColor} px-2 py-1 rounded text-xs font-semibold text-center`}>
                      <div className="text-base">{metrics.avgUtility}%</div>
                      <div className="text-xs">Utilidad</div>
                    </div>
                  </div>
                </div>

                {/* Column Cards */}
                <div className={`${config.color} ${config.borderColor} border border-t-0 rounded-b-lg p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px]`}>
                  {columnProjects.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">Sin proyectos en esta fase</p>
                    </div>
                  ) : (
                    columnProjects.map((project) => (
                      <Card 
                        key={project.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm line-clamp-2">{project.name}</CardTitle>
                          <p className="text-xs text-gray-600 mt-1">{project.client}</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Show different info based on column */}
                          {config.key === 'Preparación de propuesta' && (
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Ingresos</span>
                                <span className="font-semibold">${Number(project.ingresos).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Costo</span>
                                <span className="font-semibold">${Number(project.costo).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Utilidad</span>
                                <span className="font-semibold">${Number(project.utilidad).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Utilidad %</span>
                                <span className="font-semibold">{Number(project.utilidad_porcentaje)}%</span>
                              </div>
                              <div className="flex justify-between items-center border-t pt-2 text-gray-700">
                                <span className="font-medium">Inicio:</span>
                                <span>{format(new Date(project.start_date), 'dd/MM/yyyy', { locale: es })}</span>
                              </div>
                              <div className="flex justify-between items-center text-gray-700">
                                <span className="font-medium">Fin:</span>
                                <span>{format(new Date(project.estimated_execution_date), 'dd/MM/yyyy', { locale: es })}</span>
                              </div>
                            </div>
                          )}

                          {config.key === 'Adjudicación y ejecución' && (
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Ingresos</span>
                                <span className="font-semibold">${Number(project.ingresos).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Costo</span>
                                <span className="font-semibold">${Number(project.costo).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Utilidad</span>
                                <span className="font-semibold">${Number(project.utilidad).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Utilidad %</span>
                                <span className="font-semibold">{Number(project.utilidad_porcentaje)}%</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1 border-t pt-2 text-xs">
                                <div className="text-center">
                                  <p className="text-gray-600">${Number(project.devengado)}</p>
                                  <p className="text-gray-500">Devengado</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-600">${Number(project.pagado)}</p>
                                  <p className="text-gray-500">Pagado</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-600">${Number(project.por_cobrar)}</p>
                                  <p className="text-gray-500">Por cobrar</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center border-t pt-2 text-gray-700">
                                <span className="font-medium">Inicio:</span>
                                <span className="text-xs">{format(new Date(project.start_date), 'dd/MM/yyyy', { locale: es })}</span>
                              </div>
                              <div className="flex justify-between items-center text-gray-700">
                                <span className="font-medium">Fin:</span>
                                <span className="text-xs">{format(new Date(project.estimated_execution_date), 'dd/MM/yyyy', { locale: es })}</span>
                              </div>
                            </div>
                          )}

                          {config.key === 'Completados' && (
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Ingresos</span>
                                <span className="font-semibold">${Number(project.ingresos).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Costo</span>
                                <span className="font-semibold">${Number(project.costo).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Utilidad</span>
                                <span className="font-semibold">${Number(project.utilidad).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-600">Utilidad %</span>
                                <span className="font-semibold">{Number(project.utilidad_porcentaje)}%</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1 border-t pt-2 text-xs">
                                <div className="text-center">
                                  <p className="text-gray-600">${Number(project.devengado)}</p>
                                  <p className="text-gray-500">Devengado</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-600">${Number(project.pagado)}</p>
                                  <p className="text-gray-500">Pagado</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-600">${Number(project.por_cobrar)}</p>
                                  <p className="text-gray-500">Por cobrar</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center border-t pt-2 text-gray-700">
                                <span className="font-medium">Inicio:</span>
                                <span className="text-xs">{format(new Date(project.start_date), 'dd/MM/yyyy', { locale: es })}</span>
                              </div>
                              <div className="flex justify-between items-center text-gray-700">
                                <span className="font-medium">Fin:</span>
                                <span className="text-xs">{format(new Date(project.estimated_execution_date), 'dd/MM/yyyy', { locale: es })}</span>
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

  useEffect(() => {
    const loadProjects = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      try {
        const response = await fetch(`/api/projects?user_id=${session.user.id}`)
        const data = await response.json()
        
        if (Array.isArray(data)) {
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      planning: 'outline',
      in_progress: 'default',
      completed: 'secondary',
    }
    const labels: Record<string, string> = {
      planning: 'Planificación',
      in_progress: 'En Progreso',
      completed: 'Completado',
    }
    return (
      <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>
    )
  }

  // Calculate metrics
  const totalProjects = projects.length
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress').length
  const completedProjects = projects.filter((p) => p.status === 'completed').length
  const plannedProjects = projects.filter((p) => p.status === 'planning').length
  const totalInvestment = projects.reduce((sum, p) => sum + (Number(p.estimated_amount) || 0), 0)

  // Get recent projects
  const recentProjects = projects.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Ejecutivo</h1>
          <p className="text-gray-600 mt-1">Resumen de todos tus proyectos y actividades</p>
        </div>
        <Button onClick={() => router.push('/dashboard/projects/new')} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Proyectos
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
            <p className="text-xs text-gray-500 mt-1">Activos y completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                En Progreso
              </CardTitle>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{inProgressProjects}</p>
            <p className="text-xs text-gray-500 mt-1">{Math.round((inProgressProjects / totalProjects || 0) * 100)}% del total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completados
              </CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{completedProjects}</p>
            <p className="text-xs text-gray-500 mt-1">Proyectos finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Planificación
              </CardTitle>
              <Calendar className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{plannedProjects}</p>
            <p className="text-xs text-gray-500 mt-1">Por iniciar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Inversión Total
              </CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">${(totalInvestment / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-gray-500 mt-1">En todos los proyectos</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Estado de Proyectos</CardTitle>
            <CardDescription>Distribución actual por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">En Progreso</span>
                  <span className="text-sm font-bold text-gray-900">{inProgressProjects}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(inProgressProjects / totalProjects || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Completados</span>
                  <span className="text-sm font-bold text-gray-900">{completedProjects}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(completedProjects / totalProjects || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Planificación</span>
                  <span className="text-sm font-bold text-gray-900">{plannedProjects}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(plannedProjects / totalProjects || 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Tasa de Progreso</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {totalProjects > 0 ? Math.round((inProgressProjects / totalProjects) * 100) : 0}%
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Tasa de Finalización</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">Proyectos Pendientes</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{plannedProjects}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos Recientes</CardTitle>
          <CardDescription>Últimos {recentProjects.length} proyectos creados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Cargando proyectos...</p>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay proyectos aún</p>
              <Button onClick={() => router.push('/dashboard/projects/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Proyecto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>
                      {format(new Date(project.start_date), 'dd MMM yyyy', {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>${Number(project.estimated_amount).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
