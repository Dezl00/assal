"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageUploader } from "@/components/ui/image-uploader"
import { toast } from "sonner"
import { Save, ArrowRight, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import { createEmployeeOfTheMonth, updateEmployeeOfTheMonth, deleteEmployeeOfTheMonth } from "@/features/employees-of-the-month/actions"
import { ConfirmModal } from "@/components/ui/confirm-modal"

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
]

export function EmployeeEditorClient({ initialEmployee }: { initialEmployee?: any }) {
  const router = useRouter()
  const isEditing = !!initialEmployee

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  const [name, setName] = useState(initialEmployee?.name || "")
  const [jobTitle, setJobTitle] = useState(initialEmployee?.jobTitle || "")
  const [imageUrl, setImageUrl] = useState(initialEmployee?.imageUrl || "")
  const [month, setMonth] = useState<number>(initialEmployee?.month || new Date().getMonth() + 1)
  const [year, setYear] = useState<number>(initialEmployee?.year || currentYear)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  async function handleSave() {
    if (!name.trim()) return toast.error("يرجى إدخال اسم الموظف")
    if (!jobTitle.trim()) return toast.error("يرجى إدخال المسمى الوظيفي")
    if (!imageUrl) return toast.error("يرجى اختيار صورة الموظف")

    setIsSaving(true)
    try {
      const data = { name, jobTitle, imageUrl, month, year }
      
      let res
      if (isEditing) {
        res = await updateEmployeeOfTheMonth(initialEmployee.id, data)
      } else {
        res = await createEmployeeOfTheMonth(data)
      }

      if (res?.success) {
        toast.success(isEditing ? "تم تحديث بيانات الموظف" : "تم إضافة الموظف بنجاح")
        router.push("/admin/employees-of-the-month")
      } else {
        toast.error(res?.error || "حدث خطأ غير معروف")
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحفظ")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!initialEmployee) return
    setIsDeleting(true)
    try {
      const res = await deleteEmployeeOfTheMonth(initialEmployee.id)
      if (res?.success) {
        toast.success("تم حذف الموظف بنجاح")
        router.push("/admin/employees-of-the-month")
      } else {
        toast.error(res?.error || "حدث خطأ غير معروف")
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحذف")
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/employees-of-the-month">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5 rtl-flip" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isEditing ? "تعديل موظف الشهر" : "إضافة موظف جديد"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <>
              <Button variant="destructive" className="gap-2" onClick={() => setIsConfirmOpen(true)} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                حذف
              </Button>
              <ConfirmModal
                isOpen={isConfirmOpen}
                title="تأكيد الحذف"
                description="هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء."
                onConfirm={handleDelete}
                onCancel={() => setIsConfirmOpen(false)}
                isLoading={isDeleting}
              />
            </>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ البيانات
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">اسم الموظف <span className="text-destructive">*</span></label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="مثال: أحمد محمد" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">المسمى الوظيفي <span className="text-destructive">*</span></label>
            <Input 
              value={jobTitle} 
              onChange={e => setJobTitle(e.target.value)} 
              placeholder="مثال: مدير المبيعات" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الشهر <span className="text-destructive">*</span></label>
            <select 
              value={month} 
              onChange={e => setMonth(Number(e.target.value))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {MONTHS.map((m, index) => (
                <option key={index + 1} value={index + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">السنة <span className="text-destructive">*</span></label>
            <select 
              value={year} 
              onChange={e => setYear(Number(e.target.value))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <label className="text-sm font-medium block">صورة الموظف <span className="text-destructive">*</span></label>
          <div className="w-48 h-48">
            <ImageUploader 
              value={imageUrl} 
              onChange={setImageUrl} 
              label="اختر الصورة الشخصية" 
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">يفضل استخدام صورة مربعة بجودة جيدة.</p>
        </div>
      </div>
    </div>
  )
}
