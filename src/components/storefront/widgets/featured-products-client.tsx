"use client"
import React from "react"
import Link from "next/link"
import { ProductCard } from "@/components/storefront/product-card"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function FeaturedProductsClient({ widget, products }: { widget: any, products: any[] }) {
  if (products.length === 0) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {widget.title && widget.title !== "" ? (
        <ScrollReveal variant="fade-up" duration={0.5}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{widget.title}</h2>
              {widget.subtitle && <p className="text-muted-foreground mt-2">{widget.subtitle}</p>}
            </div>
            <Link href="/products" className="text-primary hover:underline font-medium text-sm hidden sm:block">
              عرض الكل
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal variant="fade-up" duration={0.4}>
          <div className="flex justify-end mb-6">
            <Link href="/products" className="text-primary hover:underline font-medium text-sm hidden sm:block">
              عرض الكل
            </Link>
          </div>
        </ScrollReveal>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product, index) => (
          <ScrollReveal
            key={product.id}
            variant="fade-up"
            delay={index * 0.1}
            duration={0.6}
            className="h-full"
          >
            <ProductCard product={product as any} disableAnimation={true} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
