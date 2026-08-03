"use client"
import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ChevronRight, ChevronLeft } from "lucide-react"

export function BrandSlider({ widget }: { widget: any }) {
  const originalItems = widget.items || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(4)
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)

  // Touch states
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    const handleResize = () => setItemsPerPage(window.innerWidth < 768 ? 2 : 4)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  useEffect(() => {
    if (currentIndex === totalActualPages) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(0)
      }, 700)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, totalActualPages])

  if (originalItems.length === 0) return null

  const pages = Array.from({ length: totalActualPages }).map((_, i) =>
    items.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
  )
  const clonedFirstPage = pages[0]
  const displayPages = [...pages, clonedFirstPage]
  const translateValue = `translateX(-${currentIndex * 100}%)`

  const handleNext = () => {
    setIsTransitioning(true)
    setCurrentIndex(prev => prev + 1)
  }

  const handlePrev = () => {
    setIsTransitioning(true)
    setCurrentIndex(prev => prev === 0 ? totalActualPages - 1 : prev - 1)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setIsHovered(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsHovered(false)
      return
    }
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrev()
    }

    setTouchStart(null)
    setTouchEnd(null)
    setIsHovered(false)
  }

  return (
    <div className="w-full bg-background py-10 border-y border-border/50">
      {widget.title && widget.title !== "" && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{widget.title}</h2>
        </div>
      )}
      
      <div 
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-12"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
                          className="h-20 w-auto object-contain transition-all duration-300"
                        />
                      </Link>
                    ) : (
                      <img 
                        src={item.desktopImage} 
                        alt={item.title || "Brand Logo"} 
                        className="h-20 w-auto object-contain transition-all duration-300"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {totalActualPages > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
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
          </>
        )}
      </div>
    </div>
  )
}

