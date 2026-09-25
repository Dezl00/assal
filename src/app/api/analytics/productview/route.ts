import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const rateLimitCache = new Map<string, number>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get("id")
  
  if (!productId) return new NextResponse(null, { status: 400 })

  const userAgent = request.headers.get("user-agent") || "unknown"
  const isBot = ['bot', 'spider', 'crawl', 'lighthouse', 'google', 'bing', 'yahoo', 'yandex']
    .some(bot => userAgent.toLowerCase().includes(bot))

  if (isBot) return new NextResponse(null, { status: 200 })

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  const rateLimitKey = `${ip}:${productId}`
  const now = Date.now()
  if (rateLimitCache.has(rateLimitKey)) {
    if (now - rateLimitCache.get(rateLimitKey)! < 10 * 60 * 1000) {
      return new NextResponse(null, { status: 200 })
    }
  }
  rateLimitCache.set(rateLimitKey, now)
  if (Math.random() < 0.01) {
    for (const [key, timestamp] of rateLimitCache.entries()) {
      if (now - timestamp > 10 * 60 * 1000) {
        rateLimitCache.delete(key)
      }
    }
  }

  const country = request.headers.get("x-vercel-ip-country") || "غير محدد"
  const city = request.headers.get("x-vercel-ip-city") || "غير محدد"

  // Background promise to log product view
  db.productView.create({
    data: {
      productId,
      ipAddress: ip,
      userAgent,
      country: decodeURIComponent(country),
      city: decodeURIComponent(city)
    }
  }).catch(e => console.error("Product view analytics error:", e))

  return new NextResponse(null, { status: 200 })
}
