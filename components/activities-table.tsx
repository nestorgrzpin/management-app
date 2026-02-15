'use client'

import React, { useState } from 'react'
import { Card } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit2, Save, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { addDays, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import dynamic from 'next/dynamic'

const SharePointViewer = dynamic(() => import('./sharepoint-viewer'), { ssr: false })

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
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [docModalActivity, setDocModalActivity] = useState<Activity | null>(null)
  const [localActivities, setLocalActivities] = useState(activities)
  const supabase = createClient()

  // Update local activities when props change
  React.useEffect(() => {
    setLocalActivities(activities)
  }, [activities])

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
    setDocModalActivity(activity)
    setIsDocModalOpen(true)
    setEditDocUrl(activity.sharepoint_document_url || '')
    setEditDocName(activity.document_name || '')
  }

  const handleSaveDocument = async () => {
    try {
      if (!editDocUrl || !docModalActivity) {
        toast.error('Por favor ingresa una URL de documento')
        return
      }

      console.log('[v0] Saving document for activity:', {
        project_activity_id: docModalActivity.project_activity_id,
        id: docModalActivity.id,
        url: editDocUrl,
        name: editDocName,
      })

      const { error } = await supabase
        .from('project_activities')
        .update({
          sharepoint_document_url: editDocUrl,
          document_name: editDocName || 'Documento',
        })
        .eq('id', docModalActivity.project_activity_id)

      if (error) {
        console.error('[v0] Error updating document:', error)
        toast.error('Error al guardar el documento')
        return
      }

      console.log('[v0] Document saved successfully')
      toast.success('Documento vinculado exitosamente')
      
      // Update local state immediately
      const updatedActivities = localActivities.map(a => 
        a.project_activity_id === docModalActivity.project_activity_id 
          ? { ...a, sharepoint_document_url: editDocUrl, document_name: editDocName }
          : a
      )
      
      console.log('[v0] Updated activities:', {
        before: localActivities.length,
        after: updatedActivities.length,
        changed: updatedActivities.some(a => a.sharepoint_document_url === editDocUrl)
      })
      
      setLocalActivities(updatedActivities)
      setIsDocModalOpen(false)
      onActivitiesChange()
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al guardar el documento')
    }
  }

  const handleCloseDocModal = () => {
    setIsDocModalOpen(false)
    setDocModalActivity(null)
    setEditDocUrl('')
    setEditDocName('')
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
              {localActivities.map((activity, index) => {
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
                        {activity.sharepoint_document_url ? (
                          <div className="flex items-center gap-2">
                            <SharePointViewer
                              documentUrl={activity.sharepoint_document_url}
                              documentName={activity.document_name}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditDocument(activity)}
                              className="h-8 text-xs"
                            >
                              Editar
                            </Button>
                          </div>
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

        {/* Document Edit Modal */}
        <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Vincular Documento de SharePoint
                {docModalActivity && <div className="text-sm text-gray-500 font-normal mt-1">{docModalActivity.name}</div>}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="doc-url" className="text-sm mb-2 block">
                  URL del Documento
                </Label>
                <Input
                  id="doc-url"
                  placeholder="https://tuorganizacion.sharepoint.com/sites/..."
                  value={editDocUrl}
                  onChange={(e) => setEditDocUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="doc-name" className="text-sm mb-2 block">
                  Nombre del Documento
                </Label>
                <Input
                  id="doc-name"
                  placeholder="Ejemplo: Especificaciones técnicas"
                  value={editDocName}
                  onChange={(e) => setEditDocName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCloseDocModal}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSaveDocument}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Guardar Documento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    )
  }


