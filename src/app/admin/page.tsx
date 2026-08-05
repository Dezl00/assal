import React from "react"
import { Activity, Users, ShoppingBag, DollarSign } from "lucide-react"
import { db } from "@/lib/db"

export default async function AdminDashboardPage() {
  const [totalSalesResult, newOrders, customers, activeProducts, topProductsData, topPages, recentActivities, theme] = await Promise.all([
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } }
    }),
    db.order.count({
      where: { status: "PENDING" }
    }),
    db.user.count({
      where: { role: "CUSTOMER" }
    }),
    db.product.count(),
    db.productView.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5
    }),
    db.pageVisit.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 5
    }),
    db.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    }),
    db.themeConfig.findUnique({ where: { id: "default" } })
  ])

  // Get product details for topProducts
  const topProducts = await Promise.all(
    topProductsData.map(async (tp) => {
      const product = await db.product.findUnique({ where: { id: tp.productId }, select: { name: true } })
      return { ...tp, product: product || { name: 'منتج محذوف' } }
    })
  )

  const totalSales = totalSalesResult._sum.totalAmount || 0
  const adminColor = theme?.adminColor || "#0f172a"

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الرئيسية</h1>
        <p className="mt-2 text-muted-foreground">نظرة عامة على أداء المتجر والمبيعات.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border-0 p-6 shadow-md transition-all hover:scale-[1.02] bg-indigo-50 text-indigo-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-200 text-indigo-700 shadow-sm">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-800/80">إجمالي المبيعات</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{totalSales.toFixed(2)} ج.م</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-0 p-6 shadow-md transition-all hover:scale-[1.02] bg-emerald-50 text-emerald-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-200 text-emerald-700 shadow-sm">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800/80">الطلبات الجديدة</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{newOrders}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-0 p-6 shadow-md transition-all hover:scale-[1.02] bg-amber-50 text-amber-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-200 text-amber-700 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800/80">العملاء</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{customers}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-0 p-6 shadow-md transition-all hover:scale-[1.02] bg-rose-50 text-rose-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-200 text-rose-700 shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-rose-800/80">المنتجات النشطة</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{activeProducts}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Most Viewed Products */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold tracking-tight">المنتجات الأكثر مشاهدة</h3>
          <div className="flex flex-col gap-4">
            {topProducts.length > 0 ? topProducts.map((tv, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium">{tv.product.name}</span>
                <span className="text-sm font-bold text-muted-foreground bg-secondary/20 px-2 py-0.5 rounded">{tv._count.productId} مشاهدة</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات بعد</p>
            )}
          </div>
        </div>

        {/* Most Visited Pages */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold tracking-tight">الصفحات الأكثر زيارة</h3>
          <div className="flex flex-col gap-4">
            {topPages.length > 0 ? topPages.map((pv, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-left" dir="ltr">{pv.path}</span>
                <span className="text-sm font-bold text-muted-foreground bg-secondary/20 px-2 py-0.5 rounded">{pv._count.path} زيارة</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات بعد</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-8 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold tracking-tight">الأنشطة الإدارية الأخيرة</h3>
        <div className="flex flex-col gap-4">
          {recentActivities.length > 0 ? recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <div className="flex flex-col">
                <span className="font-medium">{activity.action} {activity.entityType}</span>
                {activity.details && <span className="text-sm text-muted-foreground">{(activity.details as any)?.message || JSON.stringify(activity.details)}</span>}
              </div>
              <div className="flex flex-col items-end text-sm text-muted-foreground">
                <span>{activity.user?.name || activity.user?.email || "مدير النظام"}</span>
                <span>{new Date(activity.createdAt).toLocaleString("ar-EG")}</span>
              </div>
            </div>
          )) : (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-background">
              <p className="text-sm text-muted-foreground">لا توجد أنشطة مسجلة حتى الآن.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
