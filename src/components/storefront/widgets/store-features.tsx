"use client"

import React, { useEffect, useState } from "react"
import { Truck, ShieldCheck, Tag } from "lucide-react"

const DEFAULT_FEATURES = [
  { id: 1, title: "شحن سريع", subtitle: "لجميع المدن", icon: Truck },
  { id: 2, title: "ضمان الجودة", subtitle: "أصلية 100%", icon: ShieldCheck },
  { id: 3, title: "أفضل الأسعار", subtitle: "قيمة ممتازة", icon: Tag },
]

import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function StoreFeatures({ widget }: { widget?: any }) {
  const items = widget?.items?.length > 0 ? widget.items : DEFAULT_FEATURES
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1)
      else if (window.innerWidth < 768) setItemsPerPage(2)
      else if (window.innerWidth < 1024) setItemsPerPage(3)
      else setItemsPerPage(4)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalPages = Math.ceil(items.length / itemsPerPage)

  useEffect(() => {
    if (totalPages <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPages)
    }, 3000)
    return () => clearInterval(interval)
  }, [totalPages])

  const pages = []
  for (let i = 0; i < totalPages; i++) {
    pages.push(items.slice(i * itemsPerPage, (i + 1) * itemsPerPage))
  }

  return (
    <div className="bg-secondary w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <ScrollReveal variant="fade-up">
          <div className="relative max-w-6xl mx-auto">
            <div className="overflow-hidden" dir="rtl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translate3d(${currentIndex * 100}%, 0, 0)` }}
            >
              {pages.map((pageItems, pageIdx) => (
                <div key={pageIdx} className="w-full flex-shrink-0 flex justify-center">
                  {pageItems.map((item: any, idx: number) => {
                    const Icon = item.icon || Truck
                    return (
                      <div 
                        key={item.id || idx} 
                        className="px-4 group"
                        style={{ flexBasis: `${100 / itemsPerPage}%`, maxWidth: `${100 / itemsPerPage}%`, flexGrow: 1 }}
                      >
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary shadow-sm flex items-center justify-center text-primary-foreground mb-4 md:mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:bg-primary/90">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title || item.name} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                            ) : (
                              <Icon className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
                            )}
                          </div>
                          <h3 className="font-semibold text-lg md:text-xl mb-1.5 md:mb-2 text-secondary-foreground">{item.title || item.name}</h3>
                          <p className="text-sm md:text-base text-secondary-foreground/80">{item.subtitle || item.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "bg-primary w-6" 
                      : "bg-secondary-foreground/30 hover:bg-secondary-foreground/60 w-3"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
