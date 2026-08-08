"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Power, Loader2, Edit } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { deleteArticle, updateArticle } from "@/features/articles/actions"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"

export function ArticleActionsClient({ article }: { article: any }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const res = await deleteArticle(article.id)
      if (res?.success) {
        toast.success("تم حذف المقال بنجاح")
      } else {
        toast.error(res?.error || "حدث خطأ غير معروف")
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحذف")
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
    }
  }

  async function handleToggle() {
    setIsToggling(true)
    try {
      const res = await updateArticle(article.id, { isActive: !article.isActive })
      if (res?.success) {
        toast.success(`تم ${!article.isActive ? 'تفعيل' : 'إخفاء'} المقال`)
      } else {
        toast.error(res?.error || "حدث خطأ غير معروف")
      }
    } catch (e) {
      toast.error("حدث خطأ")
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className={article.isActive ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"}
          onClick={handleToggle}
          disabled={isToggling || isDeleting}
          title={article.isActive ? "إخفاء" : "تفعيل"}
        >
          {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
        </Button>

        <Link href={`/admin/articles/${article.id}`}>
          <Button variant="ghost" size="icon" className="hover:text-primary">
            <Edit className="w-4 h-4" />
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isDeleting || isToggling}
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isDeleting}
      />
    </>
  )
}
