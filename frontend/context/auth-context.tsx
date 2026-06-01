'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

export interface User {
  id: string
  email: string
  name: string
  meterId: string
  location: string
  dailyLimit: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (payload: {
    email: string
    password: string
    name: string
    phone: string
    location: string
    meterId: string
  }) => Promise<void>
  logout: () => void
  updateDailyLimit: (limit: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('smartgrid_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const persistUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem('smartgrid_user', JSON.stringify(userData))
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    const result = await apiFetch<{
      message: string
      user: {
        id: string
        email: string
        name?: string
        phone?: string
        location?: string
        meterId?: string
      }
    }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    const userData: User = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name || email.split('@')[0],
      location: result.user.location || 'Unknown',
      meterId: result.user.meterId || result.user.meter_id || 'Unknown',
      dailyLimit: result.user.daily_limit ?? 50,
    }

    persistUser(userData)
    setIsLoading(false)
  }

  const signup = async ({ email, password, name, phone, location, meterId }: {
    email: string
    password: string
    name: string
    phone: string
    location: string
    meterId: string
  }) => {
    setIsLoading(true)

    const result = await apiFetch<{
      message: string
      user: {
        id: string
        email: string
        name?: string
        phone?: string
        location?: string
        meterId?: string
      }
    }>('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone, location, meterId }),
    })

    const userData: User = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name || name,
      meterId: result.user.meterId || result.user.meter_id || meterId,
      location: result.user.location || location,
      dailyLimit: result.user.daily_limit ?? 50,
    }

    persistUser(userData)
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('smartgrid_user')
  }

  const updateDailyLimit = (limit: number) => {
    if (user) {
      const updatedUser = { ...user, dailyLimit: limit }
      persistUser(updatedUser)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateDailyLimit }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

