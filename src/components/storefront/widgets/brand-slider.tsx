"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"

export function BrandSlider({ widget }: { widget: any }) {
  const items = widget.items || []
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(4)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 2 : 4)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalPages = Math.ceil(items.length / itemsPerPage)

  useEffect(() => {
    if (items.length === 0 || totalPages <= 1 || isHovered) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPages)
    }, 3000)
    return () => clearInterval(timer)
  }, [items.length, totalPages, isHovered])

  if (items.length === 0) return null

  // Ensure RTL translation moves correctly
  // In RTL, items go right to left. So to move to page 2 (which is to the left), we translate positive.
  // We will force LTR on the track and reverse the items to keep logic simple, 
  // or just use typical RTL transform. Standard RTL transform for next page is `translateX(${currentIndex * 100}%)`.
  const translateValue = `translateX(${currentIndex * 100}%)`

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
        <div className="overflow-hidden w-full" dir="rtl">
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: translateValue }}
          >
            {/* We map pages */}
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <div key={pageIndex} className="flex-shrink-0 w-full flex items-center justify-around">
                {items.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage).map((item: any, index: number) => (
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
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx 
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
