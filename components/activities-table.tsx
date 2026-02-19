'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit2, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Spinner } from '@/components/ui/spinner'

interface Activity {
  id: string
  project_activity_id: string
  name: string
  status: string
  start_date?: string
  end_date?: string
  estimated_duration_days?: number
  duration_days?: number
  responsible_user_id?: string
  sharepoint_link?: string
  progress_percentage?: number
}

interface ActivitiesTableProps {
  projectId: string
  onActivitySelect?: (activity: Activity) => void
}

const statusBadges: Record<string, { label: string; color: string }> = {
  not_applicable: { label: 'No Aplica', color: 'bg-gray-100 text-gray-800' },
  not_started: { label: 'Por Iniciar', color: 'bg-slate-100 text-slate-800' },
  in_progress: { label: 'En Ejecución', color: 'bg-blue-100 text-blue-800' },
  review: { label: 'Revisión', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Terminada', color: 'bg-green-100 text-green-800' },
}

export default function ActivitiesTable({
  projectId,
  onActivitySelect,
}: ActivitiesTableProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadActivities()
  }, [projectId])

  const loadActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('[v0] Loading activities for project:', projectId)
      
      // Use server API instead of client Supabase
      const response = await fetch(`/api/activities/manage?project_id=${projectId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error loading activities')
      }

      const data = await response.json()
      console.log('[v0] Activities loaded:', data?.length)

      if (Array.isArray(data)) {
        const formattedActivities = data.map((item: any) => ({
          id: item.id,
          project_activity_id: item.id,
          name: item.activities?.name || 'Sin nombre',
          status: item.status || 'not_started',
          start_date: item.actual_start_date || item.start_date,
          end_date: item.actual_end_date || item.end_date,
          estimated_duration_days: item.estimated_duration_days,
          duration_days: item.duration_days,
          responsible_user_id: item.responsible_user_id,
          sharepoint_link: item.sharepoint_link,
          progress_percentage: item.progress_percentage || 0,
        }))
        setActivities(formattedActivities)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading activities'
      console.error('[v0] Error loading activities:', message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay actividades registradas para este proyecto</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[200px]">Actividad</TableHead>
            <TableHead className="w-[120px]">Estado</TableHead>
            <TableHead className="w-[80px] text-right">Duración</TableHead>
            <TableHead className="w-[100px]">Inicio</TableHead>
            <TableHead className="w-[100px]">Fin</TableHead>
            <TableHead className="w-[80px] text-center">Progreso</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-sm">{activity.name}</TableCell>
              <TableCell>
                <Badge className={statusBadges[activity.status]?.color || 'bg-gray-100'}>
                  {statusBadges[activity.status]?.label || activity.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm">
                {activity.duration_days || activity.estimated_duration_days || '-'} días
              </TableCell>
              <TableCell className="text-sm">
                {activity.start_date
                  ? format(new Date(activity.start_date), 'dd MMM', { locale: es })
                  : '-'}
              </TableCell>
              <TableCell className="text-sm">
                {activity.end_date
                  ? format(new Date(activity.end_date), 'dd MMM', { locale: es })
                  : '-'}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  <div className="w-12 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${activity.progress_percentage}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{activity.progress_percentage}%</p>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onActivitySelect?.(activity)}
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {activity.sharepoint_link && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      title="Ver documento"
                    >
                      <a
                        href={activity.sharepoint_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
