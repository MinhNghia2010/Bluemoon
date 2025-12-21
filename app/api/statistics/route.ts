import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Helper to safely convert BigInt to Number
function toNum(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

export async function GET() {
  try {
    const MAX_PARKING_SLOTS = 500
    const MAX_PARKING_HOUSEHOLDS = 100

    // Single optimized raw SQL query for ALL counts and sums
    const [mainStats, parkingStats, recentPayments, recentUtilities, categoryDistribution] = await Promise.all([
      // Main statistics - single query for everything
      prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(`
        SELECT 
          (SELECT COUNT(*)::int FROM "Household") as total_households,
          (SELECT COUNT(*)::int FROM "Household" WHERE status = 'active') as active_households,
          (SELECT COUNT(*)::int FROM "HouseholdMember") as total_residents,
          (SELECT COUNT(*)::int FROM "Payment") as total_payments,
          (SELECT COUNT(*)::int FROM "Payment" WHERE status = 'pending') as pending_payments,
          (SELECT COUNT(*)::int FROM "Payment" WHERE status = 'collected') as collected_payments,
          (SELECT COUNT(*)::int FROM "Payment" WHERE status = 'overdue') as overdue_payments,
          (SELECT COALESCE(SUM(amount), 0)::float FROM "Payment" WHERE status = 'collected') as payments_collected_sum,
          (SELECT COALESCE(SUM(amount), 0)::float FROM "Payment" WHERE status = 'pending') as payments_pending_sum,
          (SELECT COALESCE(SUM(amount), 0)::float FROM "Payment" WHERE status = 'overdue') as payments_overdue_sum,
          (SELECT COUNT(*)::int FROM "ParkingSlot") as total_parking,
          (SELECT COUNT(*)::int FROM "UtilityBill") as total_utilities,
          (SELECT COUNT(*)::int FROM "UtilityBill" WHERE status = 'pending') as pending_utilities,
          (SELECT COUNT(*)::int FROM "UtilityBill" WHERE status = 'paid') as paid_utilities,
          (SELECT COUNT(*)::int FROM "UtilityBill" WHERE status = 'overdue') as overdue_utilities,
          (SELECT COALESCE(SUM("totalAmount"), 0)::float FROM "UtilityBill" WHERE status = 'paid') as utilities_paid_sum,
          (SELECT COALESCE(SUM("totalAmount"), 0)::float FROM "UtilityBill" WHERE status = 'pending') as utilities_pending_sum,
          (SELECT COALESCE(SUM("totalAmount"), 0)::float FROM "UtilityBill" WHERE status = 'overdue') as utilities_overdue_sum,
          (SELECT COALESCE(SUM("electricityCost"), 0)::float FROM "UtilityBill") as electricity_sum,
          (SELECT COALESCE(SUM("waterCost"), 0)::float FROM "UtilityBill") as water_sum,
          (SELECT COALESCE(SUM("internetCost"), 0)::float FROM "UtilityBill") as internet_sum
      `),
      
      // Parking statistics - single query
      prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(`
        SELECT 
          COALESCE(SUM("monthlyFee"), 0)::float as monthly_fee_sum,
          COUNT(DISTINCT "householdId")::int as households_count,
          SUM(CASE WHEN type = 'car' THEN 1 ELSE 0 END)::int as car_count,
          SUM(CASE WHEN type = 'motorcycle' THEN 1 ELSE 0 END)::int as motorcycle_count,
          SUM(CASE WHEN type = 'bicycle' THEN 1 ELSE 0 END)::int as bicycle_count
        FROM "ParkingSlot"
      `),
      
      // Recent payments (last 6 months)
      prisma.payment.findMany({
        where: { dueDate: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
        select: { amount: true, status: true, dueDate: true }
      }),
      
      // Recent utilities (last 6 months)
      prisma.utilityBill.findMany({
        where: { dueDate: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
        select: { totalAmount: true, status: true, dueDate: true }
      }),
      
      // Category distribution
      prisma.feeCategory.findMany({
        select: { name: true, amount: true, _count: { select: { payments: true } } }
      })
    ])

    // Extract main stats (safely handle types)
    const s = mainStats[0] || {}
    const totalHouseholds = toNum(s.total_households)
    const activeHouseholds = toNum(s.active_households)
    const totalResidents = toNum(s.total_residents)
    const totalPayments = toNum(s.total_payments)
    const pendingPayments = toNum(s.pending_payments)
    const collectedPayments = toNum(s.collected_payments)
    const overduePayments = toNum(s.overdue_payments)
    const paymentsCollectedSum = toNum(s.payments_collected_sum)
    const paymentsPendingSum = toNum(s.payments_pending_sum)
    const paymentsOverdueSum = toNum(s.payments_overdue_sum)
    const totalParkingSlots = toNum(s.total_parking)
    const totalUtilityBills = toNum(s.total_utilities)
    const pendingUtilityBills = toNum(s.pending_utilities)
    const paidUtilityBills = toNum(s.paid_utilities)
    const overdueUtilityBills = toNum(s.overdue_utilities)
    const utilitiesPaidSum = toNum(s.utilities_paid_sum)
    const utilitiesPendingSum = toNum(s.utilities_pending_sum)
    const utilitiesOverdueSum = toNum(s.utilities_overdue_sum)
    const electricitySum = toNum(s.electricity_sum)
    const waterSum = toNum(s.water_sum)
    const internetSum = toNum(s.internet_sum)

    // Extract parking stats
    const p = parkingStats[0] || {}
    const monthlyParkingRevenue = toNum(p.monthly_fee_sum)
    const parkingHouseholdsCount = toNum(p.households_count)
    const carCount = toNum(p.car_count)
    const motorcycleCount = toNum(p.motorcycle_count)
    const bicycleCount = toNum(p.bicycle_count)
    const occupiedParkingSlots = totalParkingSlots
    const availableParkingSlots = MAX_PARKING_SLOTS - totalParkingSlots

    // Initialize last 6 months for monthly revenue
    const monthlyRevenue: { [key: string]: { collected: number, pending: number, overdue: number } } = {}
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      monthlyRevenue[date.toISOString().slice(0, 7)] = { collected: 0, pending: 0, overdue: 0 }
    }

    // Group payments by month
    recentPayments.forEach(pay => {
      const key = pay.dueDate.toISOString().slice(0, 7)
      if (monthlyRevenue[key]) {
        if (pay.status === 'collected') monthlyRevenue[key].collected += pay.amount
        else if (pay.status === 'pending') monthlyRevenue[key].pending += pay.amount
        else if (pay.status === 'overdue') monthlyRevenue[key].overdue += pay.amount
      }
    })

    // Group utilities by month
    recentUtilities.forEach(util => {
      const key = util.dueDate.toISOString().slice(0, 7)
      if (monthlyRevenue[key]) {
        if (util.status === 'paid') monthlyRevenue[key].collected += util.totalAmount
        else if (util.status === 'pending') monthlyRevenue[key].pending += util.totalAmount
        else if (util.status === 'overdue') monthlyRevenue[key].overdue += util.totalAmount
      }
    })

    // Calculate rates
    const feeCollectionRate = totalPayments > 0 ? Math.round((collectedPayments / totalPayments) * 100) : 0
    const utilityCollectionRate = totalUtilityBills > 0 ? Math.round((paidUtilityBills / totalUtilityBills) * 100) : 0

    // Totals
    const totalCollected = paymentsCollectedSum + utilitiesPaidSum + monthlyParkingRevenue
    const totalPending = paymentsPendingSum + utilitiesPendingSum
    const totalOverdue = paymentsOverdueSum + utilitiesOverdueSum

    return NextResponse.json({
      overview: {
        totalHouseholds,
        activeHouseholds,
        totalResidents,
        totalPayments,
        pendingPayments,
        collectedPayments,
        overduePayments,
        feeCollectionRate,
        totalUtilityBills,
        pendingUtilityBills,
        paidUtilityBills,
        overdueUtilityBills,
        utilityCollectionRate,
        totalParkingSlots,
        occupiedParkingSlots,
        availableParkingSlots,
        maxParkingSlots: MAX_PARKING_SLOTS,
        maxParkingHouseholds: MAX_PARKING_HOUSEHOLDS,
        parkingHouseholdsCount,
        availableParkingHouseholdSlots: MAX_PARKING_HOUSEHOLDS - parkingHouseholdsCount
      },
      feePayments: {
        collected: paymentsCollectedSum,
        pending: paymentsPendingSum,
        overdue: paymentsOverdueSum,
        total: paymentsCollectedSum + paymentsPendingSum + paymentsOverdueSum
      },
      utilities: {
        paid: utilitiesPaidSum,
        pending: utilitiesPendingSum,
        overdue: utilitiesOverdueSum,
        total: utilitiesPaidSum + utilitiesPendingSum + utilitiesOverdueSum,
        byType: {
          electricity: { amount: electricitySum, count: totalUtilityBills },
          water: { amount: waterSum, count: totalUtilityBills },
          internet: { amount: internetSum, count: totalUtilityBills },
          gas: { amount: 0, count: 0 }
        }
      },
      parking: {
        total: totalParkingSlots,
        occupied: occupiedParkingSlots,
        available: availableParkingSlots,
        maxSlots: MAX_PARKING_SLOTS,
        maxHouseholds: MAX_PARKING_HOUSEHOLDS,
        householdsWithParking: parkingHouseholdsCount,
        availableHouseholdSlots: MAX_PARKING_HOUSEHOLDS - parkingHouseholdsCount,
        monthlyRevenue: monthlyParkingRevenue,
        byType: {
          car: carCount,
          motorcycle: motorcycleCount,
          bicycle: bicycleCount
        }
      },
      financials: {
        totalCollected,
        totalPending,
        totalOverdue,
        grandTotal: totalCollected + totalPending + totalOverdue
      },
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, data]) => ({
        month,
        ...data,
        total: data.collected + data.pending + data.overdue
      })).sort((a, b) => a.month.localeCompare(b.month)),
      categoryDistribution: categoryDistribution.map(cat => ({
        name: cat.name,
        count: cat._count.payments,
        amount: cat.amount,
        totalValue: cat._count.payments * cat.amount
      }))
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=59'
      }
    })
  } catch (error) {
    console.error('Statistics API error:', error)
    return NextResponse.json({ 
      error: 'Failed to load statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
