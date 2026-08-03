"use client"
import React, { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"

export function BrandSlider({ widget }: { widget: any }) {
  const originalItems = widget.items || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(4)
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)

  useEffect(() => {
    const handleResize = () => setItemsPerPage(window.innerWidth < 768 ? 2 : 4)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Duplicate items enough times so we have multiple pages to loop through
  const items = useMemo(() => {
    if (originalItems.length === 0) return []
    const minItems = itemsPerPage * 3
    if (originalItems.length >= minItems) return originalItems
    const multiplier = Math.ceil(minItems / originalItems.length)
    return Array(multiplier).fill(originalItems).flat()
  }, [originalItems, itemsPerPage])

  const totalActualPages = Math.ceil(items.length / itemsPerPage)

  useEffect(() => {
    if (items.length === 0 || totalActualPages <= 1 || isHovered) return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      setCurrentIndex((prev) => prev + 1)
    }, 3000)

    return () => clearInterval(timer)
  }, [items.length, totalActualPages, isHovered])

  // Handle the seamless jump back to start
  useEffect(() => {
    if (currentIndex === totalActualPages) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(0)
      }, 700) // matches duration-700
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, totalActualPages])

  if (originalItems.length === 0) return null

  // We append the first page to the end for the seamless infinite loop
  const pages = Array.from({ length: totalActualPages }).map((_, i) =>
    items.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
  )
  const clonedFirstPage = pages[0]
  const displayPages = [...pages, clonedFirstPage]

  // In RTL, translating positive moves content to the right (which shifts the view to the left pages).
  // We will force LTR on the slider track so translate always works as expected.
  const translateValue = `translateX(-${currentIndex * 100}%)`

  return (
    <div className="w-full bg-background py-10 border-y border-border/50">
      {widget.title && widget.title !== "" && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{widget.title}</h2>
        </div>
      )}
      
      <div 
        className="relative w-full max-w-7xl mx-auto px-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="overflow-hidden w-full" dir="ltr">
          <div 
            className="flex"
            style={{ 
              transform: translateValue,
              transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none'
            }}
          >
            {displayPages.map((pageItems, pageIndex) => (
              <div key={pageIndex} className="flex-shrink-0 w-full flex items-center justify-around">
                {pageItems.map((item: any, index: number) => (
                  <div key={`${item.id}-${index}`} className="flex justify-center px-2" style={{ width: `${100 / itemsPerPage}%` }}>
                    {item.buttonUrl ? (
                      <Link href={item.buttonUrl} className="block transition-transform hover:scale-110">
                        <img 
                          src={item.desktopImage} 
                          alt={item.title || "Brand Logo"} 
                          className="h-20 w-auto object-contain transition-all duration-300 filter grayscale hover:grayscale-0"
                        />
                      </Link>
                    ) : (
                      <img 
                        src={item.desktopImage} 
                        alt={item.title || "Brand Logo"} 
                        className="h-20 w-auto object-contain transition-all duration-300 filter grayscale hover:grayscale-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {totalActualPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: totalActualPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true)
                  setCurrentIndex(idx)
                }}
                className={`transition-all duration-300 rounded-full ${
                  (currentIndex === idx || (currentIndex === totalActualPages && idx === 0))
                    ? "w-8 h-2 bg-primary" 
                    : "w-2 h-2 bg-primary/30 hover:bg-primary/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

