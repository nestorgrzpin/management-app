'use client'

import { Card } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Edit2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { addDays, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Activity {
  id: string
  code: string
  name: string
  duration_hours: number
  duration_days: number
  phase: string
  project_id: string
}

interface ActivitiesTableProps {
  activities: Activity[]
  projectId: string
  projectStartDate: string
  onActivitiesChange: () => void
}

export default function ActivitiesTable({
  activities,
  projectId,
  projectStartDate,
  onActivitiesChange,
}: ActivitiesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDays, setEditDays] = useState<number>(0)
  const [editHours, setEditHours] = useState<number>(0)
  const supabase = createClient()

  const isSubactivity = (code: string) => code.split('.').length === 3

  const getActivityLevel = (code: string) => {
    const parts = code.split('.')
    return parts.length === 2 ? 'activity' : 'subactivity'
  }

  const calculateDates = (activity: Activity, index: number) => {
    const startDate = parseISO(projectStartDate)
    let currentDate = startDate

    // Calculate cumulative start date
    for (let i = 0; i < index; i++) {
      const prevActivity = activities[i]
      currentDate =
        prevActivity.duration_days > 0
          ? addDays(currentDate, prevActivity.duration_days)
          : addDays(currentDate, Math.ceil(prevActivity.duration_hours / 24))
    }

    const actStart = currentDate
    const duration = activity.duration_days > 0 ? activity.duration_days : Math.ceil(activity.duration_hours / 24)
    const actEnd = addDays(actStart, duration)

    return { start: actStart, end: actEnd, duration }
  }

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setEditDays(activity.duration_days)
    setEditHours(activity.duration_hours)
  }

  const handleSave = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('project_activities')
        .update({
          duration_days: editDays,
          duration_hours: editHours,
        })
        .eq('id', activityId)

      if (error) {
        toast.error('Error al actualizar la actividad')
        return
      }

      toast.success('Actividad actualizada')
      setEditingId(null)
      onActivitiesChange()
    } catch (error) {
      toast.error('Error al guardar los cambios')
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, index) => {
                const isSubact = isSubactivity(activity.code)
                const level = getActivityLevel(activity.code)
                const { start, end, duration } = calculateDates(activity, index)
                const isEditing = editingId === activity.id

                return (
                  <TableRow
                    key={activity.id}
                    className={isSubact ? 'bg-blue-50' : ''}
                  >
                    <TableCell className="font-mono font-semibold text-blue-600">
                      {activity.code}
                    </TableCell>
                    <TableCell className={isSubact ? 'pl-8' : ''}>
                      {activity.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.phase}</Badge>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={editDays}
                            onChange={(e) => setEditDays(Number(e.target.value))}
                            placeholder="Días"
                            className="w-20 h-8"
                          />
                          <Input
                            type="number"
                            value={editHours}
                            onChange={(e) => setEditHours(Number(e.target.value))}
                            placeholder="Horas"
                            className="w-20 h-8"
                          />
                        </div>
                      ) : (
                        <span>
                          {duration} día{duration !== 1 ? 's' : ''}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(start, 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {format(end, 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSave(activity.id)}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Guardar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(activity)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
