"use client"
import React, { useMemo } from "react"
import Link from "next/link"

export function BrandSlider({ widget }: { widget: any }) {
  const originalItems = widget.items || []

  // To ensure the marquee is continuous even with 1 or 2 items, 
  // we repeat the items enough times to fill the screen width.
  const repeatedItems = useMemo(() => {
    if (originalItems.length === 0) return []
    // Ensure we have enough items to exceed the screen width multiple times
    const multiplier = Math.max(12, Math.ceil(20 / originalItems.length))
    return Array(multiplier).fill(originalItems).flat()
  }, [originalItems])

  if (originalItems.length === 0) return null

  return (
    <div className="w-full bg-background py-10 border-y border-border/50 overflow-hidden">
      {widget.title && widget.title !== "" && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{widget.title}</h2>
        </div>
      )}
      
      <div className="relative w-full mx-auto flex items-center group">
        <style>{`
          @keyframes marquee-ltr {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee-ltr 30s linear infinite;
          }
          .group:hover .animate-marquee {
            animation-play-state: paused;
          }
        `}</style>

        {/* 
          Using dir="ltr" ensures the translateX(-50%) always moves in the same continuous direction 
          seamlessly, regardless of the document's RTL setting. 
        */}
        <div className="overflow-hidden w-full" dir="ltr">
          <div className="flex w-max animate-marquee">
            {/* Set 1 */}
            <div className="flex">
              {repeatedItems.map((item: any, index: number) => (
                <div key={`set1-${index}`} className="flex-shrink-0 w-32 md:w-48 flex justify-center px-4 md:px-8">
                  {item.buttonUrl ? (
                    <Link href={item.buttonUrl} className="block transition-transform hover:scale-110">
                      <img 
                        src={item.desktopImage} 
                        alt={item.title || "Brand Logo"} 
                        className="h-16 md:h-20 w-auto object-contain transition-all duration-300 filter grayscale hover:grayscale-0"
                      />
                    </Link>
                  ) : (
                    <img 
                      src={item.desktopImage} 
                      alt={item.title || "Brand Logo"} 
                      className="h-16 md:h-20 w-auto object-contain transition-all duration-300 filter grayscale hover:grayscale-0"
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Set 2 (exact duplicate for seamless loop) */}
            <div className="flex">
              {repeatedItems.map((item: any, index: number) => (
                <div key={`set2-${index}`} className="flex-shrink-0 w-32 md:w-48 flex justify-center px-4 md:px-8">
                  {item.buttonUrl ? (
                    <Link href={item.buttonUrl} className="block transition-transform hover:scale-110">
                      <img 
                        src={item.desktopImage} 
                        alt={item.title || "Brand Logo"} 
                        className="h-16 md:h-20 w-auto object-contain transition-all duration-300 filter grayscale hover:grayscale-0"
                      />
                    </Link>
                  ) : (
                    <img 
                      src={item.desktopImage} 
                      alt={item.title || "Brand Logo"} 
                      className="h-16 md:h-20 w-auto object-contain transition-all duration-300 filter grayscale hover:grayscale-0"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
