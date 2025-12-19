import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET all households
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { unit: { contains: search } },
        { ownerName: { contains: search } },
        { email: { contains: search } }
      ]
    }

    const households = await prisma.household.findMany({
      where,
      include: {
        payments: {
          where: { status: 'pending' },
          select: { amount: true }
        }
      },
      orderBy: { unit: 'asc' }
    })

    // Calculate balance for each household
    const householdsWithBalance = households.map(household => ({
      ...household,
      balance: household.payments.reduce((sum, p) => sum + p.amount, 0),
      payments: undefined
    }))

    return NextResponse.json(householdsWithBalance)
  } catch (error) {
    console.error('Get households error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new household
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { unit, ownerName, residents, phone, email } = data

    if (!unit || !ownerName || !phone || !email) {
      return NextResponse.json(
        { error: 'Unit, owner name, phone, and email are required' },
        { status: 400 }
      )
    }

    // Check if unit already exists
    const existing = await prisma.household.findUnique({
      where: { unit }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Unit already exists' },
        { status: 400 }
      )
    }

    const household = await prisma.household.create({
      data: {
        unit,
        ownerName,
        residents: residents || 1,
        phone,
        email,
        status: 'active'
      }
    })

    return NextResponse.json(household, { status: 201 })
  } catch (error) {
    console.error('Create household error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

