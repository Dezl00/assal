"use client"

import React, { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSliderWidgetProps {
  widget: any // Type this properly based on Prisma schema with includes
}

export function HeroSliderWidget({ widget }: HeroSliderWidgetProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = widget.items || []

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  if (!slides.length) {
    return <div className="h-64 bg-muted flex items-center justify-center">No slides configured.</div>
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "400px" }}>
      {slides.map((slide: any, index: number) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Background Image logic: use desktopImage or mobileImage based on screen, simplified here */}
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${slide.desktopImage || slide.mobileImage})` }} 
          />
          
          {/* Overlay to ensure text readability if needed (could be configurable in widget) */}
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="max-w-2xl px-4 text-white">
              {slide.title && <h2 className="mb-4 text-4xl font-bold lg:text-6xl">{slide.title}</h2>}
              {slide.subtitle && <p className="mb-8 text-lg lg:text-xl">{slide.subtitle}</p>}
              {slide.buttonText && slide.buttonUrl && (
                <a href={slide.buttonUrl} className="inline-flex h-11 items-center justify-center rounded-none bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  {slide.buttonText}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute start-4 top-1/2 -translate-y-1/2 rounded-full bg-background/50 p-2 text-foreground backdrop-blur hover:bg-background/80"
            aria-label="Previous slide"
          >
            <ChevronRight className="h-6 w-6 rtl-flip" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute end-4 top-1/2 -translate-y-1/2 rounded-full bg-background/50 p-2 text-foreground backdrop-blur hover:bg-background/80"
            aria-label="Next slide"
          >
            <ChevronLeft className="h-6 w-6 rtl-flip" />
          </button>
          
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2 space-x-reverse">
            {slides.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentSlide ? "bg-primary w-6" : "bg-white/50 hover:bg-white"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
