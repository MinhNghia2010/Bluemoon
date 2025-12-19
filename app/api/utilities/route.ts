import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all utility bills
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const householdId = searchParams.get('householdId')

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (type && type !== 'all') {
      where.type = type
    }

    if (householdId) {
      where.householdId = householdId
    }

    const utilityBills = await prisma.utilityBill.findMany({
      where,
      include: {
        household: {
          select: { id: true, unit: true, ownerName: true }
        }
      },
      orderBy: { dueDate: 'desc' }
    })

    return NextResponse.json(utilityBills)
  } catch (error) {
    console.error('Get utility bills error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new utility bill
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { householdId, type, amount, periodStart, periodEnd, dueDate } = data

    if (!householdId || !type || !amount || !periodStart || !periodEnd || !dueDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const utilityBill = await prisma.utilityBill.create({
      data: {
        householdId,
        type,
        amount: parseFloat(amount),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        dueDate: new Date(dueDate),
        status: 'pending'
      },
      include: {
        household: true
      }
    })

    return NextResponse.json(utilityBill, { status: 201 })
  } catch (error) {
    console.error('Create utility bill error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

