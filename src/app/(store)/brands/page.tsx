import React from "react"
import { db } from "@/lib/db"
import Link from "next/link"
import { motion } from "framer-motion"

export const dynamic = "force-dynamic"

export default async function BrandsPage() {
  const brands = await db.brand.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Internal Header */}
      <div className="bg-primary/5 rounded-3xl p-8 md:p-12 mb-12 text-center max-w-4xl mx-auto w-full">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">الماركات</h1>
        <p className="text-muted-foreground text-lg">تصفح منتجاتنا حسب الماركات المفضلة لديك</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {brands.map(brand => (
          <Link href={`/brand/${brand.slug}`} key={brand.id}>
            <div className="bg-card border border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 h-full aspect-square text-center group">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                  {brand.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{brand.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{brand._count.products} منتج</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {brands.length === 0 && (
        <div className="text-center text-muted-foreground py-20 bg-secondary/20 rounded-2xl">
          لا توجد ماركات مضافة حتى الآن.
        </div>
      )}
    </div>
  )
}
