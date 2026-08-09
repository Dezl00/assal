"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/features/orders/actions'
import { toast } from 'sonner'
import { BellRing, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function GlobalOrderListener() {
  const [newOrder, setNewOrder] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const checkForNewOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/latest')
      if (!res.ok) return
      const data = await res.json()
      if (data.order) {
        const latestId = data.order.id
        const lastNotified = localStorage.getItem('lastNotifiedOrderId')
        
        // If there's a latest order and it's different from the last notified one
        if (latestId !== lastNotified && data.order.status === 'PENDING') {
          setNewOrder(data.order)
          localStorage.setItem('lastNotifiedOrderId', latestId)
        }
      }
    } catch (e) {
      console.error("Error polling latest order:", e)
    }
  }, [])

  useEffect(() => {
    // Check initially after a short delay
    const initialTimeout = setTimeout(checkForNewOrders, 2000)
    // Poll every 15 seconds
    const interval = setInterval(checkForNewOrders, 15000)
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [checkForNewOrders])

  const handleConfirm = async () => {
    if (!newOrder) return
    setIsUpdating(true)
    const res = await updateOrderStatus(newOrder.id, 'CONFIRMED')
    setIsUpdating(false)
    if (res?.success) {
      toast.success('تم تأكيد الطلب بنجاح')
      setNewOrder(null)
      router.refresh() // Refresh current page (especially if we are in orders)
    } else {
      toast.error('حدث خطأ أثناء التأكيد')
    }
  }

  const handleLater = () => {
    setNewOrder(null)
    router.refresh() // Just in case we want to show it in the list
  }

  if (!newOrder) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-border/50 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <BellRing className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">طلب جديد! 🚀</h2>
        <p className="text-muted-foreground text-lg mb-6">لقد تلقيت للتو طلباً جديداً من <span className="font-bold text-foreground">{newOrder.customerName}</span></p>
        
        <div className="bg-muted/30 w-full p-4 rounded-xl flex items-center justify-between mb-8 border border-border/50">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">رقم الطلب: <span className="font-bold text-foreground" dir="ltr">#{newOrder.id.slice(0,6).toUpperCase()}</span></span>
          <span className="text-lg font-bold text-primary">{newOrder.total} ر.س</span>
        </div>

        <div className="flex flex-col w-full gap-3 sm:flex-row">
          <Button 
            className="flex-1 h-12 text-base font-bold shadow-md" 
            onClick={handleConfirm}
            disabled={isUpdating}
          >
            {isUpdating ? 'جاري التأكيد...' : (
              <>
                <Check className="w-5 h-5 ml-2" />
                تأكيد الطلب
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-12 text-base font-medium" 
            onClick={handleLater}
            disabled={isUpdating}
          >
            <Clock className="w-5 h-5 ml-2" />
            لاحقاً
          </Button>
        </div>
      </div>
    </div>
  )
}
