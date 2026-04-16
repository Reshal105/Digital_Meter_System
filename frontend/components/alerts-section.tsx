'use client'

import { AlertCircle, Zap, Clock } from 'lucide-react'

interface Alert {
  id: string
  title: string
  description: string
  timestamp: string
  severity: 'critical' | 'warning' | 'info'
}

const alerts: Alert[] = [
  {
    id: '1',
    title: 'High consumption detected',
    description: 'Power usage exceeded 4000W at 19:30',
    timestamp: '2 hours ago',
    severity: 'critical',
  },
  {
    id: '2',
    title: 'Unusual spike at 7 PM',
    description: 'Consumption jumped 25% above average',
    timestamp: '3 hours ago',
    severity: 'warning',
  },
  {
    id: '3',
    title: 'System operating normally',
    description: 'All metrics within expected range',
    timestamp: '5 hours ago',
    severity: 'info',
  },
]

function AlertItem({ alert }: { alert: Alert }) {
  const severityConfig = {
    critical: {
      icon: AlertCircle,
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      dotColor: 'bg-destructive',
    },
    warning: {
      icon: Zap,
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
      dotColor: 'bg-yellow-500',
    },
    info: {
      icon: Clock,
      bgColor: 'bg-chart-2/10',
      textColor: 'text-chart-2',
      dotColor: 'bg-chart-2',
    },
  }

  const config = severityConfig[alert.severity]
  const Icon = config.icon

  const isPulsing = alert.severity === 'critical'

  return (
    <div className={`flex gap-3 rounded-lg border border-border p-3 hover:bg-card/50 transition-colors ${isPulsing ? 'animate-pulse-glow' : ''}`}>
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
        <Icon size={18} className={config.textColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-foreground text-sm">{alert.title}</p>
          <span className={`flex-shrink-0 h-2 w-2 rounded-full ${config.dotColor} mt-1`}></span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
        <p className="text-xs text-muted-foreground/70 mt-2">{alert.timestamp}</p>
      </div>
    </div>
  )
}

export function AlertsSection() {
  return (
    <div className="metric-card">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Alerts</h3>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  )
}
