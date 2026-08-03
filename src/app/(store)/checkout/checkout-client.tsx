"use client"
import React, { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart-store"
import { submitOrder } from "@/features/checkout/actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/store/ui-store"
import { ChevronDown, ShoppingBag, ChevronRight, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CheckoutClient({ user }: { user?: any }) {
  const { items, getTotals, clearCart } = useCartStore()
  const { setAuthModalOpen } = useUIStore()
  const { total } = getTotals()
  const router = useRouter()
  
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [useNewAddress, setUseNewAddress] = useState(!(user?.address && user?.phone))
  
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
    
    let finalPhone = user?.phone || ""
    let finalAddress = user?.address || ""
    let finalCity = "المملكة" // Default or fetched from DB

    if (useNewAddress) {
      finalPhone = formData.get("customerPhone") as string
      finalAddress = formData.get("address") as string
      finalCity = formData.get("city") as string
    }
    
    const data = {
      customerName: user?.name || "عميل",
      customerPhone: finalPhone,
      address: finalAddress,
      city: finalCity,
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
          {!user ? (
            <div className="bg-card border border-border/50 rounded-3xl p-12 shadow-sm text-center flex flex-col items-center justify-center">
              <User className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">تسجيل الدخول مطلوب</h2>
              <p className="text-muted-foreground mb-8">يجب عليك تسجيل الدخول أو إنشاء حساب جديد لإتمام طلبك.</p>
              <Button type="button" size="lg" className="gold-gradient text-white rounded-xl px-8" onClick={() => setAuthModalOpen(true)}>
                تسجيل الدخول / إنشاء حساب
              </Button>
            </div>
          ) : (
          <>
          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">بيانات التوصيل</h2>
            
            {user?.address && user?.phone && (
              <div className="mb-8">
                <div 
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${!useNewAddress ? 'border-primary bg-primary/5' : 'border-border/50'}`}
                  onClick={() => setUseNewAddress(false)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useNewAddress ? 'border-primary' : 'border-muted-foreground'}`}>
                      {!useNewAddress && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="font-bold">استخدام العنوان المحفوظ</span>
                  </div>
                  <div className="mr-8 text-sm text-muted-foreground space-y-1">
                    <p><span className="font-semibold text-foreground">الاسم:</span> {user.name}</p>
                    <p><span className="font-semibold text-foreground">الجوال:</span> <span dir="ltr">{user.phone}</span></p>
                    <p><span className="font-semibold text-foreground">العنوان:</span> {user.address}</p>
                  </div>
                </div>

                <div 
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-colors mt-4 ${useNewAddress ? 'border-primary bg-primary/5' : 'border-border/50'}`}
                  onClick={() => setUseNewAddress(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useNewAddress ? 'border-primary' : 'border-muted-foreground'}`}>
                      {useNewAddress && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="font-bold">إدخال عنوان جديد</span>
                  </div>
                </div>
              </div>
            )}

            {useNewAddress && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاسم الكامل</label>
                    <input 
                      disabled
                      value={user?.name || ""}
                      className="w-full h-12 bg-muted border border-border/50 rounded-xl px-4 opacity-70 cursor-not-allowed"
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
            )}
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">طريقة الدفع</h2>
            <div className="p-4 rounded-2xl border-2 border-primary bg-primary/5 flex items-center gap-4">
              <div className="w-6 h-6 rounded-full border-4 border-primary bg-background"></div>
              <span className="font-semibold">الدفع عند الاستلام (Cash on Delivery)</span>
            </div>
          </div>
          </>
          )}
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="border border-border/50 rounded-3xl p-6 md:p-8 sticky top-28 bg-card shadow-sm">
            <h2 
              className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex justify-between items-center cursor-pointer md:cursor-auto"
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            >
              ملخص الطلب
              <ChevronDown className={`w-5 h-5 md:hidden transition-transform ${isSummaryOpen ? "rotate-180" : ""}`} />
            </h2>
            
            <div className={`space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin md:block ${isSummaryOpen ? "block" : "hidden"}`}>
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 m-3.5 md:m-4 opacity-20" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs md:text-sm font-semibold line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">الكمية: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-xs md:text-sm">
                    {(item.price * item.quantity).toFixed(2)} ج.م
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold">{total.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                <span className="font-semibold text-primary">مجاني</span>
              </div>
              <div className="h-px bg-border/50 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">الإجمالي</span>
                <span className="text-2xl font-black text-primary">{total.toFixed(2)} ج.م</span>
              </div>
            </div>

            {!user ? (
              <Button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault()
                  setAuthModalOpen(true)
                }}
                className="w-full h-14 mt-8 rounded-2xl bg-secondary text-secondary-foreground text-lg font-bold hover:bg-secondary/80 transition-all"
              >
                تسجيل الدخول لإتمام الطلب
              </Button>
            ) : (
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
            )}
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              بالضغط على تأكيد الطلب، أنت توافق على شروط وأحكام المتجر.
            </p>
          </div>
        </div>
        
      </form>
    </div>
  )
}
