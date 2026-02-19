'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Plus, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ActivityDetailModalProps {
  activity: any
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  projectId: string
}

const STATUS_OPTIONS = [
  { value: 'not_applicable', label: 'No Aplica' },
  { value: 'not_started', label: 'Por Iniciar' },
  { value: 'in_progress', label: 'En Ejecución' },
  { value: 'review', label: 'Revisión' },
  { value: 'completed', label: 'Terminada' },
]

const DOCUMENT_TYPES = [
  { value: 'technical', label: 'Técnico' },
  { value: 'legal', label: 'Legal' },
  { value: 'financial', label: 'Financiero' },
  { value: 'other', label: 'Otro' },
  { value: 'general', label: 'General' },
]

export function ActivityDetailModal({
  activity,
  isOpen,
  onClose,
  onSave,
  projectId,
}: ActivityDetailModalProps) {
  const [formData, setFormData] = useState({
    status: activity?.status || 'not_started',
    duration_days: activity?.duration_days || activity?.estimated_duration_days || 1,
    estimated_duration_days: activity?.estimated_duration_days || 1,
    responsible_department: activity?.responsible_department || '',
    sharepoint_link: activity?.sharepoint_link || '',
    notes: activity?.notes || '',
  })

  const [documents, setDocuments] = useState(activity?.activity_documents || [])
  const [newDocument, setNewDocument] = useState({
    title: '',
    sharepoint_url: '',
    document_type: 'general',
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave({
        id: activity.id,
        ...formData,
      })
      toast.success('Actividad actualizada correctamente')
      onClose()
    } catch (error) {
      toast.error('Error al guardar la actividad')
      console.error('[v0] Error saving activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDocument = async () => {
    if (!newDocument.title || !newDocument.sharepoint_url) {
      toast.error('Por favor completa los campos del documento')
      return
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_activity_id: activity.id,
          ...newDocument,
        }),
      })

      if (!response.ok) throw new Error('Error adding document')

      const doc = await response.json()
      setDocuments([...documents, doc])
      setNewDocument({ title: '', sharepoint_url: '', document_type: 'general' })
      toast.success('Documento agregado')
    } catch (error) {
      toast.error('Error al agregar documento')
      console.error('[v0] Error:', error)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents?document_id=${docId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error deleting document')

      setDocuments(documents.filter((d: any) => d.id !== docId))
      toast.success('Documento eliminado')
    } catch (error) {
      toast.error('Error al eliminar documento')
    }
  }

  if (!activity) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {activity.activities?.code} - {activity.activities?.name}
          </DialogTitle>
          <DialogDescription>
            Fase: {activity.activities?.phases?.name || 'Sin fase'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="timeline">Cronograma</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Departamento Responsable</Label>
                <Input
                  id="department"
                  value={formData.responsible_department}
                  onChange={(e) => handleInputChange('responsible_department', e.target.value)}
                  placeholder="Ej: Ingeniería"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (días)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration_days}
                  onChange={(e) => handleInputChange('duration_days', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated">Duración Estimada (días)</Label>
                <Input
                  id="estimated"
                  type="number"
                  min="1"
                  value={formData.estimated_duration_days}
                  onChange={(e) => handleInputChange('estimated_duration_days', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sharepoint">Link SharePoint</Label>
              <Input
                id="sharepoint"
                value={formData.sharepoint_link}
                onChange={(e) => handleInputChange('sharepoint_link', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Agregar notas sobre la actividad..."
                className="min-h-24"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Información de Cronograma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Fecha Inicio Real</p>
                    <p className="text-sm font-semibold">
                      {activity.actual_start_date ? new Date(activity.actual_start_date).toLocaleDateString('es-MX') : 'No establecida'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Fecha Fin Real</p>
                    <p className="text-sm font-semibold">
                      {activity.actual_end_date ? new Date(activity.actual_end_date).toLocaleDateString('es-MX') : 'No establecida'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Duración</p>
                    <p className="text-sm font-semibold">{formData.duration_days} días</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Holgura</p>
                    <Badge variant={activity.slack_days === 0 ? 'destructive' : 'default'}>
                      {activity.slack_days || 0} días
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Agregar Documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Título del documento"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                />
                <Input
                  placeholder="URL de SharePoint"
                  value={newDocument.sharepoint_url}
                  onChange={(e) => setNewDocument({ ...newDocument, sharepoint_url: e.target.value })}
                />
                <Select value={newDocument.document_type} onValueChange={(value) => setNewDocument({ ...newDocument, document_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddDocument} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Documento
                </Button>
              </CardContent>
            </Card>

            {documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Documentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{doc.title}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {doc.document_type}
                        </Badge>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(doc.sharepoint_url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
