'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock user data
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      meterId: 'MTR-2024-001',
      location: 'New Delhi, India',
      dailyLimit: 50,
    }

    setUser(mockUser)
    localStorage.setItem('smartgrid_user', JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('smartgrid_user')
  }

  const updateDailyLimit = (limit: number) => {
    if (user) {
      const updatedUser = { ...user, dailyLimit: limit }
      setUser(updatedUser)
      localStorage.setItem('smartgrid_user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateDailyLimit }}>
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
