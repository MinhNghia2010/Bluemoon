import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET single household
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch all data in parallel for speed
    const [household, members, payments, parkingSlots, utilityBills] = await Promise.all([
      prisma.household.findUnique({
        where: { id },
        select: {
          id: true, unit: true, ownerName: true, area: true, floor: true,
          moveInDate: true, phone: true, email: true, status: true, balance: true
        }
      }),
      prisma.householdMember.findMany({
        where: { householdId: id },
        select: { id: true, name: true, dateOfBirth: true, cccd: true, profilePic: true }
      }),
      prisma.payment.findMany({
        where: { householdId: id },
        select: { id: true, amount: true, status: true, dueDate: true, paymentDate: true, feeCategory: { select: { name: true } } },
        orderBy: { dueDate: 'desc' },
        take: 20
      }),
      prisma.parkingSlot.findMany({
        where: { householdId: id },
        select: { id: true, slotNumber: true, type: true, licensePlate: true, monthlyFee: true }
      }),
      prisma.utilityBill.findMany({
        where: { householdId: id },
        select: { id: true, month: true, totalAmount: true, status: true, dueDate: true },
        orderBy: { dueDate: 'desc' },
        take: 12
      })
    ])

    if (!household) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...household,
      members,
      payments,
      parkingSlots,
      utilityBills,
      residents: members.length
    })
  } catch (error) {
    console.error('Get household error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update household
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const household = await prisma.household.update({
      where: { id },
      data: {
        ownerName: data.ownerName,
        area: data.area !== undefined ? (data.area ? parseFloat(data.area) : null) : undefined,
        floor: data.floor !== undefined ? (data.floor ? parseInt(data.floor) : null) : undefined,
        moveInDate: data.moveInDate !== undefined ? (data.moveInDate ? new Date(data.moveInDate) : null) : undefined,
        phone: data.phone,
        email: data.email,
        status: data.status
      },
      include: {
        members: true
      }
    })

    return NextResponse.json({ ...household, residents: household.members.length })
  } catch (error) {
    console.error('Update household error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE household
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.household.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Household deleted successfully' })
  } catch (error) {
    console.error('Delete household error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

