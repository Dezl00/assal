import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

// List of aggressive AI bots and scrapers to block at the Edge
const BLOCKED_BOTS = [
  // AI Crawlers
  "gptbot", "chatgpt-user", "oai-searchbot",
  "anthropic", "claude", "claude-web",
  "cohere-ai", "cohere",
  "google-extended",
  "meta-externalagent", "facebookexternalhit",
  "perplexitybot",
  // Aggressive scrapers
  "bytespider", "bytedance",
  "ccbot",
  "amazonbot",
  "semrushbot", "ahrefsbot", "mj12bot", "dotbot",
  "petalbot", "sogou", "yisouspider",
  "dataforseo", "blexbot",
  // Generic scrapers
  "scrapy", "python-requests", "httpx", "curl/", "wget/",
  "go-http-client", "java/",
]

export default async function proxy(request: NextRequest) {
  // 1. Block aggressive bots instantly before Next.js or Prisma
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || ""
  if (BLOCKED_BOTS.some(bot => userAgent.includes(bot))) {
    return new NextResponse('Forbidden: Bot Access Denied', { status: 403 })
  }

  // 2. Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await auth()
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check role-based access
    if (session.user?.role !== "ADMIN" && session.user?.role !== "MANAGER") {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Run middleware on all paths except static assets and images
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
}
