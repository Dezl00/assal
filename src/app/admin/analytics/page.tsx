import { prisma } from '@/lib/prisma'
import { AnalyticsClient } from './analytics-client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') redirect('/admin')

  // Since it's sqlite/postgres, we can fetch all or group them
  const pageVisits = await prisma.pageVisit.findMany({
    where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
    select: { createdAt: true }
  })
  
  const productViews = await prisma.productView.findMany({
    where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
    select: { createdAt: true }
  })

  // To group by day (simple approach)
  const visitsByDay = pageVisits.reduce((acc: any, v) => {
    const d = v.createdAt.toISOString().split('T')[0]
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {})

  const viewsByDay = productViews.reduce((acc: any, v) => {
    const d = v.createdAt.toISOString().split('T')[0]
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {})

  const allDates = Array.from(new Set([...Object.keys(visitsByDay), ...Object.keys(viewsByDay)])).sort()
  
  const chartData = allDates.map(date => ({
    date,
    visits: visitsByDay[date] || 0,
    views: viewsByDay[date] || 0
  }))

  return <AnalyticsClient chartData={chartData} totalVisits={pageVisits.length} totalViews={productViews.length} />
}
