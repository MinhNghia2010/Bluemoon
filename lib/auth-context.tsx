'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from './api'

interface User {
  id: string
  username: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('bluemoon-token')
    const storedUser = localStorage.getItem('bluemoon-user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password)
    
    setToken(response.token)
    setUser(response.user)
    
    localStorage.setItem('bluemoon-token', response.token)
    localStorage.setItem('bluemoon-user', JSON.stringify(response.user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('bluemoon-token')
    localStorage.removeItem('bluemoon-user')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

