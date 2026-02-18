'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ActivityDetailModal } from './activity-detail-modal'
import { toast } from 'sonner'

interface ActivityListPanelProps {
  projectId: string
  onActivityClick?: (activity: any) => void
}

const STATUS_COLORS = {
  'not_applicable': 'bg-gray-100 text-gray-800',
  'not_started': 'bg-blue-100 text-blue-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'review': 'bg-purple-100 text-purple-800',
  'completed': 'bg-green-100 text-green-800',
}

const STATUS_LABELS = {
  'not_applicable': 'No Aplica',
  'not_started': 'Por Iniciar',
  'in_progress': 'En Ejecución',
  'review': 'Revisión',
  'completed': 'Terminada',
}

export function ActivityListPanel({ projectId }: ActivityListPanelProps) {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['Planificación']))
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [projectId])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/activities/manage?project_id=${projectId}`)
      if (!response.ok) throw new Error('Error fetching activities')

      const data = await response.json()
      setActivities(data)
    } catch (error) {
      console.error('[v0] Error fetching activities:', error)
      toast.error('Error al cargar actividades')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveActivity = async (data: any) => {
    try {
      const response = await fetch('/api/activities/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: data.id,
          ...data,
        }),
      })

      if (!response.ok) throw new Error('Error saving activity')

      // Recalculate critical path after update
      const criticalPathResponse = await fetch('/api/activities/critical-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })

      if (criticalPathResponse.ok) {
        const criticalData = await criticalPathResponse.json()
        console.log('[v0] Critical path recalculated')
      }

      // Refresh activities
      await fetchActivities()
    } catch (error) {
      console.error('[v0] Error saving activity:', error)
      throw error
    }
  }

  const togglePhase = (phase: string) => {
    const newExpanded = new Set(expandedPhases)
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase)
    } else {
      newExpanded.add(phase)
    }
    setExpandedPhases(newExpanded)
  }

  const groupedActivities = activities.reduce((acc: any, activity: any) => {
    const phase = activity.activities?.phase || 'Sin Fase'
    if (!acc[phase]) acc[phase] = []
    acc[phase].push(activity)
    return acc
  }, {})

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Actividades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Actividades</CardTitle>
          <p className="text-xs text-gray-600 mt-1">
            {activities.length} actividades
          </p>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-2">
              {Object.entries(groupedActivities).map(([phase, phaseActivities]: [string, any]) => (
                <div key={phase}>
                  {/* Phase Header */}
                  <button
                    onClick={() => togglePhase(phase)}
                    className="flex items-center w-full p-2 rounded hover:bg-gray-100 transition"
                  >
                    {expandedPhases.has(phase) ? (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    )}
                    <span className="font-semibold text-sm flex-1 text-left">{phase}</span>
                    <Badge variant="secondary" className="text-xs">
                      {phaseActivities.length}
                    </Badge>
                  </button>

                  {/* Phase Activities */}
                  {expandedPhases.has(phase) && (
                    <div className="space-y-1 ml-4">
                      {phaseActivities.map((activity: any) => (
                        <button
                          key={activity.id}
                          onClick={() => {
                            setSelectedActivity(activity)
                            setIsModalOpen(true)
                          }}
                          className="w-full p-2 rounded border border-gray-200 hover:bg-blue-50 transition text-left group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900">
                                {activity.activities?.code}
                              </p>
                              <p className="text-xs text-gray-600 truncate mt-1">
                                {activity.activities?.name}
                              </p>
                              <div className="flex items-center gap-1 mt-2">
                                <Badge
                                  className={`text-xs ${
                                    STATUS_COLORS[activity.status as keyof typeof STATUS_COLORS] ||
                                    STATUS_COLORS['not_started']
                                  }`}
                                >
                                  {STATUS_LABELS[activity.status as keyof typeof STATUS_LABELS] || 'Desconocido'}
                                </Badge>
                                {activity.slack_days === 0 && (
                                  <Badge className="text-xs bg-red-100 text-red-800">
                                    Ruta Crítica
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mt-2">
                            <p>Duración: {activity.duration_days || activity.estimated_duration_days || 1} días</p>
                            {activity.slack_days > 0 && (
                              <p>Holgura: {activity.slack_days} días</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedActivity(null)
        }}
        onSave={handleSaveActivity}
        projectId={projectId}
      />
    </>
  )
}
