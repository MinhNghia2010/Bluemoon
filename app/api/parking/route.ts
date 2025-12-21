import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all parking slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (type && type !== 'all') {
      where.type = type
    }

    const parkingSlots = await prisma.parkingSlot.findMany({
      where,
      select: {
        id: true,
        slotNumber: true,
        type: true,
        licensePlate: true,
        status: true,
        monthlyFee: true,
        householdId: true,
        household: { select: { id: true, unit: true, ownerName: true, phone: true } }
      },
      orderBy: { slotNumber: 'asc' }
    })

    return NextResponse.json(parkingSlots, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59'
      }
    })
  } catch (error) {
    console.error('Get parking slots error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new parking slot
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { slotNumber, type, monthlyFee, householdId, licensePlate } = data

    if (!slotNumber || !type || !monthlyFee) {
      return NextResponse.json(
        { error: 'Slot number, type, and monthly fee are required' },
        { status: 400 }
      )
    }

    // Check if slot already exists
    const existing = await prisma.parkingSlot.findUnique({
      where: { slotNumber }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Slot number already exists' },
        { status: 400 }
      )
    }

    const parkingSlot = await prisma.parkingSlot.create({
      data: {
        slotNumber,
        type,
        licensePlate: licensePlate || null,
        monthlyFee: parseFloat(monthlyFee),
        status: householdId ? 'occupied' : 'available',
        householdId: householdId || null
      },
      include: {
        household: true
      }
    })

    return NextResponse.json(parkingSlot, { status: 201 })
  } catch (error) {
    console.error('Create parking slot error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

