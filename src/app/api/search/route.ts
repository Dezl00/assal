import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json({ success: true, results: [] })
  }

  try {
    // Smart Search matching Name, SKU, Barcode.
    // In a real enterprise system, this might use Postgres Full Text Search or ElasticSearch/Algolia.
    // For now, we use Prisma's `contains` on multiple fields.
    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { barcode: { contains: query, mode: "insensitive" } },
        ]
      },
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountPrice: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true }
        }
      }
    })

    return NextResponse.json({ success: true, results: products })
  } catch (error) {
    console.error("Search API Error:", error)
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 })
  }
}
