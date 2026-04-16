'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PowerReading {
  timestamp: string
  power: number
}

interface PowerChartProps {
  data?: PowerReading[]
}

const defaultData = [
  { time: '00:00', power: 2400 },
  { time: '01:00', power: 2210 },
  { time: '02:00', power: 2290 },
  { time: '03:00', power: 2000 },
  { time: '04:00', power: 2181 },
  { time: '05:00', power: 2500 },
  { time: '06:00', power: 2100 },
  { time: '07:00', power: 2300 },
  { time: '08:00', power: 2900 },
  { time: '09:00', power: 3200 },
  { time: '10:00', power: 3500 },
  { time: '11:00', power: 3200 },
  { time: '12:00', power: 3800 },
  { time: '13:00', power: 3600 },
  { time: '14:00', power: 3400 },
  { time: '15:00', power: 3300 },
  { time: '16:00', power: 3500 },
  { time: '17:00', power: 3900 },
  { time: '18:00', power: 4200 },
  { time: '19:00', power: 4100 },
  { time: '20:00', power: 3800 },
  { time: '21:00', power: 3200 },
  { time: '22:00', power: 2800 },
  { time: '23:00', power: 2400 },
]

export function PowerChart({ data }: PowerChartProps) {
  // Convert PowerReading format to chart format
  const chartData = (data || defaultData).map((item: any) => ({
    time: 'timestamp' in item ? new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : item.time,
    power: 'power' in item ? Math.round(item.power * 10) / 10 : item.power,
  }))

  return (
    <div className="metric-card">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Power Usage Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            interval={2}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F1F5F9' }}
            formatter={(value) => [`${value} W`, 'Power']}
          />
          <Line
            type="monotone"
            dataKey="power"
            stroke="#10B981"
            dot={false}
            strokeWidth={3}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
