import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const householdId = searchParams.get('householdId')
    const categoryId = searchParams.get('categoryId')

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (householdId) {
      where.householdId = householdId
    }
    
    if (categoryId) {
      where.feeCategoryId = categoryId
    }

    const payments = await prisma.payment.findMany({
      where,
      select: {
        id: true,
        amount: true,
        status: true,
        dueDate: true,
        paymentDate: true,
        paymentMethod: true,
        householdId: true,
        feeCategoryId: true,
        household: { select: { id: true, unit: true, ownerName: true } },
        feeCategory: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: 'desc' }
    })

    return NextResponse.json(payments, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59'
      }
    })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new payment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { householdId, feeCategoryId, amount, dueDate, status: initialStatus } = data

    if (!householdId || !feeCategoryId || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Household, fee category, amount, and due date are required' },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount)
    const paymentStatus = initialStatus || 'pending'

    // Use transaction to create payment and update household balance
    const result = await prisma.$transaction(async (tx) => {
      // Create the payment
      const payment = await tx.payment.create({
        data: {
          householdId,
          feeCategoryId,
          amount: parsedAmount,
          dueDate: new Date(dueDate),
          status: paymentStatus,
          paymentDate: paymentStatus === 'collected' ? new Date() : null,
          paymentMethod: paymentStatus === 'collected' ? (data.paymentMethod || 'cash') : null,
          notes: data.notes
        },
        include: {
          household: true,
          feeCategory: true
        }
      })

      // Only increase balance if payment is not collected
      if (paymentStatus !== 'collected') {
        await tx.household.update({
          where: { id: householdId },
          data: {
            balance: { increment: parsedAmount }
          }
        })
      }

      return payment
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT generate monthly payments for all households
export async function PUT(request: NextRequest) {
  try {
    const { feeCategoryId, month, year } = await request.json()

    if (!feeCategoryId) {
      return NextResponse.json(
        { error: 'Fee category is required' },
        { status: 400 }
      )
    }

    const category = await prisma.feeCategory.findUnique({
      where: { id: feeCategoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Fee category not found' },
        { status: 404 }
      )
    }

    const households = await prisma.household.findMany({
      where: { status: 'active' }
    })

    const dueDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) + 1, 0)

    // Use transaction to create payments and update household balances
    const result = await prisma.$transaction(async (tx) => {
      const payments = await Promise.all(
        households.map(async (household) => {
          // Create payment
          const payment = await tx.payment.create({
            data: {
              householdId: household.id,
              feeCategoryId: category.id,
              amount: category.amount,
              dueDate,
              status: 'pending'
            }
          })

          // Update household balance
          await tx.household.update({
            where: { id: household.id },
            data: {
              balance: { increment: category.amount }
            }
          })

          return payment
        })
      )

      return payments
    })

    return NextResponse.json({
      message: `Created ${result.length} payments`,
      count: result.length
    })
  } catch (error) {
    console.error('Generate payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

