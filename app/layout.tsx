import type { Metadata } from 'next'
import './globals.css'
import { AuthProviderWrapper } from '@/components/AuthProviderWrapper'

export const metadata: Metadata = {
  title: 'BlueMoon v2.0 - Apartment Fee Management',
  description: 'Manage apartment fees, households, and payments',
    icons: {
    icon: '/images/Logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  )
}

