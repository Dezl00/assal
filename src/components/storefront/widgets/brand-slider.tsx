"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"

export function BrandSlider({ widget }: { widget: any }) {
  const items = widget.items || []
  
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (items.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [items.length])

  if (items.length === 0) return null

  return (
    <div className="w-full overflow-hidden bg-background py-8 border-y border-border/50">
      {widget.title && widget.title !== "" && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">{widget.title}</h2>
        </div>
      )}
      
      <div className="relative w-full max-w-7xl mx-auto px-4 overflow-hidden">
        <div 
          className="flex items-center transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(${currentIndex * (100 / (typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 4))}%)` }}
        >
          {/* We duplicate items a few times to create an infinite-like feel for the track */}
          {[...items, ...items, ...items, ...items].map((item: any, index: number) => (
            <div key={`${item.id}-${index}`} className="flex-shrink-0 w-1/2 md:w-1/4 px-4 flex justify-center">
              {item.buttonUrl ? (
                <Link href={item.buttonUrl} className="block transition-transform hover:scale-110">
                  <img 
                    src={item.desktopImage} 
                    alt={item.title || "Brand Logo"} 
                    className="h-16 md:h-20 w-auto object-contain transition-all duration-300"
                  />
                </Link>
              ) : (
                <img 
                  src={item.desktopImage} 
                  alt={item.title || "Brand Logo"} 
                  className="h-16 md:h-20 w-auto object-contain transition-all duration-300"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
