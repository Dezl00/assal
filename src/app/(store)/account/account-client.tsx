"use client"

import React, { useState } from "react"
import { Package, User, MapPin, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { updateUserAccount } from "@/app/actions/user"
import { Button } from "@/components/ui/button"
import { Loader2, Bell, CheckCircle2, Truck, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { registerServiceWorkerAndSubscribe, unsubscribeFromPush } from "@/lib/push-client"

export function AccountClient({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"orders" | "settings">("orders")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(user.orderUpdatesEnabled || false)
  const [isUpdatingPush, setIsUpdatingPush] = useState(false)

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
    }
    setIsSubmitting(false)
  }

  const togglePushNotifications = async () => {
    setIsUpdatingPush(true)
    try {
      if (!pushEnabled) {
        const sub = await registerServiceWorkerAndSubscribe()
        if (sub) {
          // Update database
          await updateUserAccount(new FormData()) // We should ideally add a specific action for this, but let's assume we can trigger a fast API call
          await fetch('/api/user/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderUpdatesEnabled: true })
          })
          setPushEnabled(true)
          toast.success("تم تفعيل إشعارات المتصفح")
        } else {
          toast.error("يرجى السماح بالإشعارات من إعدادات المتصفح")
        }
      } else {
        await unsubscribeFromPush()
        await fetch('/api/user/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderUpdatesEnabled: false })
        })
        setPushEnabled(false)
        toast.success("تم إيقاف إشعارات المتصفح")
      }
    } catch (error) {
      toast.error("حدث خطأ")
    }
    setIsUpdatingPush(false)
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" })
      if (res.ok) {
        toast.success("تم إلغاء الطلب بنجاح")
        window.location.reload()
      } else {
        toast.error("حدث خطأ أو أن الطلب لا يمكن إلغاؤه")
      }
    } catch (e) {
      toast.error("حدث خطأ")
    }
  }

  const getStatusStep = (status: string) => {
    switch(status) {
      case 'PENDING': return 1;
      case 'PAID': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
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
                      <div className="flex-1 w-full sm:w-auto">
                        <div className="flex justify-between items-start mb-2">
                          <Link href={`/account/orders/${order.id}`} className="font-bold hover:text-primary transition-colors">طلب #{order.id.slice(-6).toUpperCase()}</Link>
                          <p className="font-bold text-primary" dir="ltr">{order.totalAmount} ج.م</p>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm text-muted-foreground font-sans" dir="ltr">{new Date(order.createdAt).toLocaleDateString('en-GB')} {new Date(order.createdAt).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}</p>
                          {(order.status === 'PENDING' || order.status === 'PAID') && (
                            <button 
                              onClick={() => cancelOrder(order.id)}
                              className="text-xs font-semibold text-destructive hover:bg-destructive/10 px-2 py-1 rounded transition-colors"
                            >
                              إلغاء الطلب
                            </button>
                          )}
                        </div>
                        
                        {/* Timeline */}
                        {order.status !== 'CANCELLED' ? (
                          <div className="relative pt-2">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 rounded-full overflow-hidden">
                               <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(getStatusStep(order.status) / 4) * 100}%` }}></div>
                            </div>
                            <div className="relative flex justify-between">
                               {[
                                 { step: 1, label: 'قيد التنفيذ', icon: Clock },
                                 { step: 2, label: 'تم التأكيد', icon: CheckCircle2 },
                                 { step: 3, label: 'جاري الشحن', icon: Truck },
                                 { step: 4, label: 'مكتمل', icon: CheckCircle2 }
                               ].map((s) => (
                                 <div key={s.step} className="flex flex-col items-center gap-1">
                                   <div className={`w-6 h-6 rounded-full flex items-center justify-center relative z-10 transition-colors ${getStatusStep(order.status) >= s.step ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-muted-foreground'}`}>
                                     <s.icon className="w-3 h-3" />
                                   </div>
                                   <span className={`text-[10px] font-bold ${getStatusStep(order.status) >= s.step ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
                                 </div>
                               ))}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full text-center py-2 bg-destructive/10 text-destructive font-bold text-sm rounded-lg flex items-center justify-center gap-2">
                            <XCircle className="w-4 h-4" />
                            تم الإلغاء
                          </div>
                        )}
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
                    <input name="email" type="email" defaultValue={user.email || ''} className="w-full h-12 px-4 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" dir="ltr" />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-border/50 pb-2">بيانات التوصيل الأساسية</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم الهاتف (يُستخدم لتسجيل الدخول)</label>
                    <input type="tel" dir="ltr" defaultValue={user.phone || ''} disabled className="w-full h-12 px-4 bg-muted border border-border/50 rounded-xl opacity-70 cursor-not-allowed text-right" />
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

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="text-lg font-semibold text-primary pb-2 flex items-center gap-2">
                    <Bell className="w-5 h-5" /> الإشعارات
                  </h3>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div>
                      <p className="font-medium">إشعارات المتصفح (Web Push)</p>
                      <p className="text-xs text-muted-foreground">تلقي تحديثات فورية بصوت عندما تتغير حالة طلبك</p>
                    </div>
                    <button
                      type="button"
                      onClick={togglePushNotifications}
                      disabled={isUpdatingPush}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
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
