"use client"

import React, { useState, useEffect } from "react"
import { Truck, ShieldCheck, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: <Truck className="w-5 h-5" />,
    title: "شحن سريع",
    subtitle: "لجميع المدن"
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "ضمان الجودة",
    subtitle: "أصلية 100%"
  },
  {
    icon: <Tag className="w-5 h-5" />,
    title: "أفضل الأسعار",
    subtitle: "قيمة ممتازة"
  }
]

export function ProductFeatures() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-8">
      {/* Desktop View: Grid */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3 border border-border/50 rounded-2xl p-4 bg-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {feature.icon}
            </div>
            <div>
              <p className="font-semibold text-sm">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View: Auto Slider (Slide transition) */}
      <div className="sm:hidden overflow-hidden rounded-2xl border border-border/50 bg-card">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        >
          {features.map((feature, idx) => (
            <div key={idx} className="flex-shrink-0 w-full flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {feature.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots indicator for mobile */}
      <div className="flex sm:hidden justify-center gap-1.5 mt-3">
        {features.map((_, idx) => (
          <div 
            key={idx} 
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              activeIndex === idx ? "bg-primary w-4" : "bg-primary/20"
            )}
          />
        ))}
      </div>
    </div>
  )
}
