import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET single payment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        household: true,
        feeCategory: true
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Get payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update payment (mark as paid, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    // Get the current payment to check status change
    const currentPayment = await prisma.payment.findUnique({
      where: { id }
    })

    if (!currentPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    const oldStatus = currentPayment.status
    const newStatus = data.status || oldStatus
    const oldAmount = currentPayment.amount
    const newAmount = data.amount ? parseFloat(data.amount) : oldAmount

    if (data.status) {
      updateData.status = data.status
      if (data.status === 'collected') {
        updateData.paymentDate = new Date()
        updateData.paymentMethod = data.paymentMethod || 'cash'
      } else {
        // If changing back from collected, clear payment date
        updateData.paymentDate = null
        updateData.paymentMethod = null
      }
    }

    if (data.amount) {
      updateData.amount = newAmount
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes
    }

    // Use transaction to update payment and household balance
    const result = await prisma.$transaction(async (tx) => {
      // Calculate balance adjustment
      let balanceAdjustment = 0

      // Handle status changes
      if (oldStatus !== newStatus) {
        if (oldStatus === 'collected' && (newStatus === 'pending' || newStatus === 'overdue')) {
          // Payment was collected, now it's pending/overdue - increase balance
          balanceAdjustment = newAmount
        } else if ((oldStatus === 'pending' || oldStatus === 'overdue') && newStatus === 'collected') {
          // Payment was pending/overdue, now it's collected - decrease balance
          balanceAdjustment = -oldAmount
        }
      } else if (oldStatus !== 'collected' && newStatus !== 'collected') {
        // Same non-collected status, but amount might have changed
        balanceAdjustment = newAmount - oldAmount
      }

      // Update the payment
      const payment = await tx.payment.update({
        where: { id },
        data: updateData,
        include: {
          household: true,
          feeCategory: true
        }
      })

      // Update household balance if needed
      if (balanceAdjustment !== 0) {
        await tx.household.update({
          where: { id: currentPayment.householdId },
          data: {
            balance: { increment: balanceAdjustment }
          }
        })
      }

      return payment
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Update payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the payment first to check if we need to adjust balance
    const payment = await prisma.payment.findUnique({
      where: { id }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Use transaction to delete payment and update household balance
    await prisma.$transaction(async (tx) => {
      // Delete the payment
      await tx.payment.delete({
        where: { id }
      })

      // If payment was not collected, decrease the household balance
      if (payment.status !== 'collected') {
        await tx.household.update({
          where: { id: payment.householdId },
          data: {
            balance: { decrement: payment.amount }
          }
        })
      }
    })

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Delete payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

