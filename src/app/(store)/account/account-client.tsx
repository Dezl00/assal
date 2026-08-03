"use client"

import React, { useState } from "react"
import { Package, User, MapPin, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { updateUserAccount } from "@/app/actions/user"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function AccountClient({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"orders" | "settings">("orders")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateUserAccount(formData)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("تم حفظ التعديلات بنجاح")
      // Clear password fields
      const form = e.target as HTMLFormElement
      const pwField = form.elements.namedItem('password') as HTMLInputElement
      const newPwField = form.elements.namedItem('newPassword') as HTMLInputElement
      if (pwField) pwField.value = ''
      if (newPwField) newPwField.value = ''
    }
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-start transition-colors ${
              activeTab === "orders" 
                ? "bg-primary/10 text-primary font-bold" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Package className="w-5 h-5" />
            طلباتي
          </button>
          
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-start transition-colors ${
              activeTab === "settings" 
                ? "bg-primary/10 text-primary font-bold" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <User className="w-5 h-5" />
            إعدادات الحساب
          </button>

          <div className="my-2 border-t border-border/50"></div>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-start text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8">
          
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">طلباتي السابقة</h2>
              {user.orders && user.orders.length > 0 ? (
                <div className="space-y-4">
                  {user.orders.map((order: any) => (
                    <div key={order.id} className="border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-bold">طلب #{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className="text-start sm:text-end">
                        <p className="font-bold text-primary">{order.totalAmount} ج.م</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                          order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                          order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {order.status === 'PENDING' ? 'قيد المراجعة' : 
                           order.status === 'DELIVERED' ? 'تم التوصيل' : order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-xl">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">ليس لديك أي طلبات سابقة حتى الآن.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">بيانات الحساب</h2>
              <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-border/50 pb-2">المعلومات الشخصية</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاسم الكامل</label>
                    <input name="name" type="text" defaultValue={user.name || ''} className="w-full h-12 px-4 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">البريد الإلكتروني</label>
                    <input type="email" defaultValue={user.email} disabled className="w-full h-12 px-4 bg-muted border border-border/50 rounded-xl opacity-70 cursor-not-allowed" />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-border/50 pb-2">بيانات التوصيل الأساسية</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم الهاتف</label>
                    <input name="phone" type="tel" dir="ltr" defaultValue={user.phone || ''} className="w-full h-12 px-4 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-right" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">العنوان</label>
                    <textarea name="address" defaultValue={user.address || ''} rows={3} className="w-full p-4 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none" />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-border/50 pb-2">الأمان وكلمة المرور</h3>
                  <p className="text-xs text-muted-foreground mb-4">اترك هذه الحقول فارغة إذا لم تكن ترغب بتغيير كلمة المرور الخاصة بك.</p>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">كلمة المرور الحالية</label>
                    <input name="password" type="password" className="w-full h-12 px-4 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">كلمة المرور الجديدة</label>
                    <input name="newPassword" type="password" className="w-full h-12 px-4 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-12 px-8 gold-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "حفظ التعديلات"}
                </Button>
              </form>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
