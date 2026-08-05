"use client"

import React, { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ProductCard } from "@/components/storefront/product-card"
import { ChevronRight, ChevronLeft } from "lucide-react"

export function SimilarProductsCarousel({ products }: { products: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", direction: "rtl", dragFree: true },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on("reInit", onInit)
    emblaApi.on("reInit", onSelect)
    emblaApi.on("select", onSelect)
  }, [emblaApi, onInit, onSelect])

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group px-2 sm:px-0">
      <div className="overflow-hidden" ref={emblaRef} dir="rtl">
        <div className="flex gap-4 sm:gap-6 pb-2">
          {products.map((product) => (
            <div key={product.id} className="flex-[0_0_70%] sm:flex-[0_0_280px] min-w-0">
              <ProductCard product={product} disableAnimation={true} />
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute top-[40%] -right-3 sm:-right-5 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-md shadow-md border border-border/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center hover:bg-background/90 hover:scale-105"
        onClick={scrollPrev}
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>

      <button
        className="absolute top-[40%] -left-3 sm:-left-5 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-md shadow-md border border-border/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center hover:bg-background/90 hover:scale-105"
        onClick={scrollNext}
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex justify-center gap-2 mt-4">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "w-6 bg-primary"
                : "w-2 bg-primary/20 hover:bg-primary/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
