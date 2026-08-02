"use client"

import React, { useState, useEffect } from "react"
import { Truck, ShieldCheck, Tag } from "lucide-react"

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
  const [isTransitioning, setIsTransitioning] = useState(true)

  // Duplicate the array to create a seamless infinite loop
  const displayFeatures = [...features, ...features]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setActiveIndex((current) => current + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Handle seamless jump when reaching the cloned items
  useEffect(() => {
    if (activeIndex === features.length) {
      // Wait for the slide transition to finish (500ms), then instantly reset to 0
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        setActiveIndex(0)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [activeIndex])

  return (
    <div className="mt-12 mb-8">
      {/* Desktop View: Grid (3 columns) */}
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

      {/* Mobile View: Auto Seamless Slider (2 items visible) */}
      <div className="sm:hidden overflow-hidden bg-card rounded-2xl relative" dir="rtl">
        <div 
          className="flex"
          style={{ 
            width: `${(displayFeatures.length / 2) * 100}%`, // 6 items / 2 visible = 300% width
            transform: `translateX(${activeIndex * (100 / displayFeatures.length)}%)`,
            transitionProperty: 'transform',
            transitionDuration: isTransitioning ? '500ms' : '0ms',
            transitionTimingFunction: 'ease-in-out'
          }}
        >
          {displayFeatures.map((feature, idx) => (
            <div 
              key={idx} 
              className="flex flex-col items-center justify-center gap-3 py-6 px-2"
              style={{ width: `${100 / displayFeatures.length}%` }} // Each item takes its exact fraction
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {/* Slightly smaller icons for mobile to fit 2 neatly */}
                {React.cloneElement(feature.icon as React.ReactElement, { className: "w-6 h-6" })}
              </div>
              <div className="text-center">
                <p className="font-bold text-sm mb-0.5 whitespace-nowrap">{feature.title}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
