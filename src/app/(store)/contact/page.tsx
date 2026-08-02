import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "اتصل بنا | عسل",
  description: "تواصل معنا لأي استفسارات",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-foreground">اتصل بنا</h1>
      
      <div className="bg-card rounded-2xl border border-border/50 p-8">
        <p className="text-muted-foreground mb-8 text-lg">
          نحن هنا دائماً لخدمتك والإجابة على جميع استفساراتك. تواصل معنا عبر أي من القنوات التالية:
        </p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">رقم الهاتف / واتساب</h3>
            <p className="text-muted-foreground" dir="ltr">+966 50 000 0000</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">البريد الإلكتروني</h3>
            <p className="text-muted-foreground">support@assal.com</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">ساعات العمل</h3>
            <p className="text-muted-foreground">من الأحد إلى الخميس: 9:00 صباحاً - 5:00 مساءً</p>
          </div>
        </div>
      </div>
    </div>
  )
}
