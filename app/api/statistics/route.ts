import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Parking capacity constants
    const MAX_PARKING_SLOTS = 500
    const MAX_PARKING_HOUSEHOLDS = 100

    // Use raw SQL for ultra-fast aggregations - single query for counts
    const [
      counts,
      paymentAggregates,
      utilityAggregates,
      parkingData,
      recentPayments,
      recentUtilities,
      categoryDistribution
    ] = await Promise.all([
      // Single query for all counts using raw SQL
      prisma.$queryRaw<[{
        total_households: bigint,
        active_households: bigint,
        total_residents: bigint,
        total_payments: bigint,
        pending_payments: bigint,
        collected_payments: bigint,
        overdue_payments: bigint,
        total_parking: bigint,
        total_utilities: bigint,
        pending_utilities: bigint,
        paid_utilities: bigint,
        overdue_utilities: bigint
      }]>`
        SELECT 
          (SELECT COUNT(*) FROM "Household") as total_households,
          (SELECT COUNT(*) FROM "Household" WHERE status = 'active') as active_households,
          (SELECT COUNT(*) FROM "HouseholdMember") as total_residents,
          (SELECT COUNT(*) FROM "Payment") as total_payments,
          (SELECT COUNT(*) FROM "Payment" WHERE status = 'pending') as pending_payments,
          (SELECT COUNT(*) FROM "Payment" WHERE status = 'collected') as collected_payments,
          (SELECT COUNT(*) FROM "Payment" WHERE status = 'overdue') as overdue_payments,
          (SELECT COUNT(*) FROM "ParkingSlot") as total_parking,
          (SELECT COUNT(*) FROM "UtilityBill") as total_utilities,
          (SELECT COUNT(*) FROM "UtilityBill" WHERE status = 'pending') as pending_utilities,
          (SELECT COUNT(*) FROM "UtilityBill" WHERE status = 'paid') as paid_utilities,
          (SELECT COUNT(*) FROM "UtilityBill" WHERE status = 'overdue') as overdue_utilities
      `,
      // Payment aggregates in single query
      prisma.$queryRaw<[{
        collected_sum: number | null,
        pending_sum: number | null,
        overdue_sum: number | null
      }]>`
        SELECT 
          SUM(CASE WHEN status = 'collected' THEN amount ELSE 0 END) as collected_sum,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_sum,
          SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_sum
        FROM "Payment"
      `,
      // Utility aggregates in single query
      prisma.$queryRaw<[{
        paid_sum: number | null,
        pending_sum: number | null,
        overdue_sum: number | null,
        electricity_sum: number | null,
        water_sum: number | null,
        internet_sum: number | null,
        total_count: bigint
      }]>`
        SELECT 
          SUM(CASE WHEN status = 'paid' THEN "totalAmount" ELSE 0 END) as paid_sum,
          SUM(CASE WHEN status = 'pending' THEN "totalAmount" ELSE 0 END) as pending_sum,
          SUM(CASE WHEN status = 'overdue' THEN "totalAmount" ELSE 0 END) as overdue_sum,
          SUM("electricityCost") as electricity_sum,
          SUM("waterCost") as water_sum,
          SUM("internetCost") as internet_sum,
          COUNT(*) as total_count
        FROM "UtilityBill"
      `,
      // Parking data in single query
      prisma.$queryRaw<{
        monthly_fee_sum: number | null,
        households_count: bigint,
        car_count: bigint,
        motorcycle_count: bigint,
        bicycle_count: bigint
      }[]>`
        SELECT 
          SUM("monthlyFee") as monthly_fee_sum,
          COUNT(DISTINCT "householdId") as households_count,
          SUM(CASE WHEN type = 'car' THEN 1 ELSE 0 END) as car_count,
          SUM(CASE WHEN type = 'motorcycle' THEN 1 ELSE 0 END) as motorcycle_count,
          SUM(CASE WHEN type = 'bicycle' THEN 1 ELSE 0 END) as bicycle_count
        FROM "ParkingSlot"
      `,
      // Monthly data (last 6 months) - optimized select
      prisma.payment.findMany({
        where: { dueDate: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
        select: { amount: true, status: true, dueDate: true }
      }),
      prisma.utilityBill.findMany({
        where: { dueDate: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
        select: { totalAmount: true, status: true, dueDate: true }
      }),
      // Category distribution
      prisma.feeCategory.findMany({ select: { name: true, amount: true, _count: { select: { payments: true } } } })
    ])

    // Extract counts (convert BigInt to Number)
    const c = counts[0]
    const totalHouseholds = Number(c.total_households)
    const activeHouseholds = Number(c.active_households)
    const totalResidents = Number(c.total_residents)
    const totalPayments = Number(c.total_payments)
    const pendingPayments = Number(c.pending_payments)
    const collectedPayments = Number(c.collected_payments)
    const overduePayments = Number(c.overdue_payments)
    const totalParkingSlots = Number(c.total_parking)
    const totalUtilityBills = Number(c.total_utilities)
    const pendingUtilityBills = Number(c.pending_utilities)
    const paidUtilityBills = Number(c.paid_utilities)
    const overdueUtilityBills = Number(c.overdue_utilities)

    // Payment aggregates
    const pa = paymentAggregates[0]
    const paymentsCollectedSum = Number(pa.collected_sum) || 0
    const paymentsPendingSum = Number(pa.pending_sum) || 0
    const paymentsOverdueSum = Number(pa.overdue_sum) || 0

    // Utility aggregates
    const ua = utilityAggregates[0]
    const utilitiesPaidSum = Number(ua.paid_sum) || 0
    const utilitiesPendingSum = Number(ua.pending_sum) || 0
    const utilitiesOverdueSum = Number(ua.overdue_sum) || 0
    const electricitySum = Number(ua.electricity_sum) || 0
    const waterSum = Number(ua.water_sum) || 0
    const internetSum = Number(ua.internet_sum) || 0
    const utilityCount = Number(ua.total_count)

    // Parking data
    const pd = parkingData[0] || { monthly_fee_sum: 0, households_count: 0, car_count: 0, motorcycle_count: 0, bicycle_count: 0 }
    const monthlyParkingRevenue = Number(pd.monthly_fee_sum) || 0
    const parkingHouseholdsCount = Number(pd.households_count)
    const occupiedParkingSlots = totalParkingSlots
    const availableParkingSlots = MAX_PARKING_SLOTS - totalParkingSlots

    // Initialize last 6 months
    const monthlyRevenue: { [key: string]: { collected: number, pending: number, overdue: number } } = {}
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      monthlyRevenue[date.toISOString().slice(0, 7)] = { collected: 0, pending: 0, overdue: 0 }
    }

    // Group payments by month
    recentPayments.forEach(p => {
      const key = p.dueDate.toISOString().slice(0, 7)
      if (monthlyRevenue[key]) {
        if (p.status === 'collected') monthlyRevenue[key].collected += p.amount
        else if (p.status === 'pending') monthlyRevenue[key].pending += p.amount
        else if (p.status === 'overdue') monthlyRevenue[key].overdue += p.amount
      }
    })

    // Group utilities by month
    recentUtilities.forEach(u => {
      const key = u.dueDate.toISOString().slice(0, 7)
      if (monthlyRevenue[key]) {
        if (u.status === 'paid') monthlyRevenue[key].collected += u.totalAmount
        else if (u.status === 'pending') monthlyRevenue[key].pending += u.totalAmount
        else if (u.status === 'overdue') monthlyRevenue[key].overdue += u.totalAmount
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
        // Add parking household data to overview
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
          electricity: { amount: electricitySum, count: utilityCount },
          water: { amount: waterSum, count: utilityCount },
          internet: { amount: internetSum, count: utilityCount },
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
          car: Number(pd.car_count),
          motorcycle: Number(pd.motorcycle_count),
          bicycle: Number(pd.bicycle_count)
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
    console.error('Get statistics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
