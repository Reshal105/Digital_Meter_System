import { useState, useEffect, useCallback } from 'react'

export interface PowerReading {
  timestamp: string
  voltage: number
  current: number
  power: number
  energy: number
}

export interface MeterData {
  meterId: string
  location: string
  current: PowerReading
  history: PowerReading[]
  totalConsumption: number
  dailyConsumption: number
  peakUsage: number
  averageUsage: number
}

export interface AlertData {
  id: string
  type: 'spike' | 'limit_exceeded' | 'low_voltage' | 'high_temp' | 'maintenance'
  severity: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
  value?: number
}

// Helper to generate realistic power readings based on time of day
function generatePowerReading(hour: number, baseVariation: number = 0): Omit<PowerReading, 'timestamp'> {
  // Base consumption pattern: low at night, peak during day, moderate in evening
  let baseLoad = 10
  if (hour >= 6 && hour < 9) baseLoad = 35 // Morning peak
  else if (hour >= 9 && hour < 17) baseLoad = 25 // Day average
  else if (hour >= 17 && hour < 21) baseLoad = 40 // Evening peak
  else if (hour >= 21 && hour < 23) baseLoad = 20 // Night

  // Add realistic variation
  const variation = (Math.random() - 0.5) * 10 + baseVariation
  const power = Math.max(5, Math.min(50, baseLoad + variation))

  // Voltage: 220V ± 5%
  const voltage = 220 + (Math.random() - 0.5) * 10

  // Current = Power / Voltage
  const current = power / (voltage / 1000)

  // Energy consumed (in kWh, incrementing over time)
  const energy = power / 1000 // kW

  return {
    voltage: Math.round(voltage * 100) / 100,
    current: Math.round(current * 100) / 100,
    power: Math.round(power * 100) / 100,
    energy: Math.round(energy * 100) / 100,
  }
}

export function useRealtimeData(meterId: string, initialHistoryLength: number = 24) {
  const [meterData, setMeterData] = useState<MeterData>(() => {
    const now = new Date()
    const history: PowerReading[] = []
    let totalEnergy = 0

    // Generate 24-hour history
    for (let i = initialHistoryLength - 1; i >= 0; i--) {
      const time = new Date(now)
      time.setHours(time.getHours() - i)
      const hour = time.getHours()

      const reading = generatePowerReading(hour)
      totalEnergy += reading.energy

      history.push({
        timestamp: time.toISOString(),
        ...reading,
      })
    }

    const currentReading = history[history.length - 1]
    const peakUsage = Math.max(...history.map((h) => h.power))
    const averageUsage = history.reduce((sum, h) => sum + h.power, 0) / history.length

    return {
      meterId,
      location: 'New Delhi, India',
      current: currentReading,
      history,
      totalConsumption: Math.round(totalEnergy * 100) / 100,
      dailyConsumption: Math.round(
        history
          .slice(-24)
          .reduce((sum, h) => sum + h.energy, 0) * 100
      ) / 100,
      peakUsage: Math.round(peakUsage * 100) / 100,
      averageUsage: Math.round(averageUsage * 100) / 100,
    }
  })

  const [alerts, setAlerts] = useState<AlertData[]>([])

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMeterData((prevData) => {
        const now = new Date()
        const hour = now.getHours()
        const variation = Math.random() * 20

        const newReading = {
          timestamp: now.toISOString(),
          ...generatePowerReading(hour, variation),
        }

        const updatedHistory = [...prevData.history, newReading].slice(-168) // Keep last 7 days

        const peakUsage = Math.max(...updatedHistory.map((h) => h.power))
        const averageUsage = updatedHistory.reduce((sum, h) => sum + h.power, 0) / updatedHistory.length
        const dailyConsumption =
          Math.round(
            updatedHistory
              .slice(-24)
              .reduce((sum, h) => sum + h.energy, 0) * 100
          ) / 100

        // Check for alerts
        const newAlerts: AlertData[] = []

        // Spike detection
        if (newReading.power > averageUsage * 1.5) {
          newAlerts.push({
            id: `spike-${Date.now()}`,
            type: 'spike',
            severity: newReading.power > averageUsage * 2 ? 'critical' : 'warning',
            message: `Power spike detected: ${newReading.power}W`,
            timestamp: now.toISOString(),
            value: newReading.power,
          })
        }

        // Low voltage warning
        if (newReading.voltage < 210) {
          newAlerts.push({
            id: `voltage-${Date.now()}`,
            type: 'low_voltage',
            severity: 'warning',
            message: `Low voltage: ${newReading.voltage}V`,
            timestamp: now.toISOString(),
            value: newReading.voltage,
          })
        }

        setAlerts((prev) => [...newAlerts, ...prev].slice(0, 10)) // Keep last 10 alerts

        return {
          ...prevData,
          current: newReading,
          history: updatedHistory,
          totalConsumption: prevData.totalConsumption + newReading.energy,
          dailyConsumption,
          peakUsage: Math.round(peakUsage * 100) / 100,
          averageUsage: Math.round(averageUsage * 100) / 100,
        }
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return { meterData, alerts }
}
