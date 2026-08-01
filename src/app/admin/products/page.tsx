import React from "react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: {
      category: true,
      brand: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المنتجات</h1>
          <p className="text-muted-foreground mt-1">إدارة منتجات المتجر، المخزون، والأسعار.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            إضافة منتج
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-sm">
        <div className="flex items-center border-b border-border/50 p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              className="h-10 w-full rounded-md border border-input bg-transparent pr-10 pl-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="border-b border-border/50 bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">المنتج</th>
                <th className="px-6 py-4 font-medium">الرمز (SKU)</th>
                <th className="px-6 py-4 font-medium">القسم</th>
                <th className="px-6 py-4 font-medium">السعر</th>
                <th className="px-6 py-4 font-medium">المخزون</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    لا توجد منتجات مسجلة. اضغط على "إضافة منتج" للبدء.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {product.category?.name || "بدون قسم"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {product.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="text-red-500">{product.discountPrice} ر.س</span>
                          <span className="text-xs text-muted-foreground line-through">{product.price} ر.س</span>
                        </div>
                      ) : (
                        <span>{product.price} ر.س</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.stock > 0 ? (
                        <span className="text-green-600 font-medium">{product.stock} حبة</span>
                      ) : (
                        <span className="text-red-500 font-medium">نفذت الكمية</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
