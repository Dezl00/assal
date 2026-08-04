import React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Lightbulb, Target } from "lucide-react"

export function AboutUs({ widget }: { widget?: any }) {
  const title = widget?.title || "من نحن"
  const content = widget?.settings?.content || widget?.content || "العسال جروب هي واحدة من الشركات الرائدة التي بدأت في عام 1997، ولها تاريخ طويل من النجاح والتطور في مجالات متعددة، من تجهيز المطابخ الصناعية إلى معدات الأمان، الأثاث والديكور، وغيرها. تعتمد الشركة على معايير عالية في جميع منتجاتها وخدماتها لتلبية إحتياجات عملائها في صعيد مصر."
  
  const visionTitle = widget?.settings?.visionTitle || "رؤيتنا"
  const visionContent = widget?.settings?.visionContent || "أن نكون الخيار الأول في صعيد مصر من خلال تقديم منتجات مبتكرة ومتنوعة بأعلى جودة ممكنة في كافة المجالات التي نعمل بها"
  
  const missionTitle = widget?.settings?.missionTitle || "رسالتنا"
  const missionContent = widget?.settings?.missionContent || "توفير حلول شاملة في مجالات تجهيز المطابخ، معدات الأمان، وتصميم الأثاث، مما يساهم في تحسين بيئة العمل المنزلية والصناعية على حد سواء، مع ضمان جودة عالية وخدمة متميزة"

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background curves */}
      <div className="absolute top-1/2 left-0 right-0 h-[600px] w-[150%] -translate-x-[25%] -translate-y-1/2 rounded-[100%] border-[2px] border-primary/20 -z-10 hidden md:block opacity-50"></div>
      
      <ScrollReveal variant="fade-up">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 mb-20">
          
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
              {/* Product Image */}
              <img 
                src={widget?.settings?.image || "/images/about-us.png"} 
                alt="عن العسال جروب" 
                className="w-full h-full object-contain relative z-10 scale-110"
              />
            </div>
          </div>
          
        </div>
      </ScrollReveal>

      {/* Vision & Mission Section */}
      <ScrollReveal variant="fade-up" delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start pt-12 border-t border-border/10 relative z-10 bg-background/50 backdrop-blur-sm rounded-3xl p-8">
          
          {/* Vision */}
          <div className="flex flex-col items-center text-center group">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h3 className="text-3xl font-bold text-foreground">{visionTitle}</h3>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Lightbulb className="w-8 h-8" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground font-medium">
              {visionContent}
            </p>
          </div>

          {/* Mission */}
          <div className="flex flex-col items-center text-center group">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h3 className="text-3xl font-bold text-foreground">{missionTitle}</h3>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground font-medium">
              {missionContent}
            </p>
          </div>
          
        </div>
      </ScrollReveal>
    </div>
  )
}
