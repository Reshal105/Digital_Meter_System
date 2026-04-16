'use client'

import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'

interface UsageData {
  hour: string
  usage: number
}

interface EnergyAnalyticsProps {
  data?: UsageData[]
}

const defaultUsageData: UsageData[] = [
  { hour: '12 AM', usage: 45 },
  { hour: '1 AM', usage: 42 },
  { hour: '2 AM', usage: 38 },
  { hour: '3 AM', usage: 35 },
  { hour: '4 AM', usage: 48 },
  { hour: '5 AM', usage: 52 },
  { hour: '6 AM', usage: 65 },
  { hour: '7 AM', usage: 78 },
  { hour: '8 AM', usage: 92 },
  { hour: '9 AM', usage: 88 },
  { hour: '10 AM', usage: 95 },
  { hour: '11 AM', usage: 105 },
  { hour: '12 PM', usage: 110 },
  { hour: '1 PM', usage: 108 },
  { hour: '2 PM', usage: 115 },
  { hour: '3 PM', usage: 120 },
  { hour: '4 PM', usage: 118 },
  { hour: '5 PM', usage: 130 },
  { hour: '6 PM', usage: 135 },
  { hour: '7 PM', usage: 145 },
  { hour: '8 PM', usage: 140 },
  { hour: '9 PM', usage: 125 },
  { hour: '10 PM', usage: 95 },
  { hour: '11 PM', usage: 68 },
]

// Function to get color based on consumption level
function getConsumptionColor(usage: number, maxUsage: number): string {
  const percentage = (usage / maxUsage) * 100

  if (percentage < 30) return '#10B981' // Green - Low
  if (percentage < 60) return '#F59E0B' // Amber - Medium
  if (percentage < 80) return '#F97316' // Orange - High
  return '#EF4444' // Red - Critical
}

export function EnergyAnalytics({ data = defaultUsageData }: EnergyAnalyticsProps) {
  const peakUsage = Math.max(...data.map((d) => d.usage))
  const avgUsage = Math.round(
    data.reduce((sum, d) => sum + d.usage, 0) / data.length
  )

  const coloredData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        fill: getConsumptionColor(item.usage, peakUsage),
      })),
    [data, peakUsage]
  )

  return (
    <div className="metric-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Energy Consumption Analytics</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Peak: <span className="text-accent font-medium">{peakUsage} kWh</span> | Average:{' '}
            <span className="text-chart-2 font-medium">{avgUsage} kWh</span>
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={coloredData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="hour"
            stroke="#9CA3AF"
            style={{ fontSize: '11px' }}
            interval={2}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            label={{ value: 'Usage (kWh)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F1F5F9' }}
            formatter={(value) => [`${value} kWh`, 'Usage']}
            contentFormatter={(value) => {
              if (typeof value === 'number') {
                const percentage = (value / peakUsage) * 100
                let level = 'Low'
                if (percentage >= 30 && percentage < 60) level = 'Medium'
                else if (percentage >= 60 && percentage < 80) level = 'High'
                else if (percentage >= 80) level = 'Critical'
                return `${value} kWh (${level})`
              }
              return value
            }}
          />
          <Bar
            dataKey="usage"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
          >
            {coloredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
