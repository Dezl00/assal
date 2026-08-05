"use client"
import React, { useState } from "react"
import { Plus, Edit2, Trash2, Ticket, Settings, Save, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { updateCoupon, deleteCoupon, updateOfferSettings } from "@/features/offers/actions"

export function OffersClient({ initialCoupons, initialSettings }: any) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [settings, setSettings] = useState(initialSettings)
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null)

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

  const confirmDelete = async () => {
    if (!deleteModalOpen) return
    const id = deleteModalOpen
    const toastId = toast.loading("جاري الحذف...")
    try {
      await deleteCoupon(id)
      setCoupons(coupons.filter((c: any) => c.id !== id))
      toast.success("تم الحذف بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    } finally {
      setDeleteModalOpen(null)
    }
  }

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
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Coupons Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">كوبونات الخصم</h3>
              <p className="text-sm text-muted-foreground">أضف كوبونات وأكواد خصم لعملائك.</p>
            </div>
          </div>
          <Button asChild className="gap-2">
            <Link href="/admin/offers/new">
              <Plus className="w-4 h-4" />
              كوبون جديد
            </Link>
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
                  <td className="px-4 py-4 text-muted-foreground font-medium">
                    {coupon.maxUses === null ? "غير محدود" : coupon.maxUses}
                  </td>
                  <td className="px-4 py-4 font-medium">{coupon.usedCount}</td>
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
                      <Link href={`/admin/offers/${coupon.id}`} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => setDeleteModalOpen(coupon.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
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

      {/* Offer Settings Section */}
      <div className="space-y-6 pt-6 border-t border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">إعدادات العروض</h3>
            <p className="text-sm text-muted-foreground">إعدادات الشحن المجاني والنافذة المنبثقة</p>
          </div>
        </div>
        
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
                  className="w-full h-11 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
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
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="font-semibold text-sm">تفعيل النافذة المنبثقة</span>
              </label>

              {settings.promoPopupEnabled && (
                <div className="grid gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">تأخير الظهور (بالثواني)</label>
                    <input 
                      type="number" 
                      value={settings.promoPopupDelay || 3}
                      onChange={(e) => setSettings({ ...settings, promoPopupDelay: parseInt(e.target.value) })}
                      className="w-full h-11 bg-background border border-input rounded-md px-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">عنوان النافذة</label>
                    <input 
                      type="text" 
                      value={settings.promoPopupTitle || ""}
                      onChange={(e) => setSettings({ ...settings, promoPopupTitle: e.target.value })}
                      className="w-full h-11 bg-background border border-input rounded-md px-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">الوصف</label>
                    <textarea 
                      value={settings.promoPopupDescription || ""}
                      onChange={(e) => setSettings({ ...settings, promoPopupDescription: e.target.value })}
                      className="w-full h-24 bg-background border border-input rounded-md p-3 text-sm outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">كود الخصم المرتبط (اختياري)</label>
                    <input 
                      type="text" 
                      value={settings.promoPopupCode || ""}
                      onChange={(e) => setSettings({ ...settings, promoPopupCode: e.target.value })}
                      className="w-full h-11 bg-background border border-input rounded-md px-3 text-sm outline-none focus:border-primary uppercase"
                      placeholder="مثال: WELCOME20"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="gap-2 px-8">
              <Save className="w-4 h-4" />
              حفظ الإعدادات
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Custom Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border/50 overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">تأكيد الحذف</h3>
              <p className="text-sm text-muted-foreground">
                هل أنت متأكد أنك تريد حذف هذا الكوبون نهائياً؟ لا يمكن التراجع عن هذه الخطوة.
              </p>
            </div>
            <div className="flex border-t border-border/50">
              <button 
                onClick={() => setDeleteModalOpen(null)}
                className="flex-1 py-4 font-semibold text-muted-foreground hover:bg-muted/50 transition-colors border-l border-border/50"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
