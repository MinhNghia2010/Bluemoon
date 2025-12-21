import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all utility bills
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const householdId = searchParams.get('householdId')

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }

    if (householdId) {
      where.householdId = householdId
    }

    const utilityBills = await prisma.utilityBill.findMany({
      where,
      select: {
        id: true,
        month: true,
        periodStart: true,
        periodEnd: true,
        dueDate: true,
        electricityUsage: true,
        electricityRate: true,
        electricityCost: true,
        waterUsage: true,
        waterRate: true,
        waterCost: true,
        internetCost: true,
        totalAmount: true,
        status: true,
        paidDate: true,
        householdId: true,
        household: { select: { id: true, unit: true, ownerName: true, phone: true } }
      },
      orderBy: { dueDate: 'desc' }
    })

    return NextResponse.json(utilityBills, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59'
      }
    })
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

    const { 
      householdId, 
      month,
      periodStart, 
      periodEnd, 
      dueDate,
      electricityUsage,
      electricityRate,
      electricityCost,
      waterUsage,
      waterRate,
      waterCost,
      internetCost,
      totalAmount,
      status
    } = data

    if (!householdId || !month) {
      return NextResponse.json(
        { error: 'Household and billing period are required' },
        { status: 400 }
      )
    }

    // Calculate period dates from month string (e.g., "December 2025")
    const now = new Date()
    const periodStartDate = periodStart ? new Date(periodStart) : new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEndDate = periodEnd ? new Date(periodEnd) : new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const dueDateValue = dueDate ? new Date(dueDate) : new Date(now.getFullYear(), now.getMonth() + 1, 15) // 15th of next month

    const utilityBill = await prisma.utilityBill.create({
      data: {
        householdId,
        month,
        periodStart: periodStartDate,
        periodEnd: periodEndDate,
        dueDate: dueDateValue,
        electricityUsage: electricityUsage || 0,
        electricityRate: electricityRate || 0.15,
        electricityCost: electricityCost || 0,
        waterUsage: waterUsage || 0,
        waterRate: waterRate || 1.5,
        waterCost: waterCost || 0,
        internetCost: internetCost || 0,
        totalAmount: totalAmount || 0,
        status: status || 'pending'
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

