'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  unit: string
  icon: React.ReactNode
  trend: number
  trendLabel: string
  type?: 'voltage' | 'current' | 'power' | 'energy'
}

export function MetricCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendLabel,
  type = 'voltage',
}: MetricCardProps) {
  const isPositive = trend > 0

  // Color mapping for left borders
  const borderColorMap = {
    voltage: 'border-l-4 border-l-voltage',
    current: 'border-l-4 border-l-current',
    power: 'border-l-4 border-l-power',
    energy: 'border-l-4 border-l-energy',
  }

  return (
    <div className={`metric-card card-hover group ${borderColorMap[type]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">{value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            <div
              className={`flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium ${
                isPositive
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-chart-2/10 text-chart-2'
              }`}
            >
              {isPositive ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span>{trendLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
          {icon}
        </div>
      </div>
    </div>
  )
}
