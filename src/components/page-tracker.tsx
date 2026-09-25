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
        try {
          const trackedPages = JSON.parse(sessionStorage.getItem('trackedPages') || '[]')
          if (!trackedPages.includes(pathname)) {
            trackedPages.push(pathname)
            sessionStorage.setItem('trackedPages', JSON.stringify(trackedPages))

            try {
              navigator.sendBeacon(`/api/analytics/pageview?path=${encodeURIComponent(pathname)}`)
            } catch (e) {
              fetch(`/api/analytics/pageview?path=${encodeURIComponent(pathname)}`, { keepalive: true }).catch(() => {})
            }
          }
        } catch (e) {
          // Fallback if sessionStorage is not available
        }
      }
    }
  }, [pathname])

  return null
}
