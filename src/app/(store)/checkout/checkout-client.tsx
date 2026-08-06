"use client"
import React, { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart-store"
import { submitOrder, validateCoupon } from "@/features/checkout/actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/store/ui-store"
import { ChevronDown, ShoppingBag, ChevronRight, User, Loader2, Tag, Truck } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CheckoutClient({ user, governorates = [], paymentMethods = [], settings = {} }: any) {
  const { items, getTotals, clearCart } = useCartStore()
  const { setAuthModalOpen } = useUIStore()
  const { total } = getTotals()
  const router = useRouter()
  
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  
  // -- Shipping State --
  const hasSavedAddress = !!(user?.address && user?.phone && user?.city)
  const [useNewAddress, setUseNewAddress] = useState(!hasSavedAddress)
  const [selectedGovId, setSelectedGovId] = useState("")
  const [selectedCityId, setSelectedCityId] = useState("")
  
  // -- Payment State --
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0]?.id || "")
  
  // -- Coupon State --
  const [couponCodeInput, setCouponCodeInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // -- Calculations --
  const selectedGov = governorates.find((g: any) => g.id === selectedGovId)
  const selectedCity = selectedGov?.cities.find((c: any) => c.id === selectedCityId)
  
  let baseShippingCost = 0
  let isShippingCalculated = false

  if (useNewAddress) {
    if (selectedCity) {
      baseShippingCost = selectedCity.shippingCost
      isShippingCalculated = true
    }
  } else if (user?.city) {
    for (const gov of governorates) {
      const c = gov.cities.find((city: any) => city.name === user.city)
      if (c) {
        baseShippingCost = c.shippingCost
        isShippingCalculated = true
        break
      }
    }
  }
  
  const hasThreshold = settings?.freeShippingThreshold !== null && settings?.freeShippingThreshold !== undefined;
  const isFreeShippingThresholdMet = hasThreshold && total >= settings.freeShippingThreshold!;
  const isFreeShippingCoupon = appliedCoupon?.type === "FREE_SHIPPING"
  
  const finalShippingCost = (isFreeShippingThresholdMet || isFreeShippingCoupon) ? 0 : baseShippingCost
  
  let discountAmount = 0
  if (appliedCoupon && appliedCoupon.type !== "FREE_SHIPPING") {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmount = total * (appliedCoupon.value / 100)
    } else if (appliedCoupon.type === "FIXED") {
      discountAmount = appliedCoupon.value
    }
  }
  
  const finalTotal = Math.max(0, total + finalShippingCost - discountAmount)

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return
    setIsValidatingCoupon(true)
    try {
      const res = await validateCoupon(couponCodeInput)
      if (res.error) {
        toast.error(res.error)
        setAppliedCoupon(null)
      } else {
        setAppliedCoupon(res.coupon)
        toast.success("تم تفعيل الكوبون بنجاح")
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء تفعيل الكوبون")
    }
    setIsValidatingCoupon(false)
  }

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
    let finalCity = user?.city || ""
    let finalGovName = ""

    if (useNewAddress) {
      finalPhone = formData.get("customerPhone") as string
      finalAddress = formData.get("address") as string
      if (!selectedGov || !selectedCity) {
        toast.error("يرجى اختيار المحافظة والمدينة")
        setIsSubmitting(false)
        return
      }
      finalGovName = selectedGov.name
      finalCity = selectedCity.name
    } else if (!hasSavedAddress) {
        toast.error("يرجى إدخال عنوان التوصيل")
        setIsSubmitting(false)
        return
    }

    const selectedPayment = paymentMethods.find((p: any) => p.id === selectedPaymentId)
    if (!selectedPayment) {
      toast.error("يرجى اختيار طريقة الدفع")
      setIsSubmitting(false)
      return
    }

    const data: any = {
      customerName: user?.name || "عميل",
      customerPhone: finalPhone,
      address: finalAddress,
      city: finalCity,
      governorate: finalGovName,
      paymentMethod: selectedPayment.name,
      shippingCost: finalShippingCost,
      discount: discountAmount,
      couponCode: appliedCoupon?.code,
      totalAmount: finalTotal,
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    }
    
    if (user?.id) {
      data.userId = user.id
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
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 h-14 text-lg">
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
              <Button type="button" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8" onClick={() => setAuthModalOpen(true)}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">المحافظة <span className="text-destructive">*</span></label>
                    <select 
                      required
                      value={selectedGovId}
                      onChange={(e) => {
                        setSelectedGovId(e.target.value)
                        setSelectedCityId("")
                      }}
                      className="w-full h-12 bg-background border border-input rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="" disabled>اختر المحافظة...</option>
                      {governorates.map((g: any) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">المدينة / المنطقة <span className="text-destructive">*</span></label>
                    <select 
                      required
                      disabled={!selectedGovId}
                      value={selectedCityId}
                      onChange={(e) => setSelectedCityId(e.target.value)}
                      className="w-full h-12 bg-background border border-input rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                    >
                      <option value="" disabled>اختر المدينة...</option>
                      {selectedGov?.cities?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((pm: any) => (
                <div 
                  key={pm.id}
                  onClick={() => setSelectedPaymentId(pm.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-colors flex flex-col gap-2 ${selectedPaymentId === pm.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPaymentId === pm.id ? 'border-primary' : 'border-muted-foreground'}`}>
                      {selectedPaymentId === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="font-bold">{pm.name}</span>
                  </div>
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <p className="text-muted-foreground text-sm col-span-full">عذراً، لا تتوفر طرق دفع حالياً.</p>
              )}
            </div>

            {/* Selected Payment Instructions */}
            {paymentMethods.find((p: any) => p.id === selectedPaymentId)?.instructions && (
              <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {paymentMethods.find((p: any) => p.id === selectedPaymentId)?.instructions}
                </p>
                {paymentMethods.find((p: any) => p.id === selectedPaymentId)?.type === "INSTAPAY" && paymentMethods.find((p: any) => p.id === selectedPaymentId)?.accountInfo && (
                  <a 
                    href={paymentMethods.find((p: any) => p.id === selectedPaymentId)?.accountInfo}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg mt-4 text-sm font-bold hover:bg-slate-800 transition-colors"
                  >
                    التوجه إلى الرابط
                  </a>
                )}
              </div>
            )}
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
              
              {/* Coupon Input */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  placeholder="كود الخصم" 
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  disabled={!!appliedCoupon}
                  dir="ltr"
                  className="flex-1 min-w-0 h-12 bg-background border border-input rounded-xl px-4 text-right outline-none focus:border-primary disabled:opacity-50"
                />
                {!appliedCoupon ? (
                  <Button 
                    type="button" 
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCodeInput.trim()}
                    className="h-12 px-6 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold shrink-0 w-full sm:w-auto"
                  >
                    {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق"}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={() => { setAppliedCoupon(null); setCouponCodeInput(""); }}
                    variant="destructive"
                    className="h-12 px-6 rounded-xl font-bold shrink-0 w-full sm:w-auto"
                  >
                    إلغاء
                  </Button>
                )}
              </div>
              
              {appliedCoupon && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                  <Tag className="w-4 h-4" />
                  تم تطبيق كود الخصم: {appliedCoupon.code}
                </div>
              )}

              <div className="h-px bg-border/50 my-2" />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold">{total.toFixed(2)} ج.م</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>الخصم {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}</span>
                  <span className="font-bold">- {discountAmount.toFixed(2)} ج.م</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                {!isShippingCalculated ? (
                  <span className="font-semibold text-muted-foreground">يحدد حسب العنوان</span>
                ) : finalShippingCost === 0 ? (
                  <span className="font-semibold text-primary">مجاني</span>
                ) : (
                  <span className="font-semibold">{finalShippingCost.toFixed(2)} ج.م</span>
                )}
              </div>
              
              {(isFreeShippingThresholdMet || isFreeShippingCoupon) && finalShippingCost === 0 && (
                <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 p-2 rounded border border-primary/20">
                  <Truck className="w-3.5 h-3.5" />
                  أنت مؤهل للحصول على شحن مجاني!
                </div>
              )}

              <div className="h-px bg-border/50 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">الإجمالي</span>
                <span className="text-2xl font-black text-primary">{finalTotal.toFixed(2)} ج.م</span>
              </div>
            </div>

            {!user ? (
              <Button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault()
                  setAuthModalOpen(true)
                }}
                className="w-full h-14 mt-8 rounded-2xl bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90 transition-all"
              >
                تسجيل الدخول لإتمام الطلب
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 mt-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
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
