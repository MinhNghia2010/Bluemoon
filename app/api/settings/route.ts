import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET all settings
export async function GET() {
  try {
    const settings = await prisma.setting.findMany()

    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Upsert each setting
    const updates = Object.entries(data).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    )

    await Promise.all(updates)

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

