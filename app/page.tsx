'use client'

import { useState } from 'react'
import { Login } from '@/components/Login'
import { Dashboard } from '@/components/Dashboard'
import { Toaster } from 'sonner'

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="bottom-right" richColors />
      </>
    )
  }

  return (
    <>
      <Dashboard onLogout={handleLogout} />
      <Toaster position="bottom-right" richColors />
    </>
  )
}

