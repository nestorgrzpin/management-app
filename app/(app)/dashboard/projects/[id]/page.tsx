'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import GanttChart from '@/components/gantt-chart'
// import ActivitiesTable from '@/components/activities-table'

export default function ProjectDetailPage() {
  const [project, setProject] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const projectId = params.id as string

  useEffect(() => {
    const loadProject = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push('/login')
          return
        }

        // Load project
        const { data: projectData } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        if (projectData) {
          setProject(projectData)
          console.log('[v0] Project loaded:', projectData.id)

          // Load project activities with their template details
          const { data: projectActivitiesData, error: activitiesError } = await supabase
            .from('project_activities')
            .select(`
              *,
              activities:activity_id(*)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: true })

          console.log('[v0] Project activities loaded:', projectActivitiesData?.length || 0, activitiesError)

          if (projectActivitiesData) {
            // Map project_activities with their activity details
            const mappedActivities = projectActivitiesData.map((pa: any) => ({
              ...pa.activities,
              project_activity_id: pa.id,
              actual_duration_value: pa.actual_duration_value,
              actual_duration_unit: pa.actual_duration_unit,
              status: pa.status,
              progress_percentage: pa.progress_percentage,
              start_date: pa.start_date,
              end_date: pa.end_date,
            }))
            setActivities(mappedActivities)
          }
        }
      } catch (error) {
        console.error('[v0] Error loading project:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="text-center py-12">
          <p className="text-gray-500">Proyecto no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">{project.name}</h1>
          </div>
          <p className="text-gray-600">Cliente: {project.client}</p>
        </div>
        <div className="text-right">
          <Badge>{project.status === 'planning' ? 'Planificación' : 'En Progreso'}</Badge>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inicio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {format(new Date(project.start_date), 'dd MMM yyyy', { locale: es })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ejecución Estimada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {project.estimated_execution_date ? format(new Date(project.estimated_execution_date), 'dd MMM yyyy', { locale: es }) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              ${Number(project.estimated_amount).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Adjudicación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold capitalize">{project.adjudication_type}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="gantt" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gantt">Cronograma</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
        </TabsList>

        <TabsContent value="gantt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma Gantt</CardTitle>
              <CardDescription>
                Visualización del calendario de actividades del proyecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <GanttChart
                  activities={activities}
                  projectStartDate={project.start_date}
                />
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No hay actividades para mostrar
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          {/* ActivitiesTable temporarily disabled
          <ActivitiesTable
            activities={activities}
            projectId={projectId}
            projectStartDate={project.start_date}
            onActivitiesChange={() => {
              // Reload activities from project_activities table
              supabase
                .from('project_activities')
                .select(`
                  *,
                  activities:activity_id(*)
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: true })
                .then(({ data }) => {
                  if (data) {
                    const mappedActivities = data.map((pa: any) => ({
                      ...pa.activities,
                      project_activity_id: pa.id,
                      actual_duration_value: pa.actual_duration_value,
                      actual_duration_unit: pa.actual_duration_unit,
                      status: pa.status,
                      progress_percentage: pa.progress_percentage,
                      start_date: pa.start_date,
                      end_date: pa.end_date,
                    }))
                    setActivities(mappedActivities)
                  }
                })
            }}
          />
          */}
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Tabla de actividades - En mantenimiento</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
