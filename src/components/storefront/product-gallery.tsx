"use client"
import React, { useState } from "react"
import { cn } from "@/lib/utils"

export function ProductGallery({ images, productName }: { images: any[], productName: string }) {
  const [activeImage, setActiveImage] = useState(images[0]?.url)

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-2xl border border-border/50">
        <span className="text-muted-foreground">صورة غير متوفرة</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="w-full aspect-square bg-muted rounded-3xl overflow-hidden border border-border/50 relative">
        <img 
          src={activeImage} 
          alt={productName} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => setActiveImage(image.url)}
              className={cn(
                "w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                activeImage === image.url ? "border-primary shadow-lg shadow-primary/20 scale-105" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={image.url} alt="thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
