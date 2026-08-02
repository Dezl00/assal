"use client"
import React from "react"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ShareButton({ title, text, url }: { title: string, text?: string, url: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        })
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          toast.error("فشلت المشاركة")
        }
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success("تم نسخ الرابط")
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleShare}
      className="text-muted-foreground hover:text-primary transition-colors shrink-0"
      title="مشاركة"
    >
      <Share2 className="w-5 h-5" />
    </Button>
  )
}
