'use client'

import { Bell, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HeaderProps {
  notificationCount?: number
}

export function Header({ notificationCount = 2 }: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-6 gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">HTF</h1>
          <p className="text-xs text-muted-foreground">Real-Time Monitoring & Billing</p>
        </div>

        <div className="hidden md:flex flex-col text-right text-sm">
          <p className="text-foreground font-medium">{user?.name || 'Guest'}</p>
          <p className="text-muted-foreground text-xs">{user?.location || 'Location'}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-border/50 rounded-lg">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-0 -right-0 inline-flex items-center justify-center h-5 w-5 bg-destructive text-foreground rounded-full text-xs font-bold">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <Link href="/settings" className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-border/50 rounded-lg inline-flex">
            <Settings size={20} />
          </Link>

          {/* User Avatar */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-border/50 transition-colors cursor-pointer">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-lg"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
