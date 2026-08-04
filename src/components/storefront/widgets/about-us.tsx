import React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function AboutUs({ widget }: { widget?: any }) {
  const title = widget?.title || "من نحن"
  const content = widget?.content || "العسال جروب هي واحدة من الشركات الرائدة التي بدأت في عام 1997، ولها تاريخ طويل من النجاح والتطور في مجالات متعددة، من تجهيز المطابخ الصناعية إلى معدات الأمان، الأثاث والديكور، وغيرها. تعتمد الشركة على معايير عالية في جميع منتجاتها وخدماتها لتلبية إحتياجات عملائها في صعيد مصر."

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <ScrollReveal variant="fade-up">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">{title}</h2>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
            {content}
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
