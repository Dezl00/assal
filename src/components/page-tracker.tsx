"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export function PageTracker() {
  const pathname = usePathname()
  const hasLogged = useRef<string | null>(null)

  useEffect(() => {
    if (pathname && hasLogged.current !== pathname) {
      hasLogged.current = pathname
      if (!pathname.startsWith("/admin")) {
        // Use non-blocking fetch to a new lightweight API route instead of Server Action
        // Alternatively, use navigator.sendBeacon
        try {
          // Send beacon is fire-and-forget and won't block navigation
          navigator.sendBeacon(`/api/analytics/pageview?path=${encodeURIComponent(pathname)}`)
        } catch (e) {
          // fallback
          fetch(`/api/analytics/pageview?path=${encodeURIComponent(pathname)}`, { keepalive: true }).catch(() => {})
        }
      }
    }
  }, [pathname])

  return null
}
