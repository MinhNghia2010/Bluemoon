import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BlueMoon v2.0 - Apartment Fee Management',
  description: 'Manage apartment fees, households, and payments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

