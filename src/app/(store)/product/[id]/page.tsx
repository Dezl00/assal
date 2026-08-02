import React from "react"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { ChevronRight, Truck, ShieldCheck, Tag } from "lucide-react"
import { ProductGallery } from "@/components/storefront/product-gallery"
import { AddToCartForm } from "@/components/storefront/add-to-cart-form"
import { ShareButton } from "@/components/storefront/share-button"
import { ProductTabs } from "@/components/storefront/product-tabs"

// Generate metadata for SEO
export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const product = await db.product.findUnique({
    where: { id: params.id },
  })
  
  if (!product) return { title: "Product Not Found" }
  
  return {
    title: `${product.name} | متجر عسل`,
    description: product.description,
  }
}

export default async function ProductDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const product = await db.product.findUnique({
    where: { id: params.id },
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
    include: { images: true }
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
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/50">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">الرمز (SKU):</span>
              <span className="font-mono">{product.sku}</span>
            </div>
            {product.brand && (
              <>
                <span className="w-1 h-1 rounded-full bg-border"></span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">الماركة:</span>
                  <span className="text-primary font-bold">{product.brand.name}</span>
                </div>
              </>
            )}
          </div>

          {/* Add to Cart Actions */}
          <AddToCartForm product={product as any} />
          
          {/* Features/Trust badges (Scrollable on mobile) */}
          <div className="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory hide-scrollbar">
              
              <div className="flex items-center gap-3 min-w-[200px] sm:min-w-0 snap-start border border-border/50 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">شحن سريع</p>
                  <p className="text-xs text-muted-foreground">لجميع المدن</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 min-w-[200px] sm:min-w-0 snap-start border border-border/50 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">ضمان الجودة</p>
                  <p className="text-xs text-muted-foreground">أصلية 100%</p>
                </div>
              </div>

              <div className="flex items-center gap-3 min-w-[200px] sm:min-w-0 snap-start border border-border/50 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">أفضل الأسعار</p>
                  <p className="text-xs text-muted-foreground">قيمة ممتازة</p>
                </div>
              </div>
              
            </div>
          </div>

          {/* Product Tabs (Description & Shipping) */}
          <ProductTabs description={product.description} />
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-16 border-t border-border/50">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tight">منتجات مشابهة</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(related => (
              <Link key={related.id} href={`/product/${related.id}`} className="group relative rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <div className="block relative aspect-square overflow-hidden rounded-xl mb-4 bg-muted">
                  {related.images[0] ? (
                    <img 
                      src={related.images[0].url} 
                      alt={related.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">صورة</div>
                  )}
                </div>
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 mb-2">
                  {related.name}
                </h3>
                <span className="font-bold text-lg text-primary">
                  {(related.discountPrice ?? related.price).toFixed(2)} ج.م
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
