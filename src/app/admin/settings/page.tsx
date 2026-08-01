import React from "react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  let themeConfig = await db.themeConfig.findUnique({
    where: { id: "default" }
  })
  
  if (!themeConfig) {
    themeConfig = await db.themeConfig.create({
      data: { id: "default" }
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
          <p className="text-muted-foreground mt-1">تخصيص مظهر المنصة وإعدادات المتجر العامة.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold tracking-tight border-b border-border/50 pb-4">إعدادات المظهر الأساسية</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">اللون الرئيسي (Primary Color)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  defaultValue={themeConfig.primaryColor}
                  className="h-10 w-20 cursor-pointer rounded-md border border-input p-1"
                />
                <input 
                  type="text" 
                  defaultValue={themeConfig.primaryColor}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  dir="ltr"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">اللون الثانوي (Secondary Color)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  defaultValue={themeConfig.secondaryColor}
                  className="h-10 w-20 cursor-pointer rounded-md border border-input p-1"
                />
                <input 
                  type="text" 
                  defaultValue={themeConfig.secondaryColor}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">نمط حواف الأزرار والبطاقات (Border Radius)</label>
              <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none">
                <option value="0px" selected={themeConfig.borderRadius === "0px"}>حواف حادة (0px)</option>
                <option value="4px" selected={themeConfig.borderRadius === "4px"}>حواف ناعمة (4px)</option>
                <option value="8px" selected={themeConfig.borderRadius === "8px"}>حواف دائرية (8px)</option>
                <option value="9999px" selected={themeConfig.borderRadius === "9999px"}>دائرية بالكامل</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">نمط الأزرار (Button Style)</label>
              <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none">
                <option value="solid" selected={themeConfig.buttonStyle === "solid"}>معبأ (Solid)</option>
                <option value="outline" selected={themeConfig.buttonStyle === "outline"}>مفرغ (Outline)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm opacity-60">
          <h3 className="mb-4 text-lg font-semibold tracking-tight border-b border-border/50 pb-4">إعدادات الدفع والشحن (قريباً)</h3>
          <p className="text-sm text-muted-foreground">سيتم تفعيل هذه الإعدادات قريباً بعد دمج بوابات الدفع.</p>
        </div>
      </div>
    </div>
  )
}
