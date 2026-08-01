import React from "react"
import { Widget } from "@prisma/client"

// Import specific widget components (to be built)
import { HeroSliderWidget } from "./widgets/HeroSliderWidget"
// import { BannerGridWidget } from "./widgets/BannerGridWidget"
import { ProductGridWidget } from "./widgets/ProductGridWidget"
// import { RichTextWidget } from "./widgets/RichTextWidget"

interface WidgetRendererProps {
  widget: any // Using any here temporarily because Prisma Widget type needs to include nested items
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  // Respect visibility settings (simplified for server-side logic here, but usually needs client-side checks for actual screen sizes if strictly enforced via JS, or just CSS classes)
  const visibilityClasses = [
    !widget.showMobile && "hidden sm:block",
    !widget.showTablet && "sm:hidden md:block lg:block", // Simplified tailwind logic
    !widget.showDesktop && "lg:hidden",
  ].filter(Boolean).join(" ")

  const containerStyle = {
    padding: widget.settings?.padding || "0px",
    margin: widget.settings?.margin || "0px",
    backgroundColor: widget.settings?.bgColor || "transparent",
  }

  // Render logic based on type
  const renderContent = () => {
    switch (widget.type) {
      case "HeroSlider":
        return <HeroSliderWidget widget={widget} />
      case "BannerGrid":
        // return <BannerGridWidget widget={widget} />
        return <div>Banner Grid Placeholder</div>
      case "ProductGrid":
      case "LatestProducts":
      case "BestSellers":
        return <ProductGridWidget widget={widget} />
      case "RichText":
        // return <RichTextWidget widget={widget} />
        return <div>Rich Text Placeholder</div>
      default:
        return (
          <div className="p-4 text-center text-muted-foreground border border-dashed border-border rounded-md">
            Unknown Widget Type: {widget.type}
          </div>
        )
    }
  }

  return (
    <section 
      className={`w-full ${widget.settings?.cssClass || ""} ${visibilityClasses}`}
      style={containerStyle}
      data-widget-id={widget.id}
    >
      {/* Optional Title/Subtitle */}
      {(widget.title || widget.subtitle) && (
        <div className="container mx-auto mb-6 text-center">
          {widget.title && <h2 className="text-3xl font-bold">{widget.title}</h2>}
          {widget.subtitle && <p className="mt-2 text-muted-foreground">{widget.subtitle}</p>}
        </div>
      )}
      
      {/* Container Width Logic */}
      <div className={widget.settings?.containerWidth === "full" ? "w-full" : "container mx-auto"}>
        {renderContent()}
      </div>
    </section>
  )
}
