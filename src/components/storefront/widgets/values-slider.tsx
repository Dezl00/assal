"use client"

import React, { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Leaf, Lightbulb, Star, Award } from "lucide-react"

const DEFAULT_VALUES = [
  { id: 1, title: "الإستدامة", icon: Leaf },
  { id: 2, title: "الإبتكار", icon: Lightbulb },
  { id: 3, title: "التميز", icon: Star },
  { id: 4, title: "الجودة", icon: Award },
]

export function ValuesSlider({ widget }: { widget?: any }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "center",
      direction: "rtl"
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  useEffect(() => {
    if (!emblaApi) return

    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    })
  }, [emblaApi])

  const items = widget?.items?.length > 0 ? widget.items : DEFAULT_VALUES

  return (
    <div className="bg-primary py-16 text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{widget?.title || "قيمنا"}</h2>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden" ref={emblaRef} dir="rtl">
              <div className="flex -ml-4">
                {items.map((item: any, idx: number) => {
                  const Icon = item.icon || Leaf
                  
                  return (
                    <div 
                      key={item.id || idx} 
                      className="flex-[0_0_50%] sm:flex-[0_0_33.333%] md:flex-[0_0_25%] min-w-0 pl-4"
                    >
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center mb-4 text-primary shadow-lg transition-transform hover:scale-105">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title || item.name} className="w-16 h-16 object-contain" />
                          ) : (
                            <Icon className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5} />
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold">{item.title || item.name}</h3>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === selectedIndex 
                      ? "bg-white w-6" 
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
