"use client"
import React, { useState, useEffect } from "react"
import { X, Copy, Check, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PromoPopup({ settings }: { settings: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!settings?.promoPopupEnabled) return

    const hasSeen = localStorage.getItem("promo_popup_seen")
    if (hasSeen) return

    const delay = (settings.promoPopupDelay || 10) * 1000
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [settings])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem("promo_popup_seen", "true")
  }

  const handleCopy = () => {
    if (settings?.promoPopupCode) {
      navigator.clipboard.writeText(settings.promoPopupCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={handleClose}
          className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-foreground hover:bg-black/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="bg-gradient-to-br from-primary/80 to-primary p-8 text-primary-foreground flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{settings?.promoPopupTitle || "عرض خاص لك!"}</h2>
        </div>
        
        <div className="p-8 text-center">
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {settings?.promoPopupDescription || "استخدم كود الخصم التالي للحصول على خصم مميز على طلبك الأول."}
          </p>
          
          {settings?.promoPopupCode && (
            <div className="flex items-center justify-between bg-muted/50 border-2 border-primary/20 rounded-2xl p-2 mb-6">
              <span className="font-mono text-xl font-bold text-primary pl-4 tracking-wider w-full text-center" dir="ltr">
                {settings.promoPopupCode}
              </span>
              <Button 
                onClick={handleCopy}
                size="icon"
                className={`shrink-0 rounded-xl w-12 h-12 transition-all ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}
              >
                {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
              </Button>
            </div>
          )}
          
          <Button 
            onClick={handleClose}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground w-full rounded-xl"
          >
            لا شكراً، سأستمر في التصفح
          </Button>
        </div>
      </div>
    </div>
  )
}
