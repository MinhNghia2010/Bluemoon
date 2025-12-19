import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET single utility bill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const utilityBill = await prisma.utilityBill.findUnique({
      where: { id },
      include: {
        household: true
      }
    })

    if (!utilityBill) {
      return NextResponse.json(
        { error: 'Utility bill not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(utilityBill)
  } catch (error) {
    console.error('Get utility bill error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update utility bill (mark as paid, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const updateData: any = {}

    if (data.status) {
      updateData.status = data.status
      if (data.status === 'paid') {
        updateData.paidDate = new Date()
      }
    }

    if (data.amount) {
      updateData.amount = parseFloat(data.amount)
    }

    if (data.type) {
      updateData.type = data.type
    }

    const utilityBill = await prisma.utilityBill.update({
      where: { id },
      data: updateData,
      include: {
        household: true
      }
    })

    return NextResponse.json(utilityBill)
  } catch (error) {
    console.error('Update utility bill error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE utility bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.utilityBill.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Utility bill deleted successfully' })
  } catch (error) {
    console.error('Delete utility bill error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

