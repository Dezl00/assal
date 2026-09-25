import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Cron job to clean up old analytics data.
 * Deletes PageVisit and ProductView records older than 90 days.
 * This prevents unbounded table growth that degrades DB performance.
 * 
 * Add to vercel.json: { "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const [deletedVisits, deletedViews] = await Promise.all([
      db.pageVisit.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } }
      }),
      db.productView.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } }
      })
    ])

    // Also clean up old activity logs (older than 180 days)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180)
    
    const deletedLogs = await db.activityLog.deleteMany({
      where: { createdAt: { lt: sixMonthsAgo } }
    })

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      deleted: {
        pageVisits: deletedVisits.count,
        productViews: deletedViews.count,
        activityLogs: deletedLogs.count,
      }
    })
  } catch (error) {
    console.error('Cleanup cron error:', error)
    return NextResponse.json({ success: false, error: 'Cleanup failed' }, { status: 500 })
  }
}
