import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all fee categories
export async function GET() {
  try {
    const categories = await prisma.feeCategory.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Get fee categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new fee category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { name, amount, frequency, description } = data

    if (!name || !amount || !frequency) {
      return NextResponse.json(
        { error: 'Name, amount, and frequency are required' },
        { status: 400 }
      )
    }

    // Check if category already exists
    const existing = await prisma.feeCategory.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.feeCategory.create({
      data: {
        name,
        amount: parseFloat(amount),
        frequency,
        description: description || null,
        isActive: true
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Create fee category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

