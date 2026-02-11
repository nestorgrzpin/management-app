'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, addDays, addHours, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface Activity {
  id: string
  code: string
  name: string
  duration_hours: number
  duration_days: number
  phase: string
}

interface GanttChartProps {
  activities: Activity[]
  projectStartDate: string
}

export default function GanttChart({ activities, projectStartDate }: GanttChartProps) {
  const chartData = useMemo(() => {
    const startDate = parseISO(projectStartDate)
    let currentDate = startDate

    return activities.map((activity) => {
      const activityStart = currentDate
      const activityEnd =
        activity.duration_days > 0
          ? addDays(currentDate, activity.duration_days)
          : addHours(currentDate, activity.duration_hours)

      const startDay = Math.floor(
        (activityStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const duration = Math.max(
        Math.ceil(
          (activityEnd.getTime() - activityStart.getTime()) / (1000 * 60 * 60 * 24)
        ),
        1
      )

      currentDate = activityEnd

      return {
        code: activity.code,
        name: activity.name.substring(0, 30),
        startDay,
        duration,
        phase: activity.phase,
      }
    })
  }, [activities, projectStartDate])

  // Get the maximum day to set the domain
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
                <th className="text-left px-3 py-2">Fase</th>
                <th className="text-right px-3 py-2">Duración</th>
                <th className="text-left px-3 py-2">Inicio</th>
                <th className="text-left px-3 py-2">Fin</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((activity, idx) => {
                const startDate = parseISO(projectStartDate)
                const actStart = addDays(startDate, activity.startDay)
                const actEnd = addDays(actStart, activity.duration)

                return (
                  <tr key={activity.code} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-blue-600">{activity.code}</td>
                    <td className="px-3 py-2">{activity.name}</td>
                    <td className="px-3 py-2">{activities[idx]?.phase}</td>
                    <td className="px-3 py-2 text-right">{activity.duration} días</td>
                    <td className="px-3 py-2">
                      {format(actStart, 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-3 py-2">
                      {format(actEnd, 'dd MMM yyyy', { locale: es })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
