import { Product, Category } from "@prisma/client"

export function generateProductJsonLd(product: Product, primaryImageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: primaryImageUrl,
    description: product.description || product.name,
    sku: product.sku,
    mpn: product.barcode || product.sku,
    brand: {
      "@type": "Brand",
      name: "Assal" // Ideally dynamic from product.brand.name
    },
    offers: {
      "@type": "Offer",
      url: `https://yourdomain.com/product/${product.slug}`,
      priceCurrency: "USD",
      price: product.discountPrice || product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    }
  }
}

export function generateBreadcrumbJsonLd(items: { name: string, url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://yourdomain.com${item.url}`
    }))
  }
}
