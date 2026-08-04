"use client"

import React from "react"
import { Truck, ShieldCheck, Tag } from "lucide-react"

const DEFAULT_FEATURES = [
  { id: 1, title: "شحن سريع", subtitle: "لجميع المدن", icon: Truck },
  { id: 2, title: "ضمان الجودة", subtitle: "أصلية 100%", icon: ShieldCheck },
  { id: 3, title: "أفضل الأسعار", subtitle: "قيمة ممتازة", icon: Tag },
]

export function StoreFeatures({ widget }: { widget?: any }) {
  const items = widget?.items?.length > 0 ? widget.items : DEFAULT_FEATURES

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex flex-wrap justify-center items-start gap-8 md:gap-12 lg:gap-16">
        {items.map((item: any, idx: number) => {
          const Icon = item.icon || Truck
          return (
            <div 
              key={item.id || idx} 
              className="flex flex-col items-center justify-center text-center w-[40%] sm:w-[25%] lg:w-[20%] min-w-[140px] group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 md:mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title || item.name} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                ) : (
                  <Icon className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
                )}
              </div>
              <h3 className="font-bold text-lg md:text-xl mb-1.5 md:mb-2 text-foreground">{item.title || item.name}</h3>
              <p className="text-sm md:text-base text-muted-foreground">{item.subtitle || item.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
