import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | عسل",
  description: "الأسئلة الشائعة حول المتجر",
}

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-foreground">الأسئلة الشائعة</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-card rounded-2xl border border-border/50">
          <h3 className="text-xl font-bold mb-3">هل المنتجات طبيعية 100%؟</h3>
          <p className="text-muted-foreground leading-relaxed">
            نعم، جميع منتجاتنا من العسل طبيعية 100% وخالية من أي إضافات صناعية أو مواد حافظة، ومفحوصة مخبرياً لضمان أعلى معايير الجودة.
          </p>
        </div>
        
        <div className="p-6 bg-card rounded-2xl border border-border/50">
          <h3 className="text-xl font-bold mb-3">كم يستغرق التوصيل؟</h3>
          <p className="text-muted-foreground leading-relaxed">
            يستغرق التوصيل عادة من يومين إلى 5 أيام عمل داخل المملكة، وقد تختلف المدة حسب المنطقة.
          </p>
        </div>
        
        <div className="p-6 bg-card rounded-2xl border border-border/50">
          <h3 className="text-xl font-bold mb-3">ما هي طرق الدفع المتاحة؟</h3>
          <p className="text-muted-foreground leading-relaxed">
            نوفر خيارات دفع متعددة تشمل البطاقات الائتمانية (فيزا، ماستركارد)، مدى، أبل باي، بالإضافة إلى الدفع عند الاستلام في مناطق محددة.
          </p>
        </div>
        
        <div className="p-6 bg-card rounded-2xl border border-border/50">
          <h3 className="text-xl font-bold mb-3">هل يمكنني استرجاع المنتج؟</h3>
          <p className="text-muted-foreground leading-relaxed">
            نعم، يمكنك استرجاع المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون بحالته الأصلية ولم يتم فتحه أو استخدامه.
          </p>
        </div>
      </div>
    </div>
  )
}
