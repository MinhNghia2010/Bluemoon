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

    const household = await prisma.household.findUnique({
      where: { id },
      include: {
        members: true,
        payments: {
          include: { feeCategory: true },
          orderBy: { dueDate: 'desc' }
        },
        parkingSlots: true,
        utilityBills: {
          orderBy: { dueDate: 'desc' }
        }
      }
    })

    if (!household) {
      return NextResponse.json(
        { error: 'Household not found' },
        { status: 404 }
      )
    }

    // Calculate balance
    const balance = household.payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({ ...household, residents: household.members.length, balance })
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

