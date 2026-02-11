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
import { Edit2, Save, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { addDays, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import SharePointViewer from './sharepoint-viewer'

interface Activity {
  id: string
  code: string
  name: string
  base_duration_value: number
  base_duration_unit: 'hours' | 'days'
  phase_id?: string
  project_activity_id?: string
  sharepoint_document_url?: string | null
  document_name?: string | null
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
  const [editDocUrl, setEditDocUrl] = useState<string>('')
  const [editDocName, setEditDocName] = useState<string>('')
  const [isEditingDoc, setIsEditingDoc] = useState<string | null>(null)
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

  const handleEditDocument = (activity: Activity) => {
    setIsEditingDoc(activity.project_activity_id || null)
    setEditDocUrl(activity.sharepoint_document_url || '')
    setEditDocName(activity.document_name || '')
  }

  const handleSaveDocument = async (activity: Activity) => {
    try {
      if (!editDocUrl) {
        toast.error('Por favor ingresa una URL de documento')
        return
      }

      const { error } = await supabase
        .from('project_activities')
        .update({
          sharepoint_document_url: editDocUrl,
          document_name: editDocName || 'Documento',
        })
        .eq('id', activity.project_activity_id)

      if (error) {
        console.error('[v0] Error updating document:', error)
        toast.error('Error al guardar el documento')
        return
      }

      toast.success('Documento vinculado exitosamente')
      setIsEditingDoc(null)
      onActivitiesChange()
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al guardar el documento')
    }
  }

  const handleSave = async (activity: Activity) => {
    try {
      // Update the project_activity record (not the template activity)
      const { error } = await supabase
        .from('project_activities')
        .update({
          actual_duration_value: editValue,
          actual_duration_unit: editUnit,
        })
        .eq('id', activity.project_activity_id)

      if (error) {
        console.error('[v0] Error updating project activity:', error)
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
                <TableHead>Documento</TableHead>
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
                    <TableCell>
                      {isEditingDoc === activity.project_activity_id ? (
                        <div className="space-y-1">
                          <Input
                            placeholder="URL del documento"
                            value={editDocUrl}
                            onChange={(e) => setEditDocUrl(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Nombre del documento"
                            value={editDocName}
                            onChange={(e) => setEditDocName(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSaveDocument(activity)}
                            className="h-7 text-xs w-full"
                          >
                            Guardar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {activity.sharepoint_document_url ? (
                            <>
                              <SharePointViewer
                                documentUrl={activity.sharepoint_document_url}
                                documentName={activity.document_name}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditDocument(activity)}
                                className="h-8"
                              >
                                Editar
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditDocument(activity)}
                              className="gap-1"
                            >
                              <Link2 className="w-3 h-3" />
                              Vincular
                            </Button>
                          )}
                        </div>
                      )}
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
