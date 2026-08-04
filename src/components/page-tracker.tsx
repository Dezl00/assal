"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { logPageVisit } from "@/features/analytics/actions"

export function PageTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasLogged = useRef<string | null>(null)

  useEffect(() => {
    // Only log once per path change
    if (pathname && hasLogged.current !== pathname) {
      hasLogged.current = pathname
      // Ignore admin routes
      if (!pathname.startsWith("/admin")) {
        logPageVisit(pathname)
      }
    }
  }, [pathname, searchParams])

  return null
}
