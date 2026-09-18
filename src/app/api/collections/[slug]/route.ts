import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const collection = await db.collection.findUnique({
      where: { slug },
      include: {
        products: {
          take: limit,
          skip,
          include: {
            category: true,
            brand: true,
            images: true,
          }
        },
        _count: { select: { products: true } }
      }
    })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json({
      collection,
      pagination: {
        page,
        limit,
        total: collection._count.products,
        totalPages: Math.ceil(collection._count.products / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching collection:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
