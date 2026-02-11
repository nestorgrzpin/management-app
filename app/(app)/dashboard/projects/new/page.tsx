'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    start_date: new Date().toISOString().split('T')[0],
    estimated_amount: '',
    procurement_type: 'direct',
    execution_date: '',
  })
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: session.user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear proyecto')
      }

      const project = await response.json()
      toast.success('¡Proyecto creado exitosamente!')
      router.push(`/dashboard/projects/${project.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Proyecto</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
          <CardDescription>
            Completa los datos generales del proyecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Proyecto *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Construcción Oficina Central"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Input
                  id="client"
                  name="client"
                  placeholder="Ej: Empresa XYZ"
                  value={formData.client}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de Inicio *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="execution_date">Fecha Estimada de Ejecución *</Label>
                <Input
                  id="execution_date"
                  name="execution_date"
                  type="date"
                  value={formData.execution_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_amount">Monto Estimado ($) *</Label>
                <Input
                  id="estimated_amount"
                  name="estimated_amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.estimated_amount}
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="procurement_type">Tipo de Adjudicación *</Label>
                <Select
                  value={formData.procurement_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      procurement_type: value,
                    }))
                  }
                >
                  <SelectTrigger id="procurement_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Adjudicación Directa</SelectItem>
                    <SelectItem value="bidding">Licitación Pública</SelectItem>
                    <SelectItem value="reduced">Licitación Reducida</SelectItem>
                    <SelectItem value="contracting">Contratación Directa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creando...' : 'Crear Proyecto'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
