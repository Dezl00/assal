"use client"

import { useEffect, useRef } from "react"

export function ProductTracker({ productId }: { productId: string }) {
  const hasLogged = useRef(false)

  useEffect(() => {
    if (!hasLogged.current && productId) {
      hasLogged.current = true
      try {
        navigator.sendBeacon(`/api/analytics/productview?id=${encodeURIComponent(productId)}`)
      } catch (e) {
        fetch(`/api/analytics/productview?id=${encodeURIComponent(productId)}`, { keepalive: true }).catch(() => {})
      }
    }
  }, [productId])

  return null
}
