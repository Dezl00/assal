"use client"

import React, { useEffect, useState } from "react"
import { Truck, ShieldCheck, Tag } from "lucide-react"

const DEFAULT_FEATURES = [
  { id: 1, title: "شحن سريع", subtitle: "لجميع المدن", icon: Truck },
  { id: 2, title: "ضمان الجودة", subtitle: "أصلية 100%", icon: ShieldCheck },
  { id: 3, title: "أفضل الأسعار", subtitle: "قيمة ممتازة", icon: Tag },
]

export function StoreFeatures({ widget }: { widget?: any }) {
  const items = widget?.items?.length > 0 ? widget.items : DEFAULT_FEATURES
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-slide on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [items.length])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile Slider View */}
      <div className="sm:hidden overflow-hidden bg-card rounded-2xl relative shadow-sm border border-border/50" dir="rtl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            width: `${items.length * 100}%`,
            transform: `translate3d(${currentIndex * (100 / items.length)}%, 0, 0)` 
          }}
        >
          {items.map((item: any, idx: number) => {
            const Icon = item.icon || Truck
            return (
              <div 
                key={item.id || idx} 
                className="flex flex-col items-center justify-center gap-3 py-6 px-2"
                style={{ width: `${100 / items.length}%` }}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 [&>svg]:w-6 [&>svg]:h-6">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title || item.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <Icon strokeWidth={2} />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm mb-0.5 whitespace-nowrap">{item.title || item.name}</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{item.subtitle || item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Dots */}
        {items.length > 1 && (
          <div className="flex justify-center gap-1.5 absolute bottom-2 left-0 right-0">
            {items.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "bg-primary w-4" : "bg-primary/30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Grid View */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item: any, idx: number) => {
          const Icon = item.icon || Truck
          return (
            <div key={item.id || idx} className="bg-card rounded-2xl p-6 flex items-center gap-4 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title || item.name} className="w-8 h-8 object-contain" />
                ) : (
                  <Icon className="w-8 h-8" strokeWidth={2} />
                )}
              </div>
              <div>
                <p className="font-bold text-lg mb-1">{item.title || item.name}</p>
                <p className="text-sm text-muted-foreground">{item.subtitle || item.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
