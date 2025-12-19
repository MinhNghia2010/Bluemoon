import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all households
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { unit: { contains: search, mode: 'insensitive' } },
        { ownerName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const households = await prisma.household.findMany({
      where,
      include: {
        members: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        },
        payments: {
          where: { status: 'pending' },
          select: { amount: true }
        }
      },
      orderBy: { unit: 'asc' }
    })

    // Calculate balance for each household and add member count
    const householdsWithBalance = households.map(household => ({
      ...household,
      residents: household.members.length,
      balance: household.payments.reduce((sum, p) => sum + p.amount, 0),
      members: household.members, // Keep members for avatar display
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

    const { unit, ownerName, area, floor, moveInDate, phone, email } = data

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
        area: area ? parseFloat(area) : null,
        floor: floor ? parseInt(floor) : null,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        phone,
        email,
        status: 'active'
      },
      include: {
        members: true
      }
    })

    return NextResponse.json({ ...household, residents: household.members.length }, { status: 201 })
  } catch (error) {
    console.error('Create household error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

