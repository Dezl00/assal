import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const rateLimitCache = new Map<string, number>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path")
  
  if (!path) return new NextResponse(null, { status: 400 })

  const userAgent = request.headers.get("user-agent") || "unknown"
  const isBot = ['bot', 'spider', 'crawl', 'lighthouse', 'google', 'bing', 'yahoo', 'yandex']
    .some(bot => userAgent.toLowerCase().includes(bot))

  if (isBot) return new NextResponse(null, { status: 200 })

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  
  const rateLimitKey = `${ip}:${path}`
  const now = Date.now()
  if (rateLimitCache.has(rateLimitKey)) {
    if (now - rateLimitCache.get(rateLimitKey)! < 5 * 60 * 1000) {
      return new NextResponse(null, { status: 200 })
    }
  }
  rateLimitCache.set(rateLimitKey, now)
  // Cleanup old entries randomly to avoid memory leak
  if (Math.random() < 0.01) {
    for (const [key, timestamp] of rateLimitCache.entries()) {
      if (now - timestamp > 5 * 60 * 1000) {
        rateLimitCache.delete(key)
      }
    }
  }

  const country = request.headers.get("x-vercel-ip-country") || "غير محدد"
  const city = request.headers.get("x-vercel-ip-city") || "غير محدد"

  // Background promise for Next.js (Edge/Node) - prevents blocking response
  const logPromise = db.pageVisit.create({
    data: {
      path,
      ipAddress: ip,
      userAgent,
      country: decodeURIComponent(country),
      city: decodeURIComponent(city)
    }
  }).catch(e => console.error("Page view analytics error:", e))

  // In Next.js 15 this would use `after(logPromise)`. For Next.js 14, we just let it run.
  // We return immediately.
  return new NextResponse(null, { status: 200 })
}
