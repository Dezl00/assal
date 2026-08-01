import React from "react"
import { HeroSlider } from "./widgets/hero-slider"
import { FeaturedProducts } from "./widgets/featured-products"
import { BannerGrid } from "./widgets/banner-grid"
import { TextBlock } from "./widgets/text-block"

export function WidgetRenderer({ widget }: { widget: any }) {
  // Common visibility classes based on settings
  let visibilityClass = ""
  if (!widget.showDesktop) visibilityClass += " md:hidden"
  if (!widget.showMobile) visibilityClass += " hidden md:block"

  switch (widget.type) {
    case "HeroSlider":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <HeroSlider widget={widget} />
        </section>
      )
    case "FeaturedProducts":
      return (
        <section className={`w-full py-16 ${visibilityClass}`}>
          <FeaturedProducts widget={widget} />
        </section>
      )
    case "BannerGrid":
      return (
        <section className={`w-full py-12 ${visibilityClass}`}>
          <BannerGrid widget={widget} />
        </section>
      )
    case "TextBlock":
      return (
        <section className={`w-full py-16 ${visibilityClass}`}>
          <TextBlock widget={widget} />
        </section>
      )
    default:
      return null
  }
}
