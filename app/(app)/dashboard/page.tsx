'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Users, DollarSign, TrendingUp, CheckCircle2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
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
