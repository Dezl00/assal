"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Printer, User, Box, MapPin, Phone, Mail, CheckCircle2, XCircle, Truck, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateOrderStatus } from "@/features/orders/actions"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function OrderDetailsClient({ order, logoUrl, storeName }: { order: any, logoUrl?: string | null, storeName?: string }) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [customerModalOpen, setCustomerModalOpen] = useState(false)

  const statusLabels: Record<string, string> = {
    "PENDING": "قيد التنفيذ",
    "PAID": "تم الدفع",
    "SHIPPED": "تم الشحن",
    "CANCELLED": "ملغي"
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    const res = await updateOrderStatus(order.id, newStatus)
    setIsUpdating(false)
    if (res.success) {
      toast.success("تم التحديث بنجاح")
      router.refresh()
    } else {
      toast.error(res.error || "حدث خطأ أثناء التحديث")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const enNumber = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const enDate = (dateString: string) => {
    const d = new Date(dateString)
    return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="space-y-6">
      
      {/* --- Screen Only UI --- */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowRight className="w-4 h-4" />
            عودة للطلبات
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setCustomerModalOpen(true)} className="gap-2">
              <User className="w-4 h-4" />
              تفاصيل العميل
            </Button>
            <Button onClick={handlePrint} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
              <Printer className="w-4 h-4" />
              طباعة الطلب
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border shadow-sm rounded-xl p-6">
              <div className="flex items-start justify-between border-b border-border/50 pb-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold">الطلب <span className="font-sans text-primary font-bold ml-1" dir="ltr">#{order.id.slice(-6).toUpperCase()}</span></h2>
                  <p className="text-sm text-muted-foreground mt-1 font-sans" dir="ltr">{enDate(order.createdAt)}</p>
                </div>
                <div className="text-left">
                  <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold rounded-full bg-primary/10 text-primary">
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="py-3 font-medium">المنتج</th>
                      <th className="py-3 font-medium text-center">الكمية</th>
                      <th className="py-3 font-medium text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {order.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-md overflow-hidden shrink-0">
                              {item.product?.imageUrl && (
                                <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{item.productName}</p>
                              <p className="text-xs text-muted-foreground font-sans mt-0.5" dir="ltr">{enNumber(item.price)} EGP</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center font-sans font-medium" dir="ltr">{item.quantity}</td>
                        <td className="py-4 text-left font-sans font-bold text-primary" dir="ltr">
                          {enNumber(item.price * item.quantity)} EGP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-sans font-medium" dir="ltr">{enNumber(order.totalAmount)} EGP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الشحن</span>
                  <span className="font-sans font-medium" dir="ltr">0.00 EGP</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border/50 pt-3">
                  <span>الإجمالي</span>
                  <span className="font-sans text-primary" dir="ltr">{enNumber(order.totalAmount)} EGP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border shadow-sm rounded-xl p-6">
              <h3 className="font-bold mb-4">إجراءات الطلب</h3>
              <div className="space-y-3">
                {order.status === "PENDING" && (
                  <Button 
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={() => handleStatusUpdate("PAID")}
                    disabled={isUpdating}
                  >
                    <CheckCircle2 className="w-4 h-4" /> تأكيد الطلب
                  </Button>
                )}
                {(order.status === "PENDING" || order.status === "PAID") && (
                  <Button 
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusUpdate("SHIPPED")}
                    disabled={isUpdating}
                  >
                    <Truck className="w-4 h-4" /> جاري الشحن
                  </Button>
                )}
                {order.status !== "CANCELLED" && (
                  <Button 
                    className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white" 
                    variant="destructive"
                    onClick={() => handleStatusUpdate("CANCELLED")}
                    disabled={isUpdating}
                  >
                    <XCircle className="w-4 h-4" /> إلغاء الطلب
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-card border border-border shadow-sm rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> عنوان الشحن</h3>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p><span className="text-foreground font-medium">المدينة:</span> {order.city}</p>
                <p><span className="text-foreground font-medium">العنوان:</span> {order.address}</p>
                {order.country && <p><span className="text-foreground font-medium">الدولة:</span> {order.country}</p>}
                {order.postalCode && <p><span className="text-foreground font-medium">الرمز البريدي:</span> <span className="font-sans">{order.postalCode}</span></p>}
                {order.phone && <p><span className="text-foreground font-medium">الهاتف:</span> <span className="font-sans" dir="ltr">{order.phone}</span></p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Print Only UI --- */}
      <div className="hidden print:block print:bg-white print:text-black font-sans w-full max-w-4xl mx-auto p-8" dir="ltr">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            .print\\:block, .print\\:block * { visibility: visible; }
            .print\\:block { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
            @page { margin: 0; }
          }
        `}} />
        
        {/* Print Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
          <div>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain mb-2" />
            ) : (
              <h1 className="text-3xl font-bold uppercase tracking-wider">{storeName || 'STORE'}</h1>
            )}
            <p className="text-sm text-gray-500 mt-2 uppercase tracking-wide">Official Invoice</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-gray-400 uppercase tracking-widest mb-2">INVOICE</h2>
            <p className="font-bold">#{order.id.slice(-6).toUpperCase()}</p>
            <p className="text-sm text-gray-600 mt-1">{enDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Print Details */}
        <div className="flex justify-between mb-12">
          <div className="w-1/2 pr-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-bold text-lg">{order.user?.name || order.user?.email || "Guest Customer"}</p>
            <p className="text-gray-600 mt-1">{order.user?.email}</p>
            {order.user?.phone && <p className="text-gray-600">{order.user?.phone}</p>}
          </div>
          <div className="w-1/2 pl-4 text-right">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ship To</h3>
            <p className="font-bold">{order.address}</p>
            <p className="text-gray-600">{order.city}{order.postalCode ? `, ${order.postalCode}` : ''}</p>
            <p className="text-gray-600">{order.country || 'Egypt'}</p>
            <p className="text-gray-600">{order.phone}</p>
          </div>
        </div>

        {/* Print Items */}
        <table className="w-full text-left mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-xs uppercase tracking-wider text-gray-500">
              <th className="py-3 font-bold">Item Description</th>
              <th className="py-3 font-bold text-center">Qty</th>
              <th className="py-3 font-bold text-right">Unit Price</th>
              <th className="py-3 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-4 pr-4">
                  <p className="font-bold text-gray-900">{item.productName}</p>
                </td>
                <td className="py-4 text-center text-gray-700">{item.quantity}</td>
                <td className="py-4 text-right text-gray-700">{enNumber(item.price)} EGP</td>
                <td className="py-4 text-right font-bold text-gray-900">{enNumber(item.price * item.quantity)} EGP</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Print Totals */}
        <div className="flex justify-end">
          <div className="w-1/2 sm:w-1/3">
            <div className="flex justify-between py-2 border-b border-gray-200 text-gray-600">
              <span>Subtotal</span>
              <span>{enNumber(order.totalAmount)} EGP</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 text-gray-600">
              <span>Shipping</span>
              <span>0.00 EGP</span>
            </div>
            <div className="flex justify-between py-3 font-bold text-xl">
              <span>Total</span>
              <span>{enNumber(order.totalAmount)} EGP</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Thank you for your business!</p>
        </div>
      </div>

      {/* Customer Details Modal */}
      <Dialog open={customerModalOpen} onOpenChange={setCustomerModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              بيانات العميل
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">الاسم</p>
                <p className="font-medium">{order.user?.name || "غير مسجل"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium font-sans">{order.user?.email || "غير متوفر"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">الهاتف</p>
                <p className="font-medium font-sans" dir="ltr">{order.phone || order.user?.phone || "غير متوفر"}</p>
              </div>
            </div>
            
            {order.userId && (
              <div className="pt-4 flex justify-end">
                <Link href={`/admin/customers/${order.userId}`} className="text-sm font-semibold text-primary hover:underline">
                  عرض ملف العميل كاملاً
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
