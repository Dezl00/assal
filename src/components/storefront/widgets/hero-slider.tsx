"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"

export function HeroSlider({ widget }: { widget: any }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = widget.items || []

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full h-[50vh] md:h-[70vh] rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
          لم يتم إضافة صور للسلايدر
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden bg-black rounded-2xl" dir="ltr">
        {slides.map((slide: any, index: number) => {
          const offset = (currentSlide - index) * 100;
          return (
            <div 
              key={slide.id}
              className="absolute inset-0 transition-transform duration-700 ease-in-out w-full h-full"
              style={{ transform: `translateX(${offset}%)` }}
              dir="rtl"
            >
              {/* Fallback to desktopImage if mobileImage is missing */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${slide.desktopImage})`,
                }}
              />
              {/* Content Container (Removed dark gradient shadow) */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-24 pb-16">
                <div className="container mx-auto max-w-4xl text-center md:text-right">
                  {slide.title && (
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight animate-in slide-in-from-bottom-8 duration-700 drop-shadow-md">
                      {slide.title}
                    </h2>
                  )}
                  {slide.buttonUrl && (
                    <div className="animate-in slide-in-from-bottom-12 duration-700 delay-150">
                      <Link href={slide.buttonUrl}>
                        <Button size="lg" className="gold-gradient text-white border-0 px-8 text-lg hover:scale-105 transition-transform shadow-md">
                          تسوق الآن
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              aria-label="Previous slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              aria-label="Next slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {slides.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === idx 
                      ? "w-8 h-2.5 bg-primary" 
                      : "w-2.5 h-2.5 bg-white/50 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
