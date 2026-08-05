import { db as prisma } from '@/lib/db'
import { AnalyticsClient } from './analytics-client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') redirect('/admin')

  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30))
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
  const yesterdayStart = new Date(new Date().setHours(0, 0, 0, 0))
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  const pageVisits = await prisma.pageVisit.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, country: true, city: true, path: true }
  })
  
  const productViews = await prisma.productView.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    include: { product: { select: { id: true, name: true } } }
  })

  // Group by day for charts
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

  // Today and Yesterday Comparison
  const todayVisitsCount = pageVisits.filter(v => new Date(v.createdAt) >= todayStart).length
  const yesterdayVisitsCount = pageVisits.filter(v => new Date(v.createdAt) >= yesterdayStart && new Date(v.createdAt) < todayStart).length
  
  const todayViewsCount = productViews.filter(v => new Date(v.createdAt) >= todayStart).length
  const yesterdayViewsCount = productViews.filter(v => new Date(v.createdAt) >= yesterdayStart && new Date(v.createdAt) < todayStart).length

  // Top Products
  const productViewCounts = productViews.reduce((acc: any, v) => {
    const id = v.productId
    if (!acc[id]) acc[id] = { count: 0, name: v.product?.name || 'منتج محذوف' }
    acc[id].count += 1
    return acc
  }, {})

  const topProducts = Object.values(productViewCounts)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10)

  // Countries and Cities (using PageVisits as base)
  const countryCounts = pageVisits.reduce((acc: any, v) => {
    const c = v.country || 'غير محدد'
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  
  const cityCounts = pageVisits.reduce((acc: any, v) => {
    const c = v.city || 'غير محدد'
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})

  const topCountries = Object.entries(countryCounts)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topCities = Object.entries(cityCounts)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const pathCounts = pageVisits.reduce((acc: any, v) => {
    if (v.path) {
      acc[v.path] = (acc[v.path] || 0) + 1
    }
    return acc
  }, {})

  const topPages = Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return (
    <AnalyticsClient 
      chartData={chartData} 
      totalVisits={pageVisits.length} 
      totalViews={productViews.length}
      todayVisits={todayVisitsCount}
      yesterdayVisits={yesterdayVisitsCount}
      todayViews={todayViewsCount}
      yesterdayViews={yesterdayViewsCount}
      topProducts={topProducts}
      topCountries={topCountries}
      topCities={topCities}
      topPages={topPages}
    />
  )
}
