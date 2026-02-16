'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export default function ProjectEditPage() {
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})
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

        const { data: projectData } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        if (projectData) {
          setProject(projectData)
          setFormData(projectData)
        }
      } catch (error) {
        console.error('[v0] Error loading project:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId, router, supabase])

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: formData.name,
          client: formData.client,
          relacion: formData.relacion,
          empresa: formData.empresa,
          ingresos: Number(formData.ingresos),
          costo: Number(formData.costo),
          utilidad: Number(formData.utilidad),
          utilidad_porcentaje: Number(formData.utilidad_porcentaje),
          devengado: Number(formData.devengado),
          pagado: Number(formData.pagado),
          por_cobrar: Number(formData.por_cobrar),
          start_date: formData.start_date,
          estimated_execution_date: formData.estimated_execution_date,
          adjudication_type: formData.adjudication_type,
        })
        .eq('id', projectId)

      if (error) {
        console.error('[v0] Error saving project:', error)
        alert('Error al guardar el proyecto')
      } else {
        console.log('[v0] Project saved successfully')
        router.push(`/dashboard/projects/${projectId}`)
      }
    } catch (error) {
      console.error('[v0] Error:', error)
      alert('Error al guardar el proyecto')
    } finally {
      setSaving(false)
    }
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Proyecto</h1>
            <p className="text-gray-600">{project.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Básica</CardTitle>
            <CardDescription>Datos generales del proyecto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Proyecto
              </label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nombre del proyecto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <Input
                value={formData.client || ''}
                onChange={(e) => handleInputChange('client', e.target.value)}
                placeholder="Cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relación
              </label>
              <Input
                value={formData.relacion || ''}
                onChange={(e) => handleInputChange('relacion', e.target.value)}
                placeholder="Relación"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <Input
                value={formData.empresa || ''}
                onChange={(e) => handleInputChange('empresa', e.target.value)}
                placeholder="Empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Adjudicación
              </label>
              <Input
                value={formData.adjudication_type || ''}
                onChange={(e) => handleInputChange('adjudication_type', e.target.value)}
                placeholder="ADSN, AD, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Financiera</CardTitle>
            <CardDescription>Datos económicos del proyecto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingresos (millones)
              </label>
              <Input
                type="number"
                value={formData.ingresos || ''}
                onChange={(e) => handleInputChange('ingresos', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo (millones)
              </label>
              <Input
                type="number"
                value={formData.costo || ''}
                onChange={(e) => handleInputChange('costo', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utilidad (millones)
              </label>
              <Input
                type="number"
                value={formData.utilidad || ''}
                onChange={(e) => handleInputChange('utilidad', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utilidad (%)
              </label>
              <Input
                type="number"
                value={formData.utilidad_porcentaje || ''}
                onChange={(e) => handleInputChange('utilidad_porcentaje', e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Pagos</CardTitle>
            <CardDescription>Estado de devengos y pagos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Devengado (millones)
              </label>
              <Input
                type="number"
                value={formData.devengado || ''}
                onChange={(e) => handleInputChange('devengado', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pagado (millones)
              </label>
              <Input
                type="number"
                value={formData.pagado || ''}
                onChange={(e) => handleInputChange('pagado', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Por Cobrar (millones)
              </label>
              <Input
                type="number"
                value={formData.por_cobrar || ''}
                onChange={(e) => handleInputChange('por_cobrar', e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fechas</CardTitle>
            <CardDescription>Cronograma del proyecto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <Input
                type="date"
                value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin Estimada
              </label>
              <Input
                type="date"
                value={formData.estimated_execution_date ? formData.estimated_execution_date.split('T')[0] : ''}
                onChange={(e) => handleInputChange('estimated_execution_date', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
