import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { ChevronLeft } from "lucide-react"
import { ProductListClient } from "./product-list-client"

export async function ProductList({ widget }: { widget: any }) {
  const collectionItem = widget.items?.[0]
  let products: any[] = []

  if (collectionItem?.buttonUrl) {
    const slug = collectionItem.buttonUrl.replace('/collection/', '')
    try {
      const collection = await db.collection.findUnique({
        where: { slug },
        include: {
          products: {
            where: { isActive: true },
            take: 6,
            select: {
              id: true,
              slug: true,
              name: true,
              price: true,
              discountPrice: true,
              stock: true,
              images: { 
                take: 1, 
                orderBy: { sortOrder: 'asc' },
                select: { url: true }
              },
              category: { 
                select: { name: true, slug: true }
              },
            }
          }
        }
      })
      if (collection?.products) {
        products = collection.products
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!collectionItem || products.length === 0) return null

  return (
    <ProductListClient widget={widget} products={products} collectionItem={collectionItem} />
  )
}
