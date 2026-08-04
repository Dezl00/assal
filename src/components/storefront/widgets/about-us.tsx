import React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function AboutUs({ widget }: { widget?: any }) {
  const title = widget?.title || "من نحن"
  const content = widget?.content || "العسال جروب هي واحدة من الشركات الرائدة التي بدأت في عام 1997، ولها تاريخ طويل من النجاح والتطور في مجالات متعددة، من تجهيز المطابخ الصناعية إلى معدات الأمان، الأثاث والديكور، وغيرها. تعتمد الشركة على معايير عالية في جميع منتجاتها وخدماتها لتلبية إحتياجات عملائها في صعيد مصر."

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <ScrollReveal variant="fade-up">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
          {/* Text Content */}
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">{title}</h2>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
              {content}
            </p>
          </div>
          
          {/* Image Content */}
          <div className="flex-1 w-full">
            <div className="relative aspect-[4/3] sm:aspect-square max-w-lg mx-auto flex items-center justify-center">
              {/* Brand color circle behind the image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 sm:w-[80%] sm:h-[80%] bg-primary rounded-full z-0 opacity-20"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 sm:w-[60%] sm:h-[60%] bg-primary rounded-full z-0"></div>
              
              {/* Product Image */}
              <img 
                src="/images/about-us.png" 
                alt="عن العسال جروب" 
                className="w-full h-full object-contain relative z-10 scale-110"
              />
            </div>
          </div>
          
        </div>
      </ScrollReveal>
    </div>
  )
}
