import React from "react"
import { db } from "@/lib/db"
import { ProductsClient } from "./products-client"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: {
      category: true,
      brand: true,
      images: {
        where: { isPrimary: true },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" },
  })
  const categories = await db.category.findMany({
    orderBy: { name: "asc" }
  })

  return <ProductsClient products={products} categories={categories} />
}
