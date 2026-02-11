'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, addDays, addHours, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface Activity {
  id: string
  code: string
  name: string
  base_duration_value: number
  base_duration_unit: 'hours' | 'days'
  phase_id?: string
}

interface GanttChartProps {
  activities: Activity[]
  projectStartDate: string
}

export default function GanttChart({ activities, projectStartDate }: GanttChartProps) {
  const chartData = useMemo(() => {
    try {
      const startDate = parseISO(projectStartDate)
      if (isNaN(startDate.getTime())) {
        console.error('[v0] Invalid project start date:', projectStartDate)
        return []
      }

      let currentDate = startDate

      return activities.map((activity) => {
        if (!activity || !activity.code) {
          console.warn('[v0] Invalid activity:', activity)
          return null
        }

        const activityStart = currentDate
        const durationDays =
          activity.base_duration_unit === 'days'
            ? activity.base_duration_value
            : Math.ceil(activity.base_duration_value / 24)

        const activityEnd = addDays(currentDate, durationDays)

        const startDay = Math.floor(
          (activityStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        currentDate = activityEnd

        return {
          code: activity.code,
          name: activity.name?.substring(0, 30) || 'Sin nombre',
          startDay,
          duration: durationDays,
          id: activity.id,
        }
      }).filter(Boolean)
    } catch (error) {
      console.error('[v0] Error calculating chart data:', error)
      return []
    }
  }, [activities, projectStartDate])

  if (chartData.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        No hay actividades para mostrar en el cronograma
      </div>
    )
  }

  const maxDay = Math.max(...chartData.map((d) => d.startDay + d.duration), 30)

  return (
    <div className="w-full overflow-x-auto">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 300, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, maxDay]} label={{ value: 'Días', position: 'insideBottomRight', offset: -5 }} />
          <YAxis dataKey="code" type="category" width={100} />
          <Tooltip
            formatter={(value: any) => `${value} días`}
            labelFormatter={(label) => `Código: ${label}`}
            cursor={{ fill: 'rgba(0,0,0,0.1)' }}
          />
          <Bar
            dataKey="duration"
            fill="#3b82f6"
            background={{ fill: '#f3f4f6' }}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Activity Details */}
      <div className="mt-8 space-y-2">
        <h3 className="font-semibold text-gray-900">Detalles de Actividades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2">Código</th>
                <th className="text-left px-3 py-2">Actividad</th>
                <th className="text-right px-3 py-2">Duración</th>
                <th className="text-left px-3 py-2">Inicio</th>
                <th className="text-left px-3 py-2">Fin</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((activity) => {
                try {
                  const startDate = parseISO(projectStartDate)
                  const actStart = addDays(startDate, activity.startDay)
                  const actEnd = addDays(actStart, activity.duration)

                  return (
                    <tr key={activity.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-blue-600">{activity.code}</td>
                      <td className="px-3 py-2">{activity.name}</td>
                      <td className="px-3 py-2 text-right">{activity.duration} días</td>
                      <td className="px-3 py-2">
                        {format(actStart, 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-3 py-2">
                        {format(actEnd, 'dd MMM yyyy', { locale: es })}
                      </td>
                    </tr>
                  )
                } catch (error) {
                  console.error('[v0] Error rendering row for', activity.code, error)
                  return null
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
