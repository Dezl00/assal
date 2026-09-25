import { db as prisma } from '@/lib/db'
import { AnalyticsClient } from './analytics-client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const revalidate = 300

export default async function AnalyticsPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') redirect('/admin')

  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30))
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
  const yesterdayStart = new Date(new Date().setHours(0, 0, 0, 0))
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  const [visitsByDayRaw, todayVisitsCount, yesterdayVisitsCount, topCountriesRaw, topCitiesRaw, topPathsRaw, totalVisits] = await Promise.all([
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count 
      FROM "PageVisit" 
      WHERE "createdAt" >= ${thirtyDaysAgo}
      AND "country" NOT IN ('US', 'USA', 'United States', 'United States of America', 'us')
      GROUP BY DATE("createdAt") 
      ORDER BY date
    ` as Promise<{ date: Date, count: number }[]>,
    prisma.pageVisit.count({
      where: { createdAt: { gte: todayStart }, country: { notIn: ['US', 'USA', 'United States', 'United States of America', 'us'] } }
    }),
    prisma.pageVisit.count({
      where: { createdAt: { gte: yesterdayStart, lt: todayStart }, country: { notIn: ['US', 'USA', 'United States', 'United States of America', 'us'] } }
    }),
    prisma.pageVisit.groupBy({
      by: ['country'],
      where: { createdAt: { gte: thirtyDaysAgo }, country: { notIn: ['US', 'USA', 'United States', 'United States of America', 'us'] } },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    }),
    prisma.pageVisit.groupBy({
      by: ['city'],
      where: { createdAt: { gte: thirtyDaysAgo }, country: { notIn: ['US', 'USA', 'United States', 'United States of America', 'us'] } },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    }),
    prisma.pageVisit.groupBy({
      by: ['path'],
      where: { createdAt: { gte: thirtyDaysAgo }, country: { notIn: ['US', 'USA', 'United States', 'United States of America', 'us'] } },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    }),
    prisma.pageVisit.count({
      where: { createdAt: { gte: thirtyDaysAgo }, country: { notIn: ['US', 'USA', 'United States', 'United States of America', 'us'] } }
    })
  ])

  const [viewsByDayRaw, todayViewsCount, yesterdayViewsCount, topProductViewsRaw, totalViews] = await Promise.all([
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count 
      FROM "ProductView" 
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt") 
      ORDER BY date
    ` as Promise<{ date: Date, count: number }[]>,
    prisma.productView.count({
      where: { createdAt: { gte: todayStart } }
    }),
    prisma.productView.count({
      where: { createdAt: { gte: yesterdayStart, lt: todayStart } }
    }),
    prisma.productView.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 10,
    }),
    prisma.productView.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    })
  ])

  const productIds = topProductViewsRaw.map(v => v.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, images: { take: 1, select: { url: true } } }
  })
  
  const productMap = new Map(products.map(p => [p.id, p]))
  const topProducts = topProductViewsRaw.map(v => {
    const p = productMap.get(v.productId)
    return {
      count: v._count.productId,
      name: p?.name || 'منتج محذوف',
      image: p?.images?.[0]?.url || null
    }
  })

  // Group by day for charts
  const visitsByDay = visitsByDayRaw.reduce((acc: any, v) => {
    const d = v.date.toISOString().split('T')[0]
    acc[d] = Number(v.count)
    return acc
  }, {})

  const viewsByDay = viewsByDayRaw.reduce((acc: any, v) => {
    const d = v.date.toISOString().split('T')[0]
    acc[d] = Number(v.count)
    return acc
  }, {})

  const allDates = Array.from(new Set([...Object.keys(visitsByDay), ...Object.keys(viewsByDay)])).sort()
  const chartData = allDates.map(date => ({
    date,
    visits: visitsByDay[date] || 0,
    views: viewsByDay[date] || 0
  }))

  // Translation helpers
  const translateCountry = (c: string) => {
    const map: any = {
      'EG': 'مصر', 'Egypt': 'مصر',
      'SA': 'السعودية', 'Saudi Arabia': 'السعودية',
      'AE': 'الإمارات', 'United Arab Emirates': 'الإمارات',
      'KW': 'الكويت', 'Kuwait': 'الكويت',
      'QA': 'قطر', 'Qatar': 'قطر',
      'OM': 'عمان', 'Oman': 'عمان',
      'BH': 'البحرين', 'Bahrain': 'البحرين',
      'JO': 'الأردن', 'Jordan': 'الأردن',
      'MA': 'المغرب', 'Morocco': 'المغرب',
      'DZ': 'الجزائر', 'Algeria': 'الجزائر',
      'TN': 'تونس', 'Tunisia': 'تونس',
      'IQ': 'العراق', 'Iraq': 'العراق',
      'SD': 'السودان', 'Sudan': 'السودان',
      'YE': 'اليمن', 'Yemen': 'اليمن',
      'SY': 'سوريا', 'Syria': 'سوريا',
      'PS': 'فلسطين', 'Palestine': 'فلسطين',
      'LB': 'لبنان', 'Lebanon': 'لبنان',
      'LY': 'ليبيا', 'Libya': 'ليبيا',
    }
    return map[c] || c
  }

  const translateCity = (c: string) => {
    if (!c) return 'غير محدد'
    const map: any = {
      'Cairo': 'القاهرة', 'Alexandria': 'الإسكندرية', 'Giza': 'الجيزة',
      'Riyadh': 'الرياض', 'Jeddah': 'جدة', 'Mecca': 'مكة', 'Medina': 'المدينة',
      'Dubai': 'دبي', 'Abu Dhabi': 'أبوظبي', 'Sharjah': 'الشارقة',
      'Amman': 'عمان', 'Kuwait City': 'مدينة الكويت', 'Doha': 'الدوحة',
      'Manama': 'المنامة', 'Muscat': 'مسقط', 'Baghdad': 'بغداد',
      'Khartoum': 'الخرطوم', 'Damascus': 'دمشق', 'Beirut': 'بيروت',
      'Tanta': 'طنطا', 'Mansoura': 'المنصورة', 'Suez': 'السويس', 'Port Said': 'بورسعيد',
      'Ismailia': 'الإسماعيلية', 'Aswan': 'أسوان', 'Asyut': 'أسيوط', 'Sohag': 'سوهاج',
      'Minya': 'المنيا', 'Qena': 'قنا', 'Fayoum': 'الفيوم', 'Banha': 'بنها',
      'Damanhur': 'دمنهور', 'Zagazig': 'الالزقازيق', 'Ash Sharqiyah': 'الشرقية',
      'Dakahlia': 'الدقهلية', 'Gharbia': 'الغربية', 'Monufia': 'المنوفية',
      'Damietta': 'دمياط', 'Kafr El Sheikh': 'كفر الشيخ', 'Beni Suef': 'بني سويف',
      'Hurghada': 'الغردقة', 'Sharm El Sheikh': 'شرم الشيخ', 'Luxor': 'الأقصر',
      'Dammam': 'الدمام', 'Khobar': 'الخبر', 'Dhahran': 'الظهران', 'Al Ahsa': 'الأحساء',
      'Taif': 'الطائف', 'Tabuk': 'تبوك', 'Abha': 'أبها', 'Najran': 'نجران',
      'Jizan': 'جازان', 'Al Qassim': 'القصيم', 'Hail': 'حائل', 'Jubail': 'الجبيل',
      'unknown': 'غير محدد', 'Unknown': 'غير محدد', '(not set)': 'غير محدد',
    }
    for (const [en, ar] of Object.entries(map)) {
      if (c.toLowerCase() === en.toLowerCase()) return ar as string
    }
    const arabicRegex = /[\u0600-\u06FF]/;
    if (arabicRegex.test(c)) return c;
    return map[c] || c
  }

  const getPageName = (p: string) => {
    if (p === '/') return 'الرئيسية'
    if (p === '/products' || p.startsWith('/products?')) return 'جميع المنتجات'
    if (p === '/checkout') return 'إتمام الطلب'
    if (p === '/account') return 'حسابي'
    if (p.startsWith('/category/')) return 'قسم: ' + decodeURIComponent(p.split('/category/')[1].split('?')[0])
    if (p.startsWith('/department/')) return 'مجال: ' + decodeURIComponent(p.split('/department/')[1].split('?')[0])
    if (p.startsWith('/product/')) return 'منتج: ' + decodeURIComponent(p.split('/product/')[1].split('?')[0])
    if (p.startsWith('/search')) return 'نتائج البحث'
    if (p.startsWith('/brands')) return 'الماركات'
    return p
  }

  const topCountries = topCountriesRaw.map(c => ({
    name: translateCountry(c.country || 'غير محدد'),
    count: c._count.country
  }))

  const topCities = topCitiesRaw.map(c => ({
    name: translateCity(c.city || 'غير محدد'),
    count: c._count.city
  }))

  const topPages = topPathsRaw.map(p => ({
    path: getPageName(p.path || '/'),
    count: p._count.path
  }))

  return (
    <AnalyticsClient 
      chartData={chartData} 
      totalVisits={totalVisits} 
      totalViews={totalViews}
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
