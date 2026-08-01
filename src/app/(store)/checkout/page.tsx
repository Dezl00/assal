"use client"
import React, { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart-store"
import { submitOrder } from "@/features/checkout/actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Loader2, ChevronRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CheckoutPage() {
  const { items, getTotals, clearCart } = useCartStore()
  const { total } = getTotals()
  const router = useRouter()
  
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) {
      toast.error("سلة المشتريات فارغة")
      return
    }

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const data = {
      customerName: formData.get("customerName") as string,
      customerPhone: formData.get("customerPhone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      totalAmount: total,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    }

    const result = await submitOrder(data)
    
    if (result.success && result.orderId) {
      clearCart()
      toast.success("تم إرسال طلبك بنجاح!")
      router.push(`/checkout/success/${result.orderId}`)
    } else {
      toast.error(result.error || "حدث خطأ أثناء معالجة الطلب")
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-50" />
        </div>
        <h1 className="text-3xl font-bold mb-4">سلة المشتريات فارغة</h1>
        <p className="text-muted-foreground mb-8 text-lg">لم تقم بإضافة أي منتجات للسلة بعد.</p>
        <Link href="/products">
          <Button size="lg" className="gold-gradient text-white rounded-2xl px-8 h-14 text-lg">
            تصفح المنتجات
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rtl-flip" />
        <span className="text-foreground font-medium">إتمام الطلب</span>
      </nav>

      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-12">إتمام الطلب</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Customer Details Form */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">بيانات التوصيل</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم الكامل <span className="text-destructive">*</span></label>
                  <input 
                    name="customerName"
                    required
                    placeholder="الاسم الثلاثي"
                    className="w-full h-12 bg-background border border-input rounded-xl px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الجوال <span className="text-destructive">*</span></label>
                  <input 
                    name="customerPhone"
                    required
                    type="tel"
                    dir="ltr"
                    placeholder="05xxxxxxxx"
                    className="w-full h-12 bg-background border border-input rounded-xl px-4 text-right focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">المدينة <span className="text-destructive">*</span></label>
                <input 
                  name="city"
                  required
                  placeholder="مثال: الرياض، جدة، الدمام..."
                  className="w-full h-12 bg-background border border-input rounded-xl px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">عنوان التوصيل بالتفصيل <span className="text-destructive">*</span></label>
                <textarea 
                  name="address"
                  required
                  rows={3}
                  placeholder="اسم الحي، الشارع، رقم المبنى أو أي علامة مميزة"
                  className="w-full bg-background border border-input rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">طريقة الدفع</h2>
            <div className="p-4 rounded-2xl border-2 border-primary bg-primary/5 flex items-center gap-4">
              <div className="w-6 h-6 rounded-full border-4 border-primary bg-background"></div>
              <span className="font-semibold">الدفع عند الاستلام (Cash on Delivery)</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-secondary/30 border border-border/50 rounded-3xl p-8 sticky top-28">
            <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>
            
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-card border border-border overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 m-5 opacity-20" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">الكمية: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-sm">
                    {(item.price * item.quantity).toFixed(2)} ر.س
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold">{total.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                <span className="font-semibold text-primary">مجاني</span>
              </div>
              <div className="h-px bg-border/50 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">الإجمالي</span>
                <span className="text-2xl font-black text-primary">{total.toFixed(2)} ر.س</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 mt-8 rounded-2xl gold-gradient text-white text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جاري تأكيد الطلب...
                </>
              ) : (
                "تأكيد الطلب الآن"
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              بالضغط على تأكيد الطلب، أنت توافق على شروط وأحكام المتجر.
            </p>
          </div>
        </div>
        
      </form>
    </div>
  )
}
