import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "سياسة الشحن والتوصيل | عسل",
  description: "معلومات الشحن والتوصيل",
}

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-foreground">سياسة الشحن والتوصيل</h1>
      
      <div className="bg-card rounded-2xl border border-border/50 p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">مناطق التوصيل</h2>
          <p className="text-muted-foreground leading-relaxed">
            نقوم بالتوصيل إلى جميع مدن ومناطق المملكة العربية السعودية عبر شركائنا المعتمدين لضمان وصول طلباتكم بسرعة وأمان.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">مدة التوصيل</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
            <li>الرياض: التوصيل خلال 24 - 48 ساعة من تأكيد الطلب.</li>
            <li>باقي مدن المملكة: التوصيل خلال 2 إلى 5 أيام عمل.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">تكلفة الشحن</h2>
          <p className="text-muted-foreground leading-relaxed">
            تكلفة الشحن الثابتة هي 29 ريال سعودي لجميع الطلبات. ونقدم شحناً مجانياً للطلبات التي تتجاوز قيمتها 300 ريال سعودي.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">تتبع الطلب</h2>
          <p className="text-muted-foreground leading-relaxed">
            بمجرد شحن طلبك، ستتلقى رسالة نصية وبريداً إلكترونياً يحتوي على رقم التتبع لتتمكن من متابعة حالة الشحنة مع شركة التوصيل.
          </p>
        </section>
      </div>
    </div>
  )
}
