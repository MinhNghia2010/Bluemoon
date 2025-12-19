import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET single fee category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.feeCategory.findUnique({
      where: { id },
      include: {
        payments: {
          include: { household: true },
          orderBy: { dueDate: 'desc' },
          take: 10
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Fee category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Get fee category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update fee category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const category = await prisma.feeCategory.update({
      where: { id },
      data: {
        name: data.name,
        amount: parseFloat(data.amount),
        frequency: data.frequency,
        description: data.description,
        isActive: data.isActive
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Update fee category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE fee category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.feeCategory.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Fee category deleted successfully' })
  } catch (error) {
    console.error('Delete fee category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

