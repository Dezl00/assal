"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateThemeConfig } from "@/features/settings/actions"
import { toast } from "sonner"
import { ImageUploader } from "@/components/ui/image-uploader"

export function SettingsClient({ config }: { config: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoUrl, setLogoUrl] = useState(config?.logoUrl || "")

  async function handleSave(formData: FormData) {
    setIsSubmitting(true)
    formData.set("logoUrl", logoUrl) // Add the image url to formData
    
    const res = await updateThemeConfig(formData)
    setIsSubmitting(false)
    if (res.success) {
      toast.success("تم حفظ الإعدادات بنجاح!")
    } else {
      toast.error(res.error || "حدث خطأ ما")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إعدادات المتجر</h1>
          <p className="text-muted-foreground mt-1">تخصيص المظهر العام، الألوان، ومعلومات المتجر الأساسية.</p>
        </div>
      </div>

      <form action={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h2 className="text-xl font-semibold mb-6">المعلومات الأساسية والشعار</h2>
            <div className="space-y-6">
              
              <div className="w-48">
                <ImageUploader 
                  label="شعار المتجر (Logo)" 
                  value={logoUrl} 
                  onChange={setLogoUrl} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المتجر</label>
                <input
                  name="storeName"
                  type="text"
                  defaultValue={config?.storeName || "عسل طبيعي"}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">وصف المتجر (للسيو)</label>
                <textarea
                  name="storeDescription"
                  rows={3}
                  defaultValue={config?.storeDescription || ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                  placeholder="وصف مختصر يظهر في محركات البحث..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h2 className="text-xl font-semibold mb-6">الألوان والهوية</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اللون الرئيسي (Primary)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    defaultValue={config?.primaryColor || "#D97706"}
                    className="h-10 w-12 rounded cursor-pointer border border-border/50"
                  />
                  <input
                    type="text"
                    defaultValue={config?.primaryColor || "#D97706"}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring uppercase text-left"
                    dir="ltr"
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">اللون الثانوي (Secondary)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    defaultValue={config?.secondaryColor || "#FBBF24"}
                    className="h-10 w-12 rounded cursor-pointer border border-border/50"
                  />
                  <input
                    type="text"
                    defaultValue={config?.secondaryColor || "#FBBF24"}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring uppercase text-left"
                    dir="ltr"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="rounded-xl border border-border/50 bg-card p-6 sticky top-4">
            <h3 className="font-semibold mb-4">إجراءات الحفظ</h3>
            <p className="text-sm text-muted-foreground mb-6">تأكد من مراجعة كافة التعديلات قبل حفظ الإعدادات، حيث ستنعكس فوراً على واجهة المتجر الرئيسية.</p>
            
            <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base shadow-sm">
               {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
