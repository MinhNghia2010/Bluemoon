'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/auth-context'

// Lazy load Login and Dashboard components
const Login = dynamic(() => import('@/components/Login').then(mod => ({ default: mod.Login })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-bg-page">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  ),
  ssr: false
})

const Dashboard = dynamic(() => import('@/components/Dashboard').then(mod => ({ default: mod.Dashboard })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-bg-page">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  ),
  ssr: false
})

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

