import React from "react"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ProductGallery } from "@/components/storefront/product-gallery"
import { AddToCartForm } from "@/components/storefront/add-to-cart-form"

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
          {product.brand && (
            <span className="text-primary font-bold tracking-widest text-sm uppercase mb-3">
              {product.brand.name}
            </span>
          )}
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-end gap-4 mb-8">
            <span className="text-4xl font-black text-primary">{finalPrice.toFixed(2)} ر.س</span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through mb-1">
                {product.price.toFixed(2)} ر.س
              </span>
            )}
            {hasDiscount && (
              <span className="bg-destructive/10 text-destructive font-bold px-3 py-1 rounded-full text-sm mb-1 ml-auto">
                توفير {((1 - finalPrice / product.price) * 100).toFixed(0)}%
              </span>
            )}
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed mb-8">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>لا يوجد وصف متاح لهذا المنتج حالياً.</p>
            )}
          </div>

          <div className="h-px w-full bg-border/50 mb-8" />

          {/* Add to Cart Actions */}
          <AddToCartForm product={product as any} />
          
          {/* Features/Trust badges */}
          <div className="mt-12 grid grid-cols-2 gap-6 p-6 rounded-3xl bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                🚚
              </div>
              <div>
                <p className="font-semibold text-sm">شحن سريع</p>
                <p className="text-xs text-muted-foreground">لجميع المدن</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                🛡️
              </div>
              <div>
                <p className="font-semibold text-sm">ضمان الجودة</p>
                <p className="text-xs text-muted-foreground">منتجات أصلية 100%</p>
              </div>
            </div>
          </div>

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
                  {(related.discountPrice ?? related.price).toFixed(2)} ر.س
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
