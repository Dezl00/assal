"use client"

import React, { useState, useMemo } from "react"
import { Package, User, MapPin, LogOut, Phone, Shield, ChevronLeft, ArrowRight, Settings, Trash2 } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { updateUserAccount } from "@/app/actions/user"
import { Button } from "@/components/ui/button"
import { Loader2, Bell, CheckCircle2, Truck, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { registerServiceWorkerAndSubscribe, unsubscribeFromPush } from "@/lib/push-client"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ConfirmModal } from "@/components/ui/confirm-modal"

type Tab = "main" | "orders" | "addresses" | "settings" | "security" | "notifications"

export function AccountClient({ user, governorates }: { user: any, governorates: any[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("main")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(user.orderUpdatesEnabled || false)
  const [isUpdatingPush, setIsUpdatingPush] = useState(false)
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, action: null | (() => Promise<void>), title: string, desc: string, isDestructive: boolean, isLoading: boolean}>({
    isOpen: false, action: null, title: "", desc: "", isDestructive: true, isLoading: false
  });
  
  const [selectedGovId, setSelectedGovId] = useState("")
  const selectedGov = useMemo(() => governorates.find((g: any) => g.id === selectedGovId), [governorates, selectedGovId])

  // Find the most recent active order
  const activeOrder = useMemo(() => {
    if (!user.orders) return null;
    const active = user.orders.find((o: any) => o.status === 'PENDING' || o.status === 'PAID' || o.status === 'SHIPPED');
    return active || null;
  }, [user.orders]);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateUserAccount(formData)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("تم حفظ التعديلات بنجاح")
      const form = e.target as HTMLFormElement
      const pwField = form.elements.namedItem('password') as HTMLInputElement
      const newPwField = form.elements.namedItem('newPassword') as HTMLInputElement
      if (pwField) pwField.value = ''
      if (newPwField) newPwField.value = ''
    }
    setIsSubmitting(false)
  }

  const togglePushNotifications = async () => {
    setIsUpdatingPush(true)
    try {
      if (!pushEnabled) {
        const sub = await registerServiceWorkerAndSubscribe()
        if (sub) {
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
    setConfirmState({
      isOpen: true,
      title: "إلغاء الطلب",
      desc: "هل أنت متأكد من إلغاء هذا الطلب؟",
      isDestructive: true,
      isLoading: false,
      action: async () => {
        setConfirmState(p => ({ ...p, isLoading: true }));
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
        setConfirmState(p => ({ ...p, isOpen: false, isLoading: false }));
      }
    });
  }

  const handleDeleteAddress = async (addressId: string) => {
      const { deleteAddress } = await import('@/app/actions/address')
      try {
        await deleteAddress(addressId)
        toast.success("تم حذف العنوان بنجاح")
        window.location.reload()
      } catch(e) {
        toast.error("حدث خطأ أثناء الحذف")
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

  const tabs = [
    { id: "orders", label: "طلباتي", icon: Package },
    { id: "addresses", label: "العناوين", icon: MapPin },
    { id: "settings", label: "إعدادات الحساب", icon: User },
    { id: "security", label: "إعدادات الأمان", icon: Shield },
    { id: "notifications", label: "الإشعارات", icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto min-h-[70vh] flex flex-col md:flex-row gap-8 relative px-4 md:px-0">
      
      {/* Sidebar for Desktop */}
      <div className="hidden md:block w-72 shrink-0">
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-4 flex flex-col gap-2 shadow-sm sticky top-28">
          <div className="px-4 py-5 mb-4 flex items-center justify-between border-b border-border/50 bg-background/50 rounded-2xl">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">مرحباً بك،</p>
              <p className="font-bold text-xl text-foreground">{user.name?.split(' ')[0]}</p>
            </div>
            <button onClick={() => setActiveTab('notifications')} className="relative p-3 bg-card shadow-sm border border-border/50 rounded-full hover:scale-105 transition-transform active:scale-95">
              <Bell className="w-5 h-5 text-primary" />
              {pushEnabled && <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card"></span>}
            </button>
          </div>
          
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-start transition-all duration-300 ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-foreground' : 'text-primary/70'}`} />
              {tab.label}
            </button>
          ))}
          
          <div className="my-2 border-t border-border/50"></div>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-start text-destructive font-medium hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 md:bg-card/50 md:border md:border-border/50 md:rounded-3xl overflow-hidden relative">
        
        {/* Mobile Header / Greeting (Only visible on main menu in mobile) */}
        <AnimatePresence mode="wait">
          {activeTab === "main" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="md:hidden pb-10"
            >
              <div className="flex items-center justify-between mb-8 bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">مرحباً بك 👋</p>
                  <h1 className="text-2xl font-bold text-foreground">{user.name?.split(' ')[0] || 'ضيف'}</h1>
                </div>
                <button onClick={() => setActiveTab('notifications')} className="p-4 bg-background shadow-sm border border-border/50 rounded-full text-primary relative active:scale-95 transition-transform">
                  <Bell className="w-6 h-6" />
                  {pushEnabled && <span className="absolute top-3 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>}
                </button>
              </div>

              {/* Active Order Card */}
              {activeOrder && (
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 mb-8 shadow-sm relative overflow-hidden" onClick={() => setActiveTab('orders')}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <span className="text-primary font-bold text-xs bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      الطلب الحالي نشط
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">#{activeOrder.id.slice(-6).toUpperCase()}</span>
                  </div>
                  
                  <div className="flex gap-5 items-center relative z-10">
                    <div className="w-20 h-20 bg-background rounded-2xl border border-border/50 flex-shrink-0 overflow-hidden relative shadow-sm">
                      {activeOrder.items?.[0]?.product?.images?.[0]?.url ? (
                        <Image src={activeOrder.items[0].product.images[0].url} alt="" fill className="object-cover" />
                      ) : (
                        <Package className="w-10 h-10 m-auto mt-5 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-2">حالة الطلب:</p>
                      <p className="text-lg font-bold text-primary mb-3">
                        {activeOrder.status === 'PENDING' ? 'قيد المراجعة' : activeOrder.status === 'PAID' ? 'تم التأكيد' : activeOrder.status === 'SHIPPED' ? 'جاري الشحن' : 'مكتمل'}
                      </p>
                      <div className="relative pt-1 pb-1">
                        <div className="absolute top-3 left-2 right-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${(getStatusStep(activeOrder.status) / 4) * 100}%` }}></div>
                        </div>
                        <div className="relative flex justify-between">
                            {[1, 2, 3, 4].map((step) => (
                              <div key={step} className={`w-6 h-6 rounded-full flex items-center justify-center relative z-10 transition-colors shadow-sm ${getStatusStep(activeOrder.status) >= step ? 'bg-primary text-primary-foreground scale-110' : 'bg-background border border-border/50'}`}>
                                {getStatusStep(activeOrder.status) >= step && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Menu Grid */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg mb-4 px-2">القائمة الرئيسية</h3>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className="w-full flex items-center justify-between p-5 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <tab.icon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-foreground text-lg">{tab.label}</span>
                    </div>
                    <ChevronLeft className="w-6 h-6 text-muted-foreground/50" />
                  </button>
                ))}
                
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center justify-between p-5 bg-destructive/5 border border-destructive/10 rounded-2xl shadow-sm transition-all active:scale-[0.98] mt-6"
                >
                  <div className="flex items-center gap-5 text-destructive">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <LogOut className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg">تسجيل الخروج</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Tab Content (Desktop + Mobile overlay) */}
          {activeTab !== "main" && (
            <motion.div 
              key="content"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`md:p-8 min-h-full block`}
            >
              {/* Mobile Back Button */}
              <button 
                onClick={() => setActiveTab('main')} 
                className="md:hidden flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground font-bold bg-card border border-border/50 px-4 py-2 rounded-xl"
              >
                <ArrowRight className="w-5 h-5" />
                العودة للقائمة
              </button>

              <h2 className="text-3xl font-bold text-foreground mb-10 flex items-center gap-4">
                {tabs.find(t => t.id === activeTab)?.icon && React.createElement(tabs.find(t => t.id === activeTab)!.icon, { className: "w-8 h-8 text-primary p-1.5 bg-primary/10 rounded-xl" })}
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>

              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  {user.orders && user.orders.length > 0 ? (
                    user.orders.map((order: any) => (
                      <div key={order.id} className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-border/50 pb-6 gap-4">
                          <div>
                            <Link href={`/account/orders/${order.id}`} className="font-bold text-xl hover:text-primary transition-colors flex items-center gap-2">
                              طلب #{order.id.slice(-6).toUpperCase()}
                            </Link>
                            <p className="text-sm text-muted-foreground font-medium mt-2" dir="ltr">
                              {new Date(order.createdAt).toLocaleDateString('en-GB')} • {new Date(order.createdAt).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="text-right sm:text-left w-full sm:w-auto">
                            <p className="font-black text-primary text-2xl" dir="ltr">{order.totalAmount} ج.م</p>
                            {(order.status === 'PENDING' || order.status === 'PAID') && (
                              <button 
                                onClick={() => cancelOrder(order.id)}
                                className="text-sm font-bold text-destructive hover:bg-destructive/10 px-4 py-2 rounded-full transition-colors mt-3 border border-destructive/20 w-full sm:w-auto"
                              >
                                إلغاء الطلب
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Timeline */}
                        {order.status !== 'CANCELLED' ? (
                          <div className="relative pt-2 pb-4 px-4 sm:px-10 mt-6">
                            <div className="absolute top-6 left-10 right-10 h-2 bg-muted rounded-full overflow-hidden">
                               <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${(getStatusStep(order.status) / 4) * 100}%` }}></div>
                            </div>
                            <div className="relative flex justify-between">
                               {[
                                 { step: 1, label: 'مراجعة', icon: Clock },
                                 { step: 2, label: 'تأكيد', icon: CheckCircle2 },
                                 { step: 3, label: 'شحن', icon: Truck },
                                 { step: 4, label: 'مكتمل', icon: CheckCircle2 }
                               ].map((s) => (
                                 <div key={s.step} className="flex flex-col items-center gap-3">
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors shadow-sm ${getStatusStep(order.status) >= s.step ? 'bg-primary text-primary-foreground scale-110' : 'bg-card border-2 border-muted-foreground/20 text-muted-foreground'}`}>
                                     <s.icon className="w-5 h-5" />
                                   </div>
                                   <span className={`text-[13px] font-bold ${getStatusStep(order.status) >= s.step ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
                                 </div>
                               ))}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full text-center py-4 bg-destructive/10 text-destructive font-bold text-base rounded-2xl flex items-center justify-center gap-2">
                            <XCircle className="w-6 h-6" />
                            تم إلغاء هذا الطلب
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-card border border-border/50 rounded-3xl shadow-sm">
                      <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                      <p className="text-foreground font-bold text-xl mb-2">ليس لديك أي طلبات سابقة</p>
                      <p className="text-muted-foreground mb-8">قم بتصفح المتجر وإضافة بعض المنتجات الرائعة لسلتك!</p>
                      <Button asChild className="h-14 rounded-full px-10 gold-gradient text-white shadow-lg hover:shadow-xl transition-shadow text-lg">
                        <Link href="/products">تصفح المنتجات</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <form onSubmit={handleUpdate} className="space-y-8 max-w-xl">
                  <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground px-1">الاسم الكامل</label>
                      <input name="name" type="text" defaultValue={user.name || ''} className="w-full h-14 px-5 bg-muted/30 border border-border/50 rounded-2xl focus:bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-base" />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground px-1">البريد الإلكتروني</label>
                      <input name="email" type="email" defaultValue={user.email || ''} className="w-full h-14 px-5 bg-muted/30 border border-border/50 rounded-2xl focus:bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-base" dir="ltr" />
                    </div>
                  </div>

                  <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-muted-foreground px-1">رقم الهاتف الأساسي (الخاص بالتسجيل)</label>
                      <input type="tel" dir="ltr" defaultValue={user.phone || ''} disabled className="w-full h-14 px-5 bg-muted border border-border/50 rounded-2xl opacity-70 cursor-not-allowed text-right text-base font-medium" />
                      <p className="text-xs text-muted-foreground px-1 mt-2">لا يمكن تغيير رقم الهاتف الأساسي من هنا. تواصل مع الدعم لتغييره.</p>
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 gold-gradient text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 text-lg">
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "حفظ التعديلات"}
                  </Button>
                </form>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <form onSubmit={handleUpdate} className="space-y-8 max-w-xl">
                  <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 text-muted-foreground mb-6 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <Shield className="w-6 h-6 text-primary flex-shrink-0" />
                      <p className="text-sm font-medium">اترك الحقول فارغة إذا لم تكن ترغب بتغيير كلمة المرور الخاصة بك.</p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground px-1">كلمة المرور الحالية</label>
                      <input name="password" type="password" className="w-full h-14 px-5 bg-muted/30 border border-border/50 rounded-2xl focus:bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-base" />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground px-1">كلمة المرور الجديدة</label>
                      <input name="newPassword" type="password" className="w-full h-14 px-5 bg-muted/30 border border-border/50 rounded-2xl focus:bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-base" />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 gold-gradient text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 text-lg">
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "تحديث إعدادات الأمان"}
                  </Button>
                </form>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="max-w-xl space-y-6">
                  <div className="flex items-center justify-between p-6 sm:p-8 bg-card rounded-3xl border border-border/50 shadow-sm">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl ${pushEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Bell className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-lg text-foreground">إشعارات المتصفح والطلبات</p>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                        تلقي تحديثات فورية بصوت على متصفحك الحالي عندما تتغير حالة طلبك أو تصلك رسالة هامة.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={togglePushNotifications}
                      disabled={isUpdatingPush}
                      className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${pushEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`pointer-events-none block h-8 w-8 rounded-full bg-white shadow-lg ring-0 transition-transform ${pushEnabled ? '-translate-x-10' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  {user.addresses && user.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.addresses.map((address: any) => (
                        <div key={address.id} className={`p-5 rounded-3xl border-2 transition-all ${address.isDefault ? 'border-primary bg-primary/5' : 'border-border/50 bg-card hover:border-primary/50'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-5 h-5 ${address.isDefault ? 'text-primary' : 'text-muted-foreground'}`} />
                              <h3 className="font-bold text-lg">{address.title}</h3>
                            </div>
                            {address.isDefault && (
                              <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-full">الافتراضي</span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-1">{address.address}</p>
                          <p className="text-muted-foreground text-sm font-bold mb-4" dir="ltr">{address.phone}</p>
                          <div className="flex gap-2">
                            {!address.isDefault && (
                              <button 
                                onClick={async () => {
                                  const { setDefaultAddress } = await import('@/app/actions/address')
                                  await setDefaultAddress(address.id)
                                }}
                                className="flex-1 text-xs font-bold border border-border/50 hover:bg-muted py-2 rounded-xl transition-colors"
                              >
                                تعيين كافتراضي
                              </button>
                            )}
                            <button 
                              onClick={async () => {
                                if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;
                                const { deleteAddress } = await import('@/app/actions/address')
                                await deleteAddress(address.id)
                              }}
                              className="text-xs font-bold text-destructive border border-destructive/20 hover:bg-destructive/10 px-3 py-2 rounded-xl transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-card border border-border/50 rounded-3xl shadow-sm">
                      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                      <p className="text-foreground font-bold text-xl mb-1">لا يوجد عناوين محفوظة</p>
                      <p className="text-muted-foreground text-sm">أضف عنوانك الآن لتسهيل عملية الطلب لاحقاً.</p>
                    </div>
                  )}

                  <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm mt-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MapPin className="w-6 h-6 text-primary" /> إضافة عنوان جديد</h3>
                    <form action={async (formData) => {
                      const { addAddress } = await import('@/app/actions/address')
                      const res = await addAddress(formData)
                      if (res.error) toast.error(res.error)
                      else {
                        toast.success('تمت الإضافة بنجاح')
                        ;(document.getElementById('add-address-form') as HTMLFormElement)?.reset()
                      }
                    }} id="add-address-form" className="space-y-4 max-w-xl">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">اسم العنوان (مثال: المنزل، العمل)</label>
                        <input name="title" required type="text" className="w-full h-12 px-4 bg-muted/30 border border-border/50 rounded-xl focus:bg-background focus:ring-2 focus:ring-primary outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">رقم التواصل للطلب</label>
                        <input 
                          name="phone" 
                          required 
                          type="tel" 
                          dir="ltr"
                          pattern="^01[0-9]{9}$"
                          maxLength={11}
                          placeholder="01XXXXXXXXX"
                          className="w-full h-12 px-4 bg-muted/30 border border-border/50 rounded-xl focus:bg-background focus:ring-2 focus:ring-primary outline-none text-right" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-foreground">المحافظة</label>
                          <select 
                            name="governorate" 
                            required 
                            value={selectedGov?.name || ""}
                            onChange={(e) => {
                              const gov = governorates.find((g: any) => g.name === e.target.value)
                              if (gov) setSelectedGovId(gov.id)
                            }}
                            className="w-full h-12 px-4 bg-muted/30 border border-border/50 rounded-xl focus:bg-background focus:ring-2 focus:ring-primary outline-none"
                          >
                            <option value="" disabled>اختر المحافظة...</option>
                            {governorates.map((g: any) => (
                              <option key={g.id} value={g.name}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-foreground">المدينة</label>
                          <select 
                            name="city" 
                            required 
                            disabled={!selectedGov || selectedGov.hideCities}
                            className="w-full h-12 px-4 bg-muted/30 border border-border/50 rounded-xl focus:bg-background focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                          >
                            <option value="" disabled>اختر المدينة...</option>
                            {selectedGov?.cities?.map((c: any) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">العنوان بالتفصيل</label>
                        <textarea name="address" required rows={3} className="w-full p-4 bg-muted/30 border border-border/50 rounded-xl focus:bg-background focus:ring-2 focus:ring-primary outline-none resize-none" />
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" name="isDefault" value="true" id="isDefaultAddr" className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary" />
                        <label htmlFor="isDefaultAddr" className="text-sm font-bold cursor-pointer">تعيين كعنوان افتراضي</label>
                      </div>
                      <Button type="submit" className="w-full sm:w-auto h-12 px-8 gold-gradient text-white font-bold rounded-xl mt-4">
                        إضافة العنوان
                      </Button>
                    </form>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.desc}
        isDestructive={confirmState.isDestructive}
        isLoading={confirmState.isLoading}
        onConfirm={() => confirmState.action && confirmState.action()}
        onCancel={() => setConfirmState(p => ({ ...p, isOpen: false }))}
      />
    </div>
  )
}
