import React from "react"
import { db } from "@/lib/db"
import { SearchClient } from "./search-client"

export const dynamic = "force-dynamic"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || ""

  let products: any[] = []
  
  if (q.trim()) {
    products = await db.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          }
        ]
      },
      include: {
        images: true,
        category: true
      },
      take: 50
    })
  }

  return <SearchClient initialQuery={q} initialResults={products} />
}
