"use client"

import React from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ProductCard } from "@/components/storefront/product-card"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SimilarProductsCarousel({ products }: { products: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", direction: "rtl" },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  )

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group px-2 sm:px-0">
      <div className="overflow-hidden" ref={emblaRef} dir="rtl">
        <div className="flex gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product.id} className="flex-[0_0_240px] sm:flex-[0_0_280px] min-w-0">
              <ProductCard product={product} disableAnimation={true} />
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 -right-3 sm:-right-5 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur shadow-md border-border/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={scrollPrev}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 -left-3 sm:-left-5 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur shadow-md border-border/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={scrollNext}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
    </div>
  )
}
