import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all parking slots or check for duplicate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const checkSlot = searchParams.get('checkSlot')
    const excludeId = searchParams.get('excludeId')

    // Check for duplicate slot number
    if (checkSlot) {
      const existing = await prisma.parkingSlot.findFirst({
        where: {
          slotNumber: checkSlot,
          ...(excludeId ? { NOT: { id: excludeId } } : {})
        }
      })
      return NextResponse.json({ exists: !!existing })
    }

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (type && type !== 'all') {
      where.type = type
    }

    const parkingSlots = await (prisma as any).parkingSlot.findMany({
      where,
      include: {
        household: {
          include: {
            owner: true
          }
        },
        member: {
          select: {
            id: true,
            name: true,
            status: true,
            household: {
              select: {
                id: true,
                unit: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: { slotNumber: 'asc' }
    })

    // Transform for response with vehicle owner (member) and household info
    const slotsWithOwnerName = parkingSlots.map((slot: any) => ({
      id: slot.id,
      slotNumber: slot.slotNumber,
      type: slot.type,
      licensePlate: slot.licensePlate,
      status: slot.status,
      monthlyFee: slot.monthlyFee,
      householdId: slot.householdId,
      memberId: slot.memberId,
      vehicleOwner: slot.member,
      household: slot.household ? {
        id: slot.household.id,
        unit: slot.household.unit,
        phone: slot.household.phone,
        ownerName: slot.household.owner?.name || 'No owner'
      } : null
    }))

    return NextResponse.json(slotsWithOwnerName, {
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

    const { slotNumber, type, monthlyFee, householdId, memberId, licensePlate } = data

    if (!slotNumber || !type) {
      return NextResponse.json(
        { error: 'Slot number and type are required' },
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

    // If no owner (memberId), set fee to 0 and status to available
    const hasOwner = !!memberId
    const finalMonthlyFee = hasOwner ? parseFloat(monthlyFee || '0') : 0
    const finalStatus = hasOwner ? 'occupied' : 'available'

    const parkingSlot = await prisma.parkingSlot.create({
      data: {
        slotNumber,
        type,
        licensePlate: licensePlate || null,
        monthlyFee: finalMonthlyFee,
        status: finalStatus,
        householdId: householdId || null,
        memberId: memberId || null
      },
      include: {
        household: true,
        member: {
          select: {
            id: true,
            name: true,
            status: true,
            household: {
              select: {
                id: true,
                unit: true,
                phone: true
              }
            }
          }
        }
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

