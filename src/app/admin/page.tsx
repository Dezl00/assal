import React from "react"
import { Activity, Users, ShoppingBag, DollarSign } from "lucide-react"
import { db } from "@/lib/db"

export default async function AdminDashboardPage() {
  const [totalSalesResult, newOrders, customers, activeProducts] = await Promise.all([
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
    db.product.count()
  ])

  const totalSales = totalSalesResult._sum.totalAmount || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الرئيسية</h1>
        <p className="mt-2 text-muted-foreground">نظرة عامة على أداء المتجر والمبيعات.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{totalSales.toFixed(2)} ر.س</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">الطلبات الجديدة</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{newOrders}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-orange-500/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">العملاء</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{customers}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-green-500/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">المنتجات النشطة</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{activeProducts}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-xl border border-border/50 bg-card p-8 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold tracking-tight">الأنشطة الأخيرة</h3>
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-background">
          <p className="text-sm text-muted-foreground">لا توجد أنشطة مسجلة حتى الآن.</p>
        </div>
      </div>
    </div>
  )
}
