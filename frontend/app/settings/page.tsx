'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Header } from '@/components/header'
import { Moon, Sun } from 'lucide-react'

export default function SettingsPage() {
  const { user, isLoading, updateDailyLimit } = useAuth()
  const router = useRouter()
  const [dailyLimit, setDailyLimit] = useState<number>(50)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
    if (user) {
      setDailyLimit(user.dailyLimit)
    }
  }, [user, isLoading, router])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    updateDailyLimit(dailyLimit)
    setIsSaving(false)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your energy monitoring preferences</p>
        </div>

        {/* Daily Limit Settings */}
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Energy Limits</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Daily Usage Limit (kWh)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="w-24 px-4 py-2 rounded-lg border border-border bg-input text-foreground text-center font-semibold">
                  {dailyLimit} Units
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                You will receive an alert when daily consumption exceeds this limit.
              </p>
            </div>

            <div className="pt-4">
              <label className="block text-sm font-medium text-foreground mb-2">Alert Threshold</label>
              <select className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option>90% of limit (Warning)</option>
                <option>100% of limit (Critical)</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-border/50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="theme"
                checked={isDarkMode}
                onChange={() => setIsDarkMode(true)}
                className="w-4 h-4"
              />
              <Moon size={18} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Easier on the eyes at night</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 cursor-pointer transition-all duration-300 active:scale-[0.98]">
              <input
                type="radio"
                name="theme"
                checked={!isDarkMode}
                onChange={() => setIsDarkMode(false)}
                className="w-4 h-4 accent-orange-400" 
              />
              <Sun size={18} className={!isDarkMode ? "text-orange-500" : "text-slate-400"} />
              <div>
                <p className="text-sm font-medium text-slate-700">Light Mode</p>
                <p className="text-xs text-slate-500">Standard viewing experience</p>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-foreground">High consumption alerts</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-foreground">Payment reminders</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-foreground">System status updates</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex-1 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  )
}
