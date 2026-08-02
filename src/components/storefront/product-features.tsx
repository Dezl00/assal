"use client"

import React, { useState, useEffect } from "react"
import { Truck, ShieldCheck, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: <Truck className="w-8 h-8" />,
    title: "شحن سريع",
    subtitle: "لجميع المدن"
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "ضمان الجودة",
    subtitle: "أصلية 100%"
  },
  {
    icon: <Tag className="w-8 h-8" />,
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
    <div className="mt-12 mb-8">
      {/* Desktop View: Grid */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center gap-4 p-6 bg-card rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110 duration-300">
              {feature.icon}
            </div>
            <div className="text-center">
              <p className="font-bold text-lg mb-1">{feature.title}</p>
              <p className="text-sm text-muted-foreground">{feature.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View: Auto Slider (Slide transition) */}
      <div className="sm:hidden overflow-hidden bg-card rounded-2xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        >
          {features.map((feature, idx) => (
            <div key={idx} className="flex-shrink-0 w-full flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {feature.icon}
              </div>
              <div className="text-center">
                <p className="font-bold text-lg mb-1">{feature.title}</p>
                <p className="text-sm text-muted-foreground">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots indicator for mobile */}
      <div className="flex sm:hidden justify-center gap-2 mt-4">
        {features.map((_, idx) => (
          <div 
            key={idx} 
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              activeIndex === idx ? "bg-primary w-6" : "bg-primary/20"
            )}
          />
        ))}
      </div>
    </div>
  )
}
