import React from "react"
import { db } from "@/lib/db"
import { CategoriesClient } from "./categories-client"

export const dynamic = "force-dynamic"

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { products: true }
      },
      parent: true
    },
    orderBy: { name: "asc" },
  })
  return <CategoriesClient categories={categories} />
}
