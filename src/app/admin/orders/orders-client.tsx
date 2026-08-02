"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Eye, Trash2, Box } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { updateOrderStatus, deleteOrder } from "@/features/orders/actions"

export function OrdersClient({ orders }: { orders: any[] }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  
  // Status dictionary for arabic translation
  const statusLabels: Record<string, string> = {
    "PENDING": "قيد التنفيذ",
    "PAID": "تم الدفع",
    "SHIPPED": "تم الشحن",
    "CANCELLED": "ملغي"
  }
  
  const statusColors: Record<string, string> = {
    "PENDING": "bg-yellow-100 text-yellow-800",
    "PAID": "bg-blue-100 text-blue-800",
    "SHIPPED": "bg-green-100 text-green-800",
    "CANCELLED": "bg-red-100 text-red-800"
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    const res = await updateOrderStatus(orderId, newStatus)
    if (res.success) {
      toast.success("تم تحديث حالة الطلب بنجاح")
    } else {
      toast.error(res.error || "حدث خطأ أثناء التحديث")
    }
  }

  async function confirmDelete() {
    if (!orderToDelete) return
    const res = await deleteOrder(orderToDelete)
    if (res.success) {
      toast.success("تم حذف الطلب بنجاح")
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setOrderToDelete(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الطلبات</h1>
          <p className="text-muted-foreground mt-1">إدارة طلبات العملاء وحالات الشحن.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-sm">
        <div className="flex items-center border-b border-border/50 p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث برقم الطلب..."
              className="h-10 w-full rounded-md border border-input bg-transparent pr-10 pl-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="border-b border-border/50 bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">رقم الطلب</th>
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">الإجمالي</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    لا توجد طلبات حتى الآن.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {order.user?.name || order.user?.email || "عميل غير مسجل"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {order.totalAmount.toFixed(2)} ج.م
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full appearance-none cursor-pointer outline-none ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {Object.entries(statusLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => toast("تفاصيل الطلب ستتوفر قريباً")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setOrderToDelete(order.id)
                            setDeleteModalOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف الطلب"
        description="هل أنت متأكد من حذف هذا الطلب بشكل نهائي؟"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
