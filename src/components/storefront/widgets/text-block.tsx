import React from "react"

export function TextBlock({ widget }: { widget: any }) {
  if (!widget.title && !widget.subtitle) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center bg-secondary/30 rounded-3xl p-12 border border-border/50 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <span className="text-4xl mb-4 block">🍯</span>
          {widget.title && <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">{widget.title}</h2>}
          {widget.subtitle && <p className="text-lg text-muted-foreground leading-relaxed">{widget.subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
