"use client"
import React from "react"
import Link from "next/link"
import { getValidLink } from "@/lib/utils"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function BannerGrid({ widget }: { widget: any }) {
  const items = widget.items || []

  if (items.length === 0) return null

  // If 1 item, full width. If 2, half. If 3+, grid.
  const gridCols = items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'

  // Settings
  const textPosition = widget.settings?.textPosition || "bottom"
  const textAlign = widget.settings?.textAlign || "center"
  const overlayEnabled = widget.settings?.overlayEnabled ?? false
  const overlayOpacity = widget.settings?.overlayOpacity ?? 40

  const flexPosition = 
    textPosition === "top" ? "items-start pt-8" : 
    textPosition === "center" ? "items-center" : 
    "items-end pb-8"
  
  const textJustify = 
    textAlign === "right" ? "justify-end text-right" : 
    textAlign === "left" ? "justify-start text-left" : 
    "justify-center text-center"

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {widget.title && (
        <ScrollReveal variant="fade-up" duration={0.5}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">{widget.title}</h2>
            {widget.subtitle && <p className="text-muted-foreground mt-2">{widget.subtitle}</p>}
          </div>
        </ScrollReveal>
      )}
      
      <div className={`grid gap-6 ${gridCols}`}>
        {items.slice(0, 3).map((item: any, index: number) => (
          <ScrollReveal 
            key={item.id} 
            variant="fade-up"
            delay={index * 0.12}
            duration={0.7}
          >
            <Link 
              href={getValidLink(item.buttonUrl)} 
              className="group relative h-[300px] md:h-[400px] overflow-hidden rounded-2xl block"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${item.desktopImage})` }}
              />
              {overlayEnabled && (
                <div 
                  className="absolute inset-0 transition-colors duration-500" 
                  style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
                />
              )}
              <div className={`absolute inset-0 flex ${flexPosition} p-6`}>
                <div className={`w-full flex ${textJustify}`}>
                  <h3 className="text-2xl md:text-3xl font-semibold text-white transition-transform duration-500 group-hover:-translate-y-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
