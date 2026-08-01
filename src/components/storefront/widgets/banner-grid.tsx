"use client"
import React from "react"
import Link from "next/link"

export function BannerGrid({ widget }: { widget: any }) {
  const items = widget.items || []

  if (items.length === 0) return null

  // If 1 item, full width. If 2, half. If 3+, grid.
  const gridCols = items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {widget.title && (
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{widget.title}</h2>
          {widget.subtitle && <p className="text-muted-foreground mt-2">{widget.subtitle}</p>}
        </div>
      )}
      
      <div className={`grid gap-6 ${gridCols}`}>
        {items.slice(0, 3).map((item: any) => (
          <Link 
            href={item.buttonUrl || "#"} 
            key={item.id}
            className="group relative h-[300px] md:h-[400px] overflow-hidden rounded-2xl block"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${item.desktopImage})` }}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg group-hover:-translate-y-2 transition-transform duration-500">
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
