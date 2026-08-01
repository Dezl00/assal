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
      <div className="w-full h-[60vh] bg-secondary flex items-center justify-center text-muted-foreground">
        لم يتم إضافة صور للسلايدر
      </div>
    )
  }

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-black">
      {slides.map((slide: any, index: number) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Fallback to desktopImage if mobileImage is missing */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${slide.desktopImage})`,
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-24 pb-16">
            <div className="container mx-auto max-w-4xl text-center md:text-right">
              {slide.title && (
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight animate-in slide-in-from-bottom-8 duration-700">
                  {slide.title}
                </h2>
              )}
              {slide.buttonUrl && (
                <div className="animate-in slide-in-from-bottom-12 duration-700 delay-150">
                  <Link href={slide.buttonUrl}>
                    <Button size="lg" className="gold-gradient text-white border-0 px-8 text-lg hover:scale-105 transition-transform">
                      تسوق الآن
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  )
}
