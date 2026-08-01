import React from "react"
import { Activity, Users, ShoppingBag, DollarSign } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم الرئيسية</h1>
        <p className="mt-2 text-muted-foreground">أهلاً بك في نظام إدارة منصة عسل.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
              <h3 className="text-2xl font-bold">0.00 ر.س</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الطلبات الجديدة</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-orange-500/10 p-3 text-orange-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">العملاء</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المنتجات النشطة</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">الأنشطة الأخيرة</h3>
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          لا توجد أنشطة مسجلة حتى الآن.
        </div>
      </div>
    </div>
  )
}
