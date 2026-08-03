import React from "react"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { ChevronRight, Truck, ShieldCheck, Tag } from "lucide-react"
import { ProductGallery } from "@/components/storefront/product-gallery"
import { AddToCartForm } from "@/components/storefront/add-to-cart-form"
import { ShareButton } from "@/components/storefront/share-button"
import { ProductTabs } from "@/components/storefront/product-tabs"
import { ProductFeatures } from "@/components/storefront/product-features"
import { ProductCard } from "@/components/storefront/product-card"

import type { Metadata } from "next"

// Generate metadata for SEO
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const [product, theme] = await Promise.all([
    db.product.findUnique({
      where: { slug: params.slug },
      include: { images: { orderBy: { sortOrder: 'asc' } } }
    }),
    db.themeConfig.findUnique({ where: { id: "default" } })
  ])
  
  if (!product) return { title: "المنتج غير موجود" }
  
  const storeName = theme?.storeName || "عسل";
  const ogImages = product.images.length > 0 
    ? product.images.map(img => ({ url: img.url, width: 800, height: 800, alt: product.name }))
    : [];

  return {
    title: product.name, // Next.js layout template will automatically append | storeName to the <title> tag
    description: product.description || undefined,
    openGraph: {
      title: `${product.name} | ${storeName}`,
      description: product.description || undefined,
      url: `/product/${product.slug}`,
      type: 'website',
      siteName: storeName,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${storeName}`,
      description: product.description || undefined,
      images: ogImages.map(img => img.url),
    },
  }
}

export default async function ProductDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      brand: true,
    }
  })

  if (!product) {
    notFound()
  }

  // Fetch related products
  const relatedProducts = await db.product.findMany({
    where: { 
      categoryId: product.categoryId,
      id: { not: product.id }
    },
    take: 4,
    include: { images: true, category: true }
  })

  const finalPrice = product.discountPrice ?? product.price
  const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rtl-flip" />
        <Link href={`/category/${product.category.slug}`} className="hover:text-primary transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="w-4 h-4 rtl-flip" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 self-start">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>
            <ShareButton title={product.name} url={`https://assal1.vercel.app/product/${product.id}`} />
          </div>

          <div className="flex items-end gap-4 mb-3">
            <span className="text-4xl font-black text-primary">{finalPrice.toFixed(2)} ج.م</span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through mb-1">
                {product.price.toFixed(2)} ج.م
              </span>
            )}
            {hasDiscount && (
              <span className="bg-destructive/10 text-destructive font-bold px-3 py-1 rounded-full text-sm mb-1 ml-auto">
                توفير {((1 - finalPrice / product.price) * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {/* SKU and Brand */}
          <div className="flex flex-col gap-3 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/50">
            {product.sku && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">الرمز (SKU):</span>
                <span className="font-mono">{product.sku}</span>
              </div>
            )}
            {product.brand && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">الماركة:</span>
                <Link href={`/brand/${product.brand.slug}`} className="text-primary font-bold hover:underline">
                  {product.brand.name}
                </Link>
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <AddToCartForm product={product as any} />

          {/* Product Tabs (Description & Shipping) */}
          <div className="mt-8">
            <ProductTabs description={product.description} />
          </div>

          {/* Features Slider */}
          <ProductFeatures />
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-16 border-t border-border/50">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tight">منتجات مشابهة</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(related => (
              <ProductCard key={related.id} product={related as any} disableAnimation={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
