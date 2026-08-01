import React from "react"
import Link from "next/link"

export function BrandSlider({ widget }: { widget: any }) {
  const items = widget.items || []
  
  if (items.length === 0) return null

  // Duplicate items to ensure infinite scroll is smooth
  const duplicatedItems = [...items, ...items, ...items]

  return (
    <div className="w-full overflow-hidden bg-background py-8 border-y border-border/50">
      {widget.title && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">{widget.title}</h2>
        </div>
      )}
      
      <div className="relative flex max-w-full overflow-hidden group">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
          {duplicatedItems.map((item: any, index: number) => (
            <div key={`${item.id}-${index}`} className="flex-shrink-0 mx-8">
              {item.buttonUrl ? (
                <Link href={item.buttonUrl} className="block transition-transform hover:scale-110">
                  <img 
                    src={item.desktopImage} 
                    alt={item.title || "Brand Logo"} 
                    className="h-16 md:h-20 w-auto object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
                  />
                </Link>
              ) : (
                <img 
                  src={item.desktopImage} 
                  alt={item.title || "Brand Logo"} 
                  className="h-16 md:h-20 w-auto object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
                />
              )}
            </div>
          ))}
        </div>
        
        {/* We need a second track for a seamless loop */}
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap absolute top-0" style={{ left: '100%' }}>
          {duplicatedItems.map((item: any, index: number) => (
            <div key={`second-${item.id}-${index}`} className="flex-shrink-0 mx-8">
              {item.buttonUrl ? (
                <Link href={item.buttonUrl} className="block transition-transform hover:scale-110">
                  <img 
                    src={item.desktopImage} 
                    alt={item.title || "Brand Logo"} 
                    className="h-16 md:h-20 w-auto object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
                  />
                </Link>
              ) : (
                <img 
                  src={item.desktopImage} 
                  alt={item.title || "Brand Logo"} 
                  className="h-16 md:h-20 w-auto object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
