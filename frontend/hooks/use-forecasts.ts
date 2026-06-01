import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

export interface UsageForecast {
  next_24h_units: number
  next_24h_cost: number
  risk_level: 'low' | 'medium' | 'high'
  trend: 'increasing' | 'decreasing' | 'stable'
  current_avg_power: number
  peak_power: number
  suggestion: string
}

export interface WeatherPrediction {
  day: string
  condition: string
  high_temp: number
  low_temp: number
  predicted_kwh: number
  consumption_level: 'Low' | 'Medium' | 'High'
  suggestion: string
}

export function useForecasts() {
  const [usageForecast, setUsageForecast] = useState<UsageForecast | null>(null)
  const [weatherForecast, setWeatherForecast] = useState<WeatherPrediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForecasts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch usage forecast with fallback to mock data
        try {
          const usageResponse = await apiFetch<{ forecast: UsageForecast }>('/api/forecast/usage')
          setUsageForecast(usageResponse.forecast)
        } catch (err) {
          console.warn('Usage forecast fetch failed, using mock data:', err)
          // Fallback to mock data
          setUsageForecast({
            next_24h_units: 15.4,
            next_24h_cost: 184.8,
            risk_level: 'medium',
            trend: 'stable',
            current_avg_power: 1200,
            peak_power: 2100,
            suggestion: 'Your usage is tracking normally. Consider reducing peak load during 6-9 PM to save energy.'
          })
        }

        // Real-time weather fetch (UNCHANGED SOURCE)
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=Hyderabad&appid=53a22222562afa1dbbf37f8f74d7b96d&units=metric`
          )

          if (!res.ok) throw new Error('Weather API failed')
          const data = await res.json()

          // ✅ FIX: ensure UNIQUE DAYS (no repeated Friday)
          const uniqueDays = new Map()

          data.list.forEach((item: any) => {
          const dateObj = new Date(item.dt_txt)
          const dateKey = dateObj.toDateString()

          if (!uniqueDays.has(dateKey)) {
            uniqueDays.set(dateKey, item)
          }
        })

        const formatted: WeatherPrediction[] = Array.from(uniqueDays.values())
          .slice(0, 3)
          .map((item: any) => {
            const temp = item.main.temp

            let consumption: 'Low' | 'Medium' | 'High' = 'Low'
            let suggestion = 'Normal usage expected.'

            if (temp >= 32) {
              consumption = 'High'
              suggestion = 'High temperature may increase AC usage. Optimize cooling.'
            } else if (temp >= 26) {
              consumption = 'Medium'
              suggestion = 'Moderate temperature. Manage appliance usage.'
            } else {
              consumption = 'Low'
              suggestion = 'Mild weather. Reduce AC usage and save energy.'
            }

            const dateObj = new Date(item.dt_txt)

            return {
              day: dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              }),
              condition: item.weather[0].main,
              high_temp: Math.round(item.main.temp_max),
              low_temp: Math.round(item.main.temp_min),
              predicted_kwh: Math.round((temp / 10) * 2),
              consumption_level: consumption,
              suggestion: suggestion,
            }
          })

        setWeatherForecast(formatted)
        } catch (weatherErr) {
          console.warn('Weather forecast fetch failed, using mock data:', weatherErr)
          // Fallback to mock weather data
          setWeatherForecast([
            {
              day: 'Today',
              condition: 'Partly Cloudy',
              high_temp: 28,
              low_temp: 22,
              predicted_kwh: 15.2,
              consumption_level: 'Medium',
              suggestion: 'Moderate temperature - AC usage expected to be moderate'
            },
            {
              day: 'Tomorrow',
              condition: 'Sunny',
              high_temp: 32,
              low_temp: 24,
              predicted_kwh: 17.8,
              consumption_level: 'High',
              suggestion: 'High temperature expected - AC usage may increase by 15-20%'
            },
            {
              day: 'Day After Tomorrow',
              condition: 'Rainy',
              high_temp: 26,
              low_temp: 20,
              predicted_kwh: 12.4,
              consumption_level: 'Low',
              suggestion: 'Cooler weather - expect lower energy consumption'
            }
          ])
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch forecasts')
        // Make sure we have at least empty arrays/null
        if (!usageForecast) {
          setUsageForecast(null)
        }
        if (weatherForecast.length === 0) {
          setWeatherForecast([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchForecasts()

    const interval = setInterval(fetchForecasts, 600000)

    return () => clearInterval(interval)
  }, [])

  return {
    usageForecast,
    weatherForecast,
    isLoading,
    error,
  }
}