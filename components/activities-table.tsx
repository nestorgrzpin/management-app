'use client'

import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Edit2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { addDays, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'

interface Activity {
  id: string
  project_activity_id: string
  code: string
  name: string
  base_duration_value: number
  base_duration_unit: 'hours' | 'days'
  start_date?: string
  end_date?: string
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

  const isSubactivity = (code: string) => code.includes('.')
  const getActivityLevel = (code: string) => code.split('.').length - 1

  const calculateDates = (activity: Activity, index: number) => {
    if (activity.start_date && activity.end_date) {
      return {
        start: parseISO(activity.start_date),
        end: parseISO(activity.end_date),
        duration: activity.base_duration_value,
      }
    }

    const start = parseISO(projectStartDate)
    const baseDays = activity.base_duration_unit === 'days' 
      ? activity.base_duration_value 
      : Math.ceil(activity.base_duration_value / 8)
    
    const end = addDays(start, index * 5 + baseDays)
    
    return { start, end, duration: activity.base_duration_value }
  }

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setEditValue(activity.base_duration_value)
    setEditUnit(activity.base_duration_unit)
  }

  const handleSave = async (activity: Activity) => {
    try {
      const { error } = await supabase
        .from('project_activities')
        .update({
          base_duration_value: editValue,
          base_duration_unit: editUnit,
        })
        .eq('id', activity.project_activity_id)

      if (error) {
        toast.error('Error al actualizar la actividad')
        return
      }

      toast.success('Actividad actualizada')
      setEditingId(null)
      onActivitiesChange()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar')
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Código</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead className="w-32">Duración Estimada</TableHead>
                <TableHead className="w-32">Inicio</TableHead>
                <TableHead className="w-32">Fin</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, index) => {
                const isSubact = isSubactivity(activity.code)
                const { start, end } = calculateDates(activity, index)
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
                          onClick={() => handleSave(activity)}
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
