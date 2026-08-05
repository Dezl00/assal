"use client"
import React, { useState } from "react"
import { Plus, Edit2, Trash2, Ticket, Settings, Save } from "lucide-react"
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
  const handleAddCoupon = async () => {
    const code = prompt("أدخل كود الخصم (مثال: SAVE20):")
    if (!code) return
    const typeStr = prompt("نوع الخصم (1=نسبة, 2=مبلغ ثابت, 3=شحن مجاني):", "1")
    if (!typeStr) return
    
    let type = "PERCENTAGE"
    if (typeStr === "2") type = "FIXED"
    if (typeStr === "3") type = "FREE_SHIPPING"

    const valueStr = prompt("قيمة الخصم (النسبة أو المبلغ):", "10")
    const value = parseFloat(valueStr || "0")

    const toastId = toast.loading("جاري الإضافة...")
    try {
      const res = await createCoupon({ code: code.toUpperCase(), type, value })
      setCoupons([res, ...coupons])
      toast.success("تم الإضافة بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  const handleUpdateCoupon = async (id: string, data: any) => {
    const toastId = toast.loading("جاري الحفظ...")
    try {
      const res = await updateCoupon(id, data)
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
            <Button onClick={handleAddCoupon} className="gap-2">
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
                      <input 
                        type="number" 
                        defaultValue={coupon.maxUses || ""}
                        placeholder="غير محدود"
                        className="w-20 bg-muted border border-border/50 rounded px-2 py-1 outline-none focus:border-primary text-center"
                        onBlur={(e) => {
                          const val = e.target.value ? parseInt(e.target.value) : null;
                          if (val !== coupon.maxUses) handleUpdateCoupon(coupon.id, { maxUses: val });
                        }}
                      />
                    </td>
                    <td className="px-4 py-4">{coupon.usedCount}</td>
                    <td className="px-4 py-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={coupon.isActive}
                          onChange={(e) => handleUpdateCoupon(coupon.id, { isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-medium">{coupon.isActive ? "فعال" : "معطل"}</span>
                      </label>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
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
    </div>
  )
}
