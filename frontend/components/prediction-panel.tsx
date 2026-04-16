'use client'

import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

export type PredictionStatus = 'normal' | 'high' | 'anomaly'

interface PredictionPanelProps {
  status: PredictionStatus
  message: string
  recommendation: string
}

export function PredictionPanel({
  status,
  message,
  recommendation,
}: PredictionPanelProps) {
  const statusConfig = {
    normal: {
      icon: CheckCircle,
      bgColor: 'bg-chart-2/10',
      textColor: 'text-chart-2',
      borderColor: 'border-chart-2/30',
      label: 'Normal',
    },
    high: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-500/30',
      label: 'High Usage',
    },
    anomaly: {
      icon: AlertCircle,
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      borderColor: 'border-destructive/30',
      label: 'Anomaly Detected',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`metric-card border-2 ${config.borderColor}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${config.bgColor}`}>
          <Icon size={24} className={config.textColor} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
              {config.label}
            </span>
          </div>
          <p className="mt-2 font-semibold text-foreground">{message}</p>
          <p className="mt-1 text-sm text-muted-foreground">{recommendation}</p>
        </div>
      </div>
    </div>
  )
}
