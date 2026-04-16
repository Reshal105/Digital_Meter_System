'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useRealtimeData, MeterData } from '@/hooks/use-realtime-data'
import { Header } from '@/components/header'
import { MetricCard } from '@/components/metric-card'
import { PowerChart } from '@/components/power-chart'
import { EnergyAnalytics } from '@/components/energy-analytics'
import { AlertsSection } from '@/components/alerts-section'
import { PredictionPanel } from '@/components/prediction-panel'
import { BillingSection } from '@/components/billing-section'
import { MeterSelector, Meter } from '@/components/meter-selector'
import { Zap, Waves, Lightbulb, Activity } from 'lucide-react'

const MOCK_METERS: Meter[] = [
  { id: '1', meterId: 'MTR-2024-001', location: 'New Delhi, India' },
  { id: '2', meterId: 'MTR-2024-002', location: 'Mumbai, India' },
  { id: '3', meterId: 'MTR-2024-003', location: 'Bangalore, India' },
]

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedMeterId, setSelectedMeterId] = useState('1')
  const { meterData, alerts } = useRealtimeData(`MTR-2024-${String(selectedMeterId).padStart(3, '0')}`)
  const [alertCount, setAlertCount] = useState(2)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary mb-4"></div>
          <p className="text-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Convert hourly history to daily/hourly data for charts
  const chartData = meterData.history.map((reading) => {
    const date = new Date(reading.timestamp)
    return {
      hour: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      usage: Math.round(reading.power * 10) / 10,
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Header notificationCount={alertCount} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Meter Selector */}
        <div className="mb-8 flex justify-end">
          <MeterSelector
            meters={MOCK_METERS}
            selectedMeterId={selectedMeterId}
            onMeterChange={setSelectedMeterId}
          />
        </div>

        {/* Live Metrics Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Live Metrics</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              type="voltage"
              label="Voltage"
              value={meterData.current.voltage}
              unit="V"
              icon={<Zap size={20} />}
              trend={2.5}
              trendLabel="+2.5% vs avg"
            />
            <MetricCard
              type="current"
              label="Current"
              value={meterData.current.current}
              unit="A"
              icon={<Waves size={20} />}
              trend={-1.2}
              trendLabel="-1.2% vs avg"
            />
            <MetricCard
              type="power"
              label="Power"
              value={meterData.current.power}
              unit="W"
              icon={<Lightbulb size={20} />}
              trend={5.8}
              trendLabel="+5.8% vs avg"
            />
            <MetricCard
              type="energy"
              label="Energy Consumed"
              value={meterData.dailyConsumption}
              unit="kWh"
              icon={<Activity size={20} />}
              trend={3.2}
              trendLabel="+3.2% vs avg"
            />
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
          <PowerChart data={meterData.history} />
          <EnergyAnalytics data={chartData} />
        </section>

        {/* Alerts and Prediction Section */}
        <section className="mb-8 grid gap-6 grid-cols-1 lg:grid-cols-3">
          <PredictionPanel
            status={meterData.peakUsage > 40 ? 'high' : 'normal'}
            message={meterData.peakUsage > 40 ? 'High Usage Detected' : 'Normal Operations'}
            recommendation={
              meterData.peakUsage > 40
                ? 'Consider reducing load or checking connected devices.'
                : 'All systems operating normally.'
            }
          />
          <div className="lg:col-span-2">
            <AlertsSection />
          </div>
        </section>

        {/* Billing Section */}
        <section className="mb-8">
          <BillingSection
            dailyConsumption={meterData.dailyConsumption}
            paymentStatus="pending"
          />
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-8">
          <p>Smart Energy Grid Monitoring System v1.0</p>
        </footer>
      </main>
    </div>
  )
}
