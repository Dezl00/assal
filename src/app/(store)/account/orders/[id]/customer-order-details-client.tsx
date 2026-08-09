"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"

export function CustomerOrderDetailsClient({ order }: { order: any }) {
  const router = useRouter()
  const [isCancelling, setIsCancelling] = useState(false)

  const statusLabels: Record<string, string> = {
    "PENDING": "قيد المراجعة",
    "CONFIRMED": "تم التأكيد",
    "SHIPPED": "جاري الشحن",
    "OUT_FOR_DELIVERY": "خرج للتوصيل",
    "DELIVERED": "تم التوصيل",
    "CANCELLED": "ملغي"
  }

  const cancelOrder = async () => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;
    setIsCancelling(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" })
      if (res.ok) {
        toast.success("تم إلغاء الطلب بنجاح")
        router.refresh()
      } else {
        toast.error("حدث خطأ أو أن الطلب لا يمكن إلغاؤه")
      }
    } catch (e) {
      toast.error("حدث خطأ")
    }
    setIsCancelling(false)
  }

  const getStatusStep = (status: string) => {
    switch(status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'SHIPPED': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      default: return 0;
    }
  }

  const enDate = (dateString: string) => {
    const d = new Date(dateString)
    return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}`
  }
  
  const enNumber = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/account?tab=orders" className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ArrowRight className="w-4 h-4" />
          عودة للطلبات
        </Link>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Package className="w-6 h-6 text-primary" />
              تفاصيل الطلب <span className="font-sans text-primary ml-1" dir="ltr">#{order.id.slice(-6).toUpperCase()}</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-sans" dir="ltr">{enDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-lg bg-primary/10 text-primary">
              {statusLabels[order.status] || order.status}
            </span>
          </div>
        </div>

        {/* Timeline */}
        {order.status !== 'CANCELLED' ? (
          <div className="relative pt-6 pb-12 mb-8 border-b border-border/50 px-4">
            <div className="absolute top-10 left-8 right-8 h-1.5 bg-muted rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${((getStatusStep(order.status) - 1) / 4) * 100}%` }}></div>
            </div>
            <div className="relative flex justify-between">
               {[
                 { step: 1, label: 'قيد المراجعة', icon: Clock },
                 { step: 2, label: 'تم التأكيد', icon: CheckCircle2 },
                 { step: 3, label: 'جاري الشحن', icon: Truck },
                 { step: 4, label: 'خرج للتوصيل', icon: Truck },
                 { step: 5, label: 'تم التوصيل', icon: CheckCircle2 }
               ].map((s) => (
                 <div key={s.step} className="flex flex-col items-center gap-3">
                   <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center relative z-10 transition-colors shadow-sm ${getStatusStep(order.status) >= s.step ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-muted-foreground'}`}>
                     <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                   </div>
                   <span className={`text-[10px] sm:text-xs font-bold text-center w-16 sm:w-auto ${getStatusStep(order.status) >= s.step ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
                 </div>
               ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center gap-3">
            <XCircle className="w-6 h-6" />
            <span className="font-bold text-lg">لقد تم إلغاء هذا الطلب</span>
          </div>
        )}

        {/* Products */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-bold">المنتجات المطلوبة</h3>
          <div className="divide-y divide-border/50 border border-border/50 rounded-xl overflow-hidden">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className="w-16 h-16 bg-background rounded-lg border border-border overflow-hidden shrink-0">
                  {item.product?.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 m-4 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{item.product?.name || "منتج غير معروف"}</h4>
                  <p className="text-xs text-muted-foreground mt-1">الكمية: <span className="font-sans font-bold" dir="ltr">{item.quantity}</span></p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary font-sans" dir="ltr">{enNumber(item.price * item.quantity)} EGP</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-bold border-b border-border/50 pb-2">عنوان التوصيل</h3>
            <div className="text-sm text-muted-foreground space-y-2 bg-muted/30 p-4 rounded-xl border border-border/50">
              <p><span className="font-medium text-foreground">المدينة:</span> {order.city}</p>
              <p><span className="font-medium text-foreground">العنوان:</span> {order.address}</p>
              {order.country && <p><span className="font-medium text-foreground">الدولة:</span> {order.country}</p>}
              {order.postalCode && <p><span className="font-medium text-foreground">الرمز البريدي:</span> <span className="font-sans">{order.postalCode}</span></p>}
              <p><span className="font-medium text-foreground">رقم الهاتف:</span> <span className="font-sans" dir="ltr">{order.phone}</span></p>
            </div>
          </div>
          
          <div className="flex-1 bg-muted/30 rounded-xl p-6 border border-border/50">
            <h3 className="text-lg font-bold border-b border-border/50 pb-2 mb-4">ملخص الدفع</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-sans font-medium" dir="ltr">{enNumber(order.totalAmount - (order.shippingCost || 0) + (order.discount || 0))} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تكلفة الشحن</span>
                <span className="font-sans font-medium" dir="ltr">{enNumber(order.shippingCost || 0)} EGP</span>
              </div>
              {(order.discount > 0) && (
                <div className="flex justify-between text-destructive">
                  <span>الخصم</span>
                  <span className="font-sans font-medium" dir="ltr">-{enNumber(order.discount)} EGP</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-border/50 pt-4 mt-2">
                <span>الإجمالي</span>
                <span className="font-sans text-primary" dir="ltr">{enNumber(order.totalAmount)} EGP</span>
              </div>
            </div>
          </div>
        </div>

        {(order.status === 'PENDING' || order.status === 'PAID') && (
          <div className="mt-8 pt-6 border-t border-border/50 flex justify-end">
            <Button 
              variant="destructive" 
              onClick={cancelOrder} 
              disabled={isCancelling}
              className="w-full md:w-auto"
            >
              إلغاء الطلب
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
