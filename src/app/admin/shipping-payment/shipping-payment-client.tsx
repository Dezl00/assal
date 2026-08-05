"use client"
import React, { useState } from "react"
import { Plus, Edit2, Trash2, ShieldCheck, MapPin, CreditCard, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  createGovernorate, updateGovernorate, deleteGovernorate,
  createCity, updateCity, deleteCity,
  createPaymentMethod, updatePaymentMethod, deletePaymentMethod
} from "@/features/shipping-payment/actions"

export function ShippingPaymentClient({ initialGovernorates, initialPaymentMethods }: any) {
  const [activeTab, setActiveTab] = useState<'shipping' | 'payment'>('shipping')
  const [governorates, setGovernorates] = useState(initialGovernorates)
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods)

  const [activeGovId, setActiveGovId] = useState<string | null>(governorates[0]?.id || null)

  // -- Governorate Handlers --
  const handleAddGov = async () => {
    const name = prompt("اسم المحافظة الجديدة:")
    if (!name) return
    const toastId = toast.loading("جاري الإضافة...")
    try {
      const res = await createGovernorate({ name })
      setGovernorates([...governorates, { ...res, cities: [] }])
      setActiveGovId(res.id)
      toast.success("تم الإضافة بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  const handleDeleteGov = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟ سيتم حذف جميع المدن التابعة لها.")) return
    const toastId = toast.loading("جاري الحذف...")
    try {
      await deleteGovernorate(id)
      const newGovs = governorates.filter((g: any) => g.id !== id)
      setGovernorates(newGovs)
      if (activeGovId === id) setActiveGovId(newGovs[0]?.id || null)
      toast.success("تم الحذف بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  // -- City Handlers --
  const handleAddCity = async (govId: string) => {
    const name = prompt("اسم المدينة:")
    if (!name) return
    const costStr = prompt("تسعيرة الشحن (ج.م):", "0")
    if (!costStr) return
    const shippingCost = parseFloat(costStr)

    const toastId = toast.loading("جاري الإضافة...")
    try {
      const res = await createCity({ name, shippingCost, governorateId: govId })
      setGovernorates(governorates.map((g: any) => {
        if (g.id === govId) return { ...g, cities: [...g.cities, res] }
        return g
      }))
      toast.success("تم الإضافة بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  const handleEditCity = async (city: any) => {
    const costStr = prompt(`تسعيرة الشحن لمدينة ${city.name} (ج.م):`, city.shippingCost.toString())
    if (!costStr) return
    const shippingCost = parseFloat(costStr)

    const toastId = toast.loading("جاري التحديث...")
    try {
      const res = await updateCity(city.id, { shippingCost })
      setGovernorates(governorates.map((g: any) => {
        if (g.id === city.governorateId) {
          return { ...g, cities: g.cities.map((c: any) => c.id === city.id ? res : c) }
        }
        return g
      }))
      toast.success("تم التحديث بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  const handleDeleteCity = async (city: any) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return
    const toastId = toast.loading("جاري الحذف...")
    try {
      await deleteCity(city.id)
      setGovernorates(governorates.map((g: any) => {
        if (g.id === city.governorateId) {
          return { ...g, cities: g.cities.filter((c: any) => c.id !== city.id) }
        }
        return g
      }))
      toast.success("تم الحذف بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  // -- Payment Method Handlers --
  const handleAddPayment = async () => {
    const name = prompt("اسم طريقة الدفع (مثال: فودافون كاش، إنستا باي):")
    if (!name) return
    const type = prompt("نوع الدفع (COD, VODAFONE_CASH, INSTAPAY, BANK_TRANSFER):", "VODAFONE_CASH")
    if (!type) return

    const toastId = toast.loading("جاري الإضافة...")
    try {
      const res = await createPaymentMethod({ name, type })
      setPaymentMethods([...paymentMethods, res])
      toast.success("تم الإضافة بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  const handleUpdatePayment = async (id: string, data: any) => {
    const toastId = toast.loading("جاري الحفظ...")
    try {
      const res = await updatePaymentMethod(id, data)
      setPaymentMethods(paymentMethods.map((p: any) => p.id === id ? res : p))
      toast.success("تم الحفظ بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  const handleDeletePayment = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف طريقة الدفع هذه؟")) return
    const toastId = toast.loading("جاري الحذف...")
    try {
      await deletePaymentMethod(id)
      setPaymentMethods(paymentMethods.filter((p: any) => p.id !== id))
      toast.success("تم الحذف بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  const activeGov = governorates.find((g: any) => g.id === activeGovId)

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex-1 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'shipping' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            الشحن والمحافظات
          </div>
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`flex-1 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'payment' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" />
            طرق الدفع
          </div>
        </button>
      </div>

      {activeTab === 'shipping' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 border border-border/50 rounded-xl bg-card overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
              <h3 className="font-bold">المحافظات</h3>
              <Button size="icon" variant="ghost" onClick={handleAddGov} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {governorates.map((g: any) => (
                <div 
                  key={g.id} 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${activeGovId === g.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setActiveGovId(g.id)}
                >
                  <span className="font-medium text-sm truncate">{g.name}</span>
                  <div className="flex items-center opacity-70 hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteGov(g.id); }} className="p-1 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {governorates.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">لا توجد محافظات</p>}
            </div>
          </div>

          <div className="md:col-span-3 border border-border/50 rounded-xl bg-card">
            {activeGov ? (
              <>
                <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">المدن والتسعيرة - {activeGov.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">أضف المدن التابعة لهذه المحافظة لتحديد سعر الشحن الخاص بها.</p>
                  </div>
                  <Button onClick={() => handleAddCity(activeGov.id)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة مدينة
                  </Button>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 rounded-r-lg">المدينة</th>
                          <th className="px-4 py-3">سعر الشحن (ج.م)</th>
                          <th className="px-4 py-3 rounded-l-lg w-24 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeGov.cities.map((city: any) => (
                          <tr key={city.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="px-4 py-4 font-medium">{city.name}</td>
                            <td className="px-4 py-4 font-bold text-primary">{city.shippingCost} ج.م</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleEditCity(city)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteCity(city)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {activeGov.cities.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">لا توجد مدن مضافة.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
                <MapPin className="w-12 h-12 mb-4 opacity-20" />
                <p>يرجى اختيار محافظة أو إضافة واحدة جديدة</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/50">
            <div>
              <h3 className="font-bold">إدارة طرق الدفع</h3>
              <p className="text-sm text-muted-foreground">أضف وحدد طرق الدفع المتاحة للعملاء في صفحة إتمام الطلب.</p>
            </div>
            <Button onClick={handleAddPayment} className="gap-2">
              <Plus className="w-4 h-4" />
              طريقة دفع جديدة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentMethods.map((pm: any) => (
              <div key={pm.id} className="bg-card border border-border/50 rounded-xl p-5 relative group">
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDeletePayment(pm.id)} className="p-1.5 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h4 className="font-bold text-lg mb-1">{pm.name}</h4>
                <span className="text-xs font-bold px-2 py-1 bg-secondary rounded text-secondary-foreground inline-block mb-4">النوع: {pm.type}</span>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">رقم الحساب / الرابط (انستا باي)</label>
                    <input 
                      type="text" 
                      defaultValue={pm.accountInfo || ""}
                      onBlur={(e) => {
                        if (e.target.value !== pm.accountInfo) handleUpdatePayment(pm.id, { accountInfo: e.target.value })
                      }}
                      className="w-full text-sm bg-muted border border-border/50 rounded-md px-3 py-2 outline-none focus:border-primary"
                      placeholder="أدخل الرقم أو الرابط"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">تعليمات الدفع للعميل</label>
                    <textarea 
                      defaultValue={pm.instructions || ""}
                      onBlur={(e) => {
                        if (e.target.value !== pm.instructions) handleUpdatePayment(pm.id, { instructions: e.target.value })
                      }}
                      rows={3}
                      className="w-full text-sm bg-muted border border-border/50 rounded-md px-3 py-2 outline-none focus:border-primary resize-none"
                      placeholder="مثال: يرجى رفع الإيصال بعد التحويل إلى الرقم التالي بخط صغير..."
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer mt-2 pt-2 border-t border-border/30">
                    <input 
                      type="checkbox" 
                      checked={pm.isActive}
                      onChange={(e) => handleUpdatePayment(pm.id, { isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">تفعيل طريقة الدفع</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
