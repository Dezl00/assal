"use client"
import React, { useState } from "react"
import { Plus, Edit2, Trash2, Ticket, Settings, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  createCoupon, updateCoupon, deleteCoupon, updateOfferSettings
} from "@/features/offers/actions"

export function OffersClient({ initialCoupons, initialSettings }: any) {
  const [activeTab, setActiveTab] = useState<'coupons' | 'settings'>('coupons')
  const [coupons, setCoupons] = useState(initialCoupons)
  const [settings, setSettings] = useState(initialSettings)

  // -- Coupon Handlers --
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "PERCENTAGE",
    value: 10,
    maxUses: null as number | null
  })

  const openCouponSidebar = (coupon?: any) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setCouponForm({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        maxUses: coupon.maxUses
      })
    } else {
      setEditingCoupon(null)
      setCouponForm({
        code: "",
        type: "PERCENTAGE",
        value: 10,
        maxUses: null
      })
    }
    setIsSidebarOpen(true)
  }

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponForm.code.trim()) {
      toast.error("يرجى إدخال كود الخصم")
      return
    }

    const toastId = toast.loading(editingCoupon ? "جاري الحفظ..." : "جاري الإضافة...")
    try {
      if (editingCoupon) {
        const res = await updateCoupon(editingCoupon.id, couponForm)
        setCoupons(coupons.map((c: any) => c.id === editingCoupon.id ? res : c))
      } else {
        const res = await createCoupon({ ...couponForm, code: couponForm.code.toUpperCase() })
        setCoupons([res, ...coupons])
      }
      toast.success("تم بنجاح", { id: toastId })
      setIsSidebarOpen(false)
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  const handleUpdateCouponStatus = async (id: string, isActive: boolean) => {
    const toastId = toast.loading("جاري الحفظ...")
    try {
      const res = await updateCoupon(id, { isActive })
      setCoupons(coupons.map((c: any) => c.id === id ? res : c))
      toast.success("تم الحفظ بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return
    const toastId = toast.loading("جاري الحذف...")
    try {
      await deleteCoupon(id)
      setCoupons(coupons.filter((c: any) => c.id !== id))
      toast.success("تم الحذف بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  // -- Settings Handlers --
  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const toastId = toast.loading("جاري الحفظ...")
    try {
      await updateOfferSettings(settings)
      toast.success("تم حفظ الإعدادات بنجاح", { id: toastId })
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ", { id: toastId })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex-1 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'coupons' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Ticket className="w-4 h-4" />
            كوبونات الخصم
          </div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'settings' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Settings className="w-4 h-4" />
            إعدادات العروض (الشحن والمنبثقة)
          </div>
        </button>
      </div>

      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/50">
            <div>
              <h3 className="font-bold">كوبونات الخصم</h3>
              <p className="text-sm text-muted-foreground">أضف كوبونات وأكواد خصم لعملائك.</p>
            </div>
            <Button onClick={() => openCouponSidebar()} className="gap-2">
              <Plus className="w-4 h-4" />
              كوبون جديد
            </Button>
          </div>

          <div className="overflow-x-auto bg-card border border-border/50 rounded-xl">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 rounded-tr-xl">كود الخصم</th>
                  <th className="px-4 py-3">النوع</th>
                  <th className="px-4 py-3">القيمة</th>
                  <th className="px-4 py-3">حد الاستخدام</th>
                  <th className="px-4 py-3">مرات الاستخدام</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3 rounded-tl-xl w-24 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon: any) => (
                  <tr key={coupon.id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="px-4 py-4 font-bold text-primary" dir="ltr">{coupon.code}</td>
                    <td className="px-4 py-4">
                      <span className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded text-xs font-semibold">
                        {coupon.type === "PERCENTAGE" ? "نسبة مئوية %" : coupon.type === "FIXED" ? "مبلغ ثابت" : "شحن مجاني"}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold">{coupon.value} {coupon.type === "PERCENTAGE" ? "%" : "ج.م"}</td>
                    <td className="px-4 py-4">
                      {coupon.maxUses === null ? "غير محدود" : coupon.maxUses}
                    </td>
                    <td className="px-4 py-4">{coupon.usedCount}</td>
                    <td className="px-4 py-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={coupon.isActive}
                          onChange={(e) => handleUpdateCouponStatus(coupon.id, e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-medium">{coupon.isActive ? "فعال" : "معطل"}</span>
                      </label>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openCouponSidebar(coupon)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">لا توجد كوبونات خصم.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">إعدادات الشحن المجاني</h3>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-semibold">حد الشحن المجاني (ج.م)</label>
                <input 
                  type="number" 
                  value={settings.freeShippingThreshold || ""}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="اتركه فارغاً لتعطيل الميزة. مثال: 500"
                />
                <p className="text-xs text-muted-foreground">سيتم احتساب الشحن مجاناً إذا تجاوز إجمالي الطلب هذا المبلغ.</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">إعدادات النافذة المنبثقة للعروض (Promo Popup)</h3>
            <div className="space-y-4 max-w-xl">
              
              <label className="flex items-center gap-2 cursor-pointer bg-muted/30 p-3 rounded-lg border border-border/50">
                <input 
                  type="checkbox" 
                  checked={settings.promoPopupEnabled || false}
                  onChange={(e) => setSettings({ ...settings, promoPopupEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <span className="font-bold">تفعيل النافذة المنبثقة الترحيبية للزوار</span>
              </label>

              {settings.promoPopupEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">تأخير الظهور (بالثواني)</label>
                    <input 
                      type="number" 
                      value={settings.promoPopupDelay || 10}
                      onChange={(e) => setSettings({ ...settings, promoPopupDelay: parseInt(e.target.value) })}
                      className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">عنوان النافذة</label>
                    <input 
                      type="text" 
                      value={settings.promoPopupTitle || ""}
                      onChange={(e) => setSettings({ ...settings, promoPopupTitle: e.target.value })}
                      placeholder="مثال: خصم خاص لك!"
                      className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">كود الخصم المراد ترويجه</label>
                    <input 
                      type="text" 
                      value={settings.promoPopupCode || ""}
                      onChange={(e) => setSettings({ ...settings, promoPopupCode: e.target.value.toUpperCase() })}
                      placeholder="مثال: WELCOME10"
                      dir="ltr"
                      className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none text-right"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">نص وصفي للنافذة</label>
                    <textarea 
                      value={settings.promoPopupDescription || ""}
                      onChange={(e) => setSettings({ ...settings, promoPopupDescription: e.target.value })}
                      placeholder="استخدم الكود للحصول على خصم مميز على طلبك الأول..."
                      rows={3}
                      className="w-full bg-background border border-input rounded-md p-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button type="submit" className="gap-2 px-8">
              <Save className="w-4 h-4" />
              حفظ الإعدادات
            </Button>
          </div>
        </form>
      )}
      {/* Sliding Sidebar for Coupon Form */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 md:right-72 w-96 max-w-[calc(100vw-2rem)] bg-card border-l border-border/50 shadow-2xl z-50 p-6 flex flex-col animate-in slide-in-from-right-1/2">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
              <h2 className="text-xl font-bold">{editingCoupon ? "تعديل الكوبون" : "كوبون جديد"}</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-muted-foreground hover:bg-muted p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCoupon} className="flex-1 overflow-y-auto space-y-4 px-1">
              <div className="space-y-2">
                <label className="text-sm font-semibold">كود الخصم</label>
                <input 
                  type="text" 
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none uppercase font-mono"
                  placeholder="مثال: SAVE20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">نوع الخصم</label>
                <select 
                  value={couponForm.type}
                  onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                  className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="PERCENTAGE">نسبة مئوية (%)</option>
                  <option value="FIXED">مبلغ ثابت (ج.م)</option>
                  <option value="FREE_SHIPPING">شحن مجاني</option>
                </select>
              </div>

              {couponForm.type !== "FREE_SHIPPING" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold">قيمة الخصم</label>
                  <input 
                    type="number" 
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: parseFloat(e.target.value) })}
                    className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="مثال: 10"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold">الحد الأقصى لمرات الاستخدام</label>
                <input 
                  type="number" 
                  value={couponForm.maxUses || ""}
                  onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="اتركه فارغاً للاستخدام غير المحدود"
                  min="1"
                />
              </div>
            </form>

            <div className="pt-4 border-t border-border/50 mt-4 flex gap-2">
              <Button onClick={handleSaveCoupon} className="flex-1 gap-2">
                <Save className="w-4 h-4" />
                حفظ
              </Button>
              <Button onClick={() => setIsSidebarOpen(false)} variant="outline" className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
