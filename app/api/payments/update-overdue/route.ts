import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST - Update all pending payments past due date to overdue
export async function POST() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of today

    // Update all pending payments where dueDate is before today
    const result = await prisma.payment.updateMany({
      where: {
        status: 'pending',
        dueDate: {
          lt: today
        }
      },
      data: {
        status: 'overdue'
      }
    })

    return NextResponse.json({
      message: `Updated ${result.count} payments to overdue`,
      count: result.count
    })
  } catch (error) {
    console.error('Update overdue payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Check and update overdue payments (can be called by cron)
export async function GET() {
  return POST()
}
