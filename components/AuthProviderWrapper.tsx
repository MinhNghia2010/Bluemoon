'use client'

import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'sonner'
import { ReactNode } from 'react'

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  )
}
