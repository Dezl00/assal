"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Eye, Trash2, User } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { deleteCustomer } from "@/features/customers/actions"

export function CustomersClient({ customers }: { customers: any[] }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)

  async function confirmDelete() {
    if (!customerToDelete) return
    const res = await deleteCustomer(customerToDelete)
    if (res.success) {
      toast.success("تم حذف العميل بنجاح")
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setCustomerToDelete(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">العملاء</h1>
          <p className="text-muted-foreground mt-1">إدارة بيانات العملاء وسجل طلباتهم.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-sm">
        <div className="flex items-center border-b border-border/50 p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث باسم العميل أو البريد..."
              className="h-10 w-full rounded-md border border-input bg-transparent pr-10 pl-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="border-b border-border/50 bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">البريد الإلكتروني</th>
                <th className="px-6 py-4 font-medium">عدد الطلبات</th>
                <th className="px-6 py-4 font-medium">تاريخ التسجيل</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    لا يوجد عملاء مسجلين حتى الآن.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-foreground">
                          {customer.name || "بدون اسم"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-800">
                        {customer._count?.orders || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => toast("تفاصيل العميل ستتوفر قريباً")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setCustomerToDelete(customer.id)
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
        title="حذف العميل"
        description="هل أنت متأكد من حذف حساب هذا العميل؟ سيتم حذف جميع بياناته."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
