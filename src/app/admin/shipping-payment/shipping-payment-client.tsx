"use client"
import React, { useState } from "react"
import { Plus, Edit2, Trash2, ShieldCheck, MapPin, CreditCard, Save, X, AlertTriangle } from "lucide-react"
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

  // Modals / Inline states
  const [isAddingGov, setIsAddingGov] = useState(false)
  const [newGovName, setNewGovName] = useState("")

  const [isAddingCity, setIsAddingCity] = useState(false)
  const [newCityName, setNewCityName] = useState("")
  const [newCityCost, setNewCityCost] = useState("0")

  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [newPayment, setNewPayment] = useState({ name: "", type: "VODAFONE_CASH" })

  const [deleteModal, setDeleteModal] = useState<{ type: 'gov' | 'city' | 'payment', id: string, name?: string } | null>(null)

  // -- Governorate Handlers --
  const handleAddGov = async () => {
    if (!newGovName.trim()) return
    const toastId = toast.loading("جاري الإضافة...")
    try {
      const res = await createGovernorate({ name: newGovName })
      setGovernorates([...governorates, { ...res, cities: [] }])
      setActiveGovId(res.id)
      setIsAddingGov(false)
      setNewGovName("")
      toast.success("تم الإضافة بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  // -- City Handlers --
  const handleAddCity = async (govId: string) => {
    if (!newCityName.trim() || !newCityCost) return
    const shippingCost = parseFloat(newCityCost)
    
    const toastId = toast.loading("جاري الإضافة...")
    try {
      const res = await createCity({ name: newCityName, shippingCost, governorateId: govId })
      setGovernorates(governorates.map((g: any) => {
        if (g.id === govId) return { ...g, cities: [...g.cities, res] }
        return g
      }))
      setIsAddingCity(false)
      setNewCityName("")
      setNewCityCost("0")
      toast.success("تم الإضافة بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    }
  }

  const handleEditCity = async (city: any, newCost: number) => {
    const toastId = toast.loading("جاري التحديث...")
    try {
      const res = await updateCity(city.id, { shippingCost: newCost })
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

  // -- Payment Method Handlers --
  const handleAddPayment = async () => {
    if (!newPayment.name.trim()) return
    const toastId = toast.loading("جاري الإضافة...")
    try {
      const res = await createPaymentMethod(newPayment)
      setPaymentMethods([...paymentMethods, res])
      setIsAddingPayment(false)
      setNewPayment({ name: "", type: "VODAFONE_CASH" })
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

  const confirmDelete = async () => {
    if (!deleteModal) return
    const { type, id } = deleteModal
    const toastId = toast.loading("جاري الحذف...")
    try {
      if (type === 'gov') {
        await deleteGovernorate(id)
        const newGovs = governorates.filter((g: any) => g.id !== id)
        setGovernorates(newGovs)
        if (activeGovId === id) setActiveGovId(newGovs[0]?.id || null)
      } else if (type === 'city') {
        await deleteCity(id)
        setGovernorates(governorates.map((g: any) => {
          return { ...g, cities: g.cities.filter((c: any) => c.id !== id) }
        }))
      } else if (type === 'payment') {
        await deletePaymentMethod(id)
        setPaymentMethods(paymentMethods.filter((p: any) => p.id !== id))
      }
      toast.success("تم الحذف بنجاح", { id: toastId })
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: toastId })
    } finally {
      setDeleteModal(null)
    }
  }

  const activeGov = governorates.find((g: any) => g.id === activeGovId)

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
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
              <Button size="icon" variant="ghost" onClick={() => setIsAddingGov(true)} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {isAddingGov && (
              <div className="p-3 border-b border-border/50 bg-muted/20 space-y-2">
                <input 
                  type="text"
                  placeholder="اسم المحافظة..."
                  value={newGovName}
                  onChange={e => setNewGovName(e.target.value)}
                  className="w-full text-sm bg-background border border-input rounded-md px-3 py-2 outline-none focus:border-primary"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleAddGov}>حفظ</Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setIsAddingGov(false)}>إلغاء</Button>
                </div>
              </div>
            )}

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {governorates.map((g: any) => (
                <div 
                  key={g.id} 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${activeGovId === g.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setActiveGovId(g.id)}
                >
                  <span className="font-medium text-sm truncate">{g.name}</span>
                  <div className="flex items-center opacity-70 hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ type: 'gov', id: g.id, name: g.name }); }} className="p-1 hover:text-red-300">
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
                <div className="p-4 sm:p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">المدن والتسعيرة - {activeGov.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">أضف المدن التابعة لهذه المحافظة لتحديد سعر الشحن الخاص بها.</p>
                  </div>
                  {!isAddingCity && (
                    <Button onClick={() => setIsAddingCity(true)} className="gap-2 shrink-0">
                      <Plus className="w-4 h-4" />
                      إضافة مدينة
                    </Button>
                  )}
                </div>

                {isAddingCity && (
                  <div className="p-4 bg-muted/20 border-b border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold">اسم المدينة</label>
                      <input 
                        type="text" 
                        value={newCityName}
                        onChange={e => setNewCityName(e.target.value)}
                        className="w-full text-sm bg-background border border-input rounded-md px-3 py-2 outline-none focus:border-primary"
                        placeholder="مثال: مدينة نصر"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold">سعر الشحن (ج.م)</label>
                      <input 
                        type="number" 
                        value={newCityCost}
                        onChange={e => setNewCityCost(e.target.value)}
                        className="w-full text-sm bg-background border border-input rounded-md px-3 py-2 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleAddCity(activeGov.id)} className="flex-1">حفظ</Button>
                      <Button variant="outline" onClick={() => setIsAddingCity(false)}>إلغاء</Button>
                    </div>
                  </div>
                )}

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
                            <td className="px-4 py-4 font-bold text-primary">
                              <input 
                                type="number"
                                defaultValue={city.shippingCost}
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value)
                                  if (val !== city.shippingCost && !isNaN(val)) handleEditCity(city, val)
                                }}
                                className="w-24 bg-transparent border-b border-border/50 text-center outline-none focus:border-primary ml-1 px-1 py-0.5"
                              />
                              ج.م
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setDeleteModal({ type: 'city', id: city.id, name: city.name })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
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
            {!isAddingPayment && (
              <Button onClick={() => setIsAddingPayment(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                طريقة دفع جديدة
              </Button>
            )}
          </div>

          {isAddingPayment && (
            <div className="bg-card border-2 border-primary/20 rounded-xl p-5 mb-6 animate-in slide-in-from-top-2">
              <h4 className="font-bold mb-4">إضافة طريقة دفع جديدة</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">الاسم</label>
                  <input 
                    type="text" 
                    value={newPayment.name}
                    onChange={e => setNewPayment({ ...newPayment, name: e.target.value })}
                    className="w-full text-sm bg-background border border-input rounded-md px-3 py-2 outline-none focus:border-primary"
                    placeholder="مثال: فودافون كاش"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">النوع</label>
                  <select 
                    value={newPayment.type}
                    onChange={e => setNewPayment({ ...newPayment, type: e.target.value })}
                    className="w-full text-sm bg-background border border-input rounded-md px-3 py-2 outline-none focus:border-primary"
                  >
                    <option value="VODAFONE_CASH">فودافون كاش</option>
                    <option value="INSTAPAY">إنستا باي</option>
                    <option value="BANK_TRANSFER">تحويل بنكي</option>
                    <option value="COD">الدفع عند الاستلام</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPayment} className="flex-1">حفظ</Button>
                  <Button variant="outline" onClick={() => setIsAddingPayment(false)}>إلغاء</Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentMethods.map((pm: any) => (
              <div key={pm.id} className="bg-card border border-border/50 rounded-xl p-5 relative group">
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setDeleteModal({ type: 'payment', id: pm.id, name: pm.name })} className="p-1.5 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h4 className="font-bold text-lg mb-1 pr-6">{pm.name}</h4>
                <span className="text-xs font-bold px-2 py-1 bg-secondary rounded text-secondary-foreground inline-block mb-4">
                  {pm.type === 'VODAFONE_CASH' ? 'فودافون كاش' : pm.type === 'INSTAPAY' ? 'إنستا باي' : pm.type === 'COD' ? 'الدفع عند الاستلام' : 'تحويل بنكي'}
                </span>
                
                <div className="space-y-4">
                  {pm.type !== 'COD' && (
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
                  )}
                  
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

      {/* Delete Confirmation Custom Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border/50 overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">تأكيد الحذف</h3>
              <p className="text-sm text-muted-foreground">
                هل أنت متأكد أنك تريد حذف {deleteModal.name ? `"${deleteModal.name}"` : 'هذا العنصر'}؟
                {deleteModal.type === 'gov' && ' سيتم حذف جميع المدن التابعة لها أيضاً.'}
                لا يمكن التراجع عن هذه الخطوة.
              </p>
            </div>
            <div className="flex border-t border-border/50">
              <button 
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-4 font-semibold text-muted-foreground hover:bg-muted/50 transition-colors border-l border-border/50"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
