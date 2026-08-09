import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const latestOrder = await db.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        customerName: true
      }
    })

    if (!latestOrder) {
      return NextResponse.json({ order: null })
    }

    return NextResponse.json({ order: latestOrder })
  } catch (error) {
    console.error("Latest order error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
