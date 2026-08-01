import React from "react"
import { db } from "@/lib/db"
import { createProduct } from "@/features/products/actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" }
  })

  async function handleSubmit(formData: FormData) {
    "use server"
    const res = await createProduct(formData)
    if (res.success) {
      redirect("/admin/products")
    } else {
      console.error(res.error)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-5 w-5 rtl-flip" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إضافة منتج جديد</h1>
          <p className="text-muted-foreground mt-1">قم بإدخال بيانات المنتج، المخزون والأسعار.</p>
        </div>
      </div>

      <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-border/50 bg-background p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">المعلومات الأساسية</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم المنتج <span className="text-red-500">*</span></label>
              <input 
                name="name"
                type="text" 
                required
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="مثال: عسل سدر يمني"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف</label>
              <textarea 
                name="description"
                rows={6}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                placeholder="اكتب وصفاً مفصلاً للمنتج ومميزاته..."
              />
            </div>
          </div>
          
          <div className="rounded-xl border border-border/50 bg-background p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">التسعير والمخزون</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">السعر (ر.س) <span className="text-red-500">*</span></label>
                <input 
                  name="price"
                  type="number"
                  step="0.01" 
                  required
                  dir="ltr"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                  placeholder="150.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">سعر التخفيض (ر.س)</label>
                <input 
                  name="discountPrice"
                  type="number"
                  step="0.01"
                  dir="ltr"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                  placeholder="120.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">رمز المنتج (SKU) <span className="text-red-500">*</span></label>
                <input 
                  name="sku"
                  type="text" 
                  required
                  dir="ltr"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                  placeholder="HONEY-SDR-01"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الكمية المتوفرة في المخزون</label>
                <input 
                  name="stock"
                  type="number"
                  defaultValue={0}
                  dir="ltr"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (1/3 width) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border/50 bg-background p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">التنظيم</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">القسم <span className="text-red-500">*</span></label>
              <select 
                name="categoryId"
                required
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
              >
                <option value="">اختر القسم...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الرابط الدائم (Slug) <span className="text-red-500">*</span></label>
              <input 
                name="slug"
                type="text" 
                required
                dir="ltr"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                placeholder="yemeni-sidr-honey"
              />
              <p className="text-xs text-muted-foreground">باللغة الإنجليزية وبدون مسافات.</p>
            </div>
          </div>

          {/* We will add Cloudinary Image upload here in Phase 2 */}
          
          <div className="rounded-xl border border-border/50 bg-background p-6 shadow-sm">
            <Button type="submit" className="w-full text-base h-12">حفظ المنتج والنشر</Button>
            <Link href="/admin/products" className="block mt-3">
              <Button type="button" variant="outline" className="w-full h-10">إلغاء</Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
