"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createCoupon, updateCoupon } from "@/features/offers/actions"

export function CouponForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const isEditing = !!initialData

  const [form, setForm] = useState({
    code: initialData?.code || "",
    type: initialData?.type || "PERCENTAGE",
    value: initialData?.value || 10,
    maxUses: initialData?.maxUses || null,
    isActive: initialData?.isActive ?? true
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) {
      toast.error("يرجى إدخال كود الخصم")
      return
    }

    setIsSaving(true)
    const toastId = toast.loading(isEditing ? "جاري الحفظ..." : "جاري الإضافة...")
    try {
      if (isEditing) {
        await updateCoupon(initialData.id, form)
      } else {
        await createCoupon({ ...form, code: form.code.toUpperCase() })
      }
      toast.success("تم بنجاح", { id: toastId })
      router.push("/admin/offers")
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-border/50 pb-4">
        <Link href="/admin/offers" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowRight className="w-5 h-5 rtl-flip" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold">{isEditing ? "تعديل الكوبون" : "إضافة كوبون جديد"}</h2>
          <p className="text-sm text-muted-foreground">أدخل تفاصيل كود الخصم وإعداداته</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-card border border-border/50 rounded-xl p-6">
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">كود الخصم</label>
            <input 
              type="text" 
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full h-11 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none uppercase font-mono"
              placeholder="مثال: SAVE20"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">نوع الخصم</label>
              <select 
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full h-11 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="PERCENTAGE">نسبة مئوية (%)</option>
                <option value="FIXED">مبلغ ثابت (ج.م)</option>
                <option value="FREE_SHIPPING">شحن مجاني</option>
              </select>
            </div>

            {form.type !== "FREE_SHIPPING" && (
              <div>
                <label className="text-sm font-semibold mb-2 block">قيمة الخصم</label>
                <input 
                  type="number" 
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) })}
                  className="w-full h-11 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="مثال: 10"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">الحد الأقصى لمرات الاستخدام (اختياري)</label>
              <input 
                type="number" 
                value={form.maxUses || ""}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full h-11 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="غير محدود"
                min="1"
              />
            </div>
            
            <div className="flex flex-col justify-center">
              <label className="text-sm font-semibold mb-2 block">الحالة</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">{form.isActive ? "نشط وفعال" : "معطل"}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/50 flex gap-3">
          <Button type="submit" disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "جاري الحفظ..." : "حفظ الكوبون"}
          </Button>
          <Button type="button" onClick={() => router.push("/admin/offers")} variant="outline">
            إلغاء
          </Button>
        </div>

      </form>
    </div>
  )
}
