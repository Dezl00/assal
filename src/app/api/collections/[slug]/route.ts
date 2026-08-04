import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const collection = await db.collection.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            category: true,
            brand: true,
          }
        }
      }
    })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json({ collection })
  } catch (error) {
    console.error("Error fetching collection:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
