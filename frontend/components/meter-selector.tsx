'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface Meter {
  id: string
  meterId: string
  location: string
}

interface MeterSelectorProps {
  meters: Meter[]
  selectedMeterId: string
  onMeterChange: (meterId: string) => void
}

export function MeterSelector({ meters, selectedMeterId, onMeterChange }: MeterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedMeter = meters.find((m) => m.id === selectedMeterId)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors text-foreground text-sm font-medium"
      >
        <div className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground">Meter:</span>
          <span className="font-semibold">{selectedMeter?.meterId}</span>
        </div>
        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-2">
            {meters.map((meter) => (
              <button
                key={meter.id}
                onClick={() => {
                  onMeterChange(meter.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedMeterId === meter.id
                    ? 'bg-primary/20 border-l-2 border-l-primary'
                    : 'hover:bg-border/50'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground text-sm">{meter.meterId}</span>
                  <span className="text-xs text-muted-foreground">{meter.location}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
