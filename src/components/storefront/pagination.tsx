"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

export function StorePagination({ 
  totalPages, 
  currentPage 
}: { 
  totalPages: number, 
  currentPage: number 
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  // Generate page numbers
  const pages: (number | string)[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i)
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push("...")
    }
  }

  // Remove duplicate '...'
  const uniquePages = pages.filter((item, index) => 
    item !== "..." || pages[index - 1] !== "..."
  )

  return (
    <nav className="flex justify-center mt-12 mb-8" aria-label="ترقيم صفحات المنتجات">
      <ul className="flex items-center gap-1 sm:gap-2">
        {/* Previous Button */}
        {currentPage > 1 && (
          <li>
            <Link prefetch={false} 
              href={createPageURL(currentPage - 1)} 
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border/50 bg-card text-foreground hover:bg-muted hover:text-primary transition-colors text-lg"
              aria-label={`صفحة ${currentPage - 1}`}
            >
              &rarr;
            </Link>
          </li>
        )}

        {/* Page Numbers */}
        {uniquePages.map((page, i) => (
          <li key={i}>
            {page === "..." ? (
              <span className="flex h-10 w-10 items-center justify-center text-muted-foreground">...</span>
            ) : page === currentPage ? (
              <span 
                className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 text-lg"
                aria-label={`صفحة ${page}`} 
                aria-current="page"
              >
                {page}
              </span>
            ) : (
              <Link prefetch={false} 
                href={createPageURL(page)} 
                className="flex h-10 w-10 items-center justify-center rounded-md border border-border/50 bg-card text-foreground hover:bg-muted hover:text-primary transition-colors font-medium text-lg"
                aria-label={`صفحة ${page}`}
              >
                {page}
              </Link>
            )}
          </li>
        ))}

        {/* Next Button */}
        {currentPage < totalPages && (
          <li>
            <Link prefetch={false} 
              href={createPageURL(currentPage + 1)} 
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border/50 bg-card text-foreground hover:bg-muted hover:text-primary transition-colors text-lg"
              aria-label={`صفحة ${currentPage + 1}`}
            >
              &larr;
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
