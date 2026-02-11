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
  base_duration_value: number
  base_duration_unit: 'hours' | 'days'
  phase_id?: string
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
  const [editValue, setEditValue] = useState<number>(0)
  const [editUnit, setEditUnit] = useState<'hours' | 'days'>('hours')
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
      const prevDays = prevActivity.base_duration_unit === 'days' 
        ? prevActivity.base_duration_value 
        : Math.ceil(prevActivity.base_duration_value / 24)
      currentDate = addDays(currentDate, prevDays)
    }

    const actStart = currentDate
    const duration = activity.base_duration_unit === 'days' 
      ? activity.base_duration_value 
      : Math.ceil(activity.base_duration_value / 24)
    const actEnd = addDays(actStart, duration)

    return { start: actStart, end: actEnd, duration }
  }

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setEditValue(activity.base_duration_value)
    setEditUnit(activity.base_duration_unit)
  }

  const handleSave = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({
          base_duration_value: editValue,
          base_duration_unit: editUnit,
        })
        .eq('id', activityId)

      if (error) {
        console.error('[v0] Error updating activity:', error)
        toast.error('Error al actualizar la actividad')
        return
      }

      toast.success('Actividad actualizada')
      setEditingId(null)
      onActivitiesChange()
    } catch (error) {
      console.error('[v0] Save error:', error)
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
                <TableHead>Duración Estimada</TableHead>
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
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            placeholder="Valor"
                            className="w-16 h-8"
                          />
                          <select
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value as 'hours' | 'days')}
                            className="px-2 h-8 text-sm border rounded"
                          >
                            <option value="hours">Horas</option>
                            <option value="days">Días</option>
                          </select>
                        </div>
                      ) : (
                        <span>
                          {activity.base_duration_value} {activity.base_duration_unit === 'hours' ? 'hrs' : 'días'}
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
