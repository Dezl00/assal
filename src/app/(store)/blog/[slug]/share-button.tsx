"use client"

import { Share2 } from "lucide-react"
import { toast } from "sonner"

export function ShareArticleButton({ title }: { title: string }) {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("تم نسخ رابط المقال بنجاح")
      }
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        toast.error("فشل مشاركة المقال")
      }
    }
  }

  return (
    <button 
      onClick={handleShare}
      className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-colors"
      title="مشاركة"
    >
      <Share2 className="w-4 h-4" />
    </button>
  )
}
