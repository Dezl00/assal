import React from "react"
import { db } from "@/lib/db"
import Link from "next/link"
import { CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function CheckoutSuccessPage({ params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } }
  })

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-destructive">لم يتم العثور على الطلب</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
      <div className="bg-card border border-border/50 rounded-3xl p-8 sm:p-12 text-center shadow-lg shadow-primary/5">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4">شكراً لتسوقك معنا!</h1>
        <p className="text-lg text-muted-foreground mb-2">تم استلام طلبك بنجاح وجاري تجهيزه.</p>
        <p className="text-sm text-muted-foreground mb-8">
          رقم الطلب: <span className="font-mono font-bold text-foreground">#{order.id.slice(-8).toUpperCase()}</span>
        </p>

        <div className="bg-secondary/30 rounded-2xl p-6 mb-8 text-right">
          <h3 className="font-bold mb-4">تفاصيل التوصيل:</h3>
          <p className="text-sm mb-2"><span className="text-muted-foreground">الاسم:</span> {order.customerName}</p>
          <p className="text-sm mb-2"><span className="text-muted-foreground">الجوال:</span> <span dir="ltr">{order.customerPhone}</span></p>
          <p className="text-sm mb-2"><span className="text-muted-foreground">العنوان:</span> {order.city} - {order.address}</p>
          <p className="text-sm font-bold text-primary mt-4">الإجمالي المدفوع: {order.totalAmount.toFixed(2)} ر.س (الدفع عند الاستلام)</p>
        </div>

        <Link href="/">
          <Button size="lg" className="gold-gradient text-white rounded-2xl px-8 h-14 text-lg w-full sm:w-auto">
            العودة للصفحة الرئيسية
          </Button>
        </Link>
      </div>
    </div>
  )
}
