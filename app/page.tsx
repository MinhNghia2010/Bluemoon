'use client'

import { useAuth } from '@/lib/auth-context'
import { Login } from '@/components/Login'
import { Dashboard } from '@/components/Dashboard'

export default function HomePage() {
  const { user, isLoading, logout } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-page">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <Dashboard onLogout={logout} />
}

