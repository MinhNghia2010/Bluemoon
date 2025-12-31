import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET single parking slot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const parkingSlot = await prisma.parkingSlot.findUnique({
      where: { id },
      include: {
        household: true
      }
    })

    if (!parkingSlot) {
      return NextResponse.json(
        { error: 'Parking slot not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(parkingSlot)
  } catch (error) {
    console.error('Get parking slot error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update parking slot
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const updateData: any = {}

    // Check for duplicate slot number if changing
    if (data.slotNumber) {
      const existing = await prisma.parkingSlot.findFirst({
        where: {
          slotNumber: data.slotNumber,
          NOT: { id }
        }
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Slot number already exists' },
          { status: 400 }
        )
      }
      updateData.slotNumber = data.slotNumber
    }

    if (data.type) updateData.type = data.type
    if (data.monthlyFee !== undefined) updateData.monthlyFee = parseFloat(data.monthlyFee)
    if (data.status) updateData.status = data.status
    if (data.licensePlate !== undefined) updateData.licensePlate = data.licensePlate || null

    // Handle member assignment (vehicle ownership)
    if (data.memberId !== undefined) {
      updateData.memberId = data.memberId || null
      updateData.status = data.memberId ? 'occupied' : 'available'
      // Clear license plate if unassigning
      if (!data.memberId) {
        updateData.licensePlate = null
      }
    }

    // Handle household assignment (for backward compatibility)
    if (data.householdId !== undefined) {
      updateData.householdId = data.householdId || null
      // Don't override status if we have a member assigned
      if (!data.memberId) {
        updateData.status = data.householdId ? 'occupied' : 'available'
        // Clear license plate if unassigning
        if (!data.householdId) {
          updateData.licensePlate = null
        }
      }
    }

    const parkingSlot = await prisma.parkingSlot.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(parkingSlot)
  } catch (error) {
    console.error('Update parking slot error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE parking slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.parkingSlot.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Parking slot deleted successfully' })
  } catch (error) {
    console.error('Delete parking slot error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

