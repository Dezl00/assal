import React from "react"
import Link from "next/link"
import StoreLayout from "@/app/(store)/layout"
import { FileQuestion } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  description: "عذراً، الصفحة التي تبحث عنها غير موجودة.",
}

export default function NotFound() {
  return (
    <StoreLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-background">
        <FileQuestion className="w-24 h-24 text-muted-foreground/30 mb-6" strokeWidth={1} />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">الصفحة الحالية غير موجودة</h1>
        <p className="text-muted-foreground mb-8 text-lg">عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.</p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center h-12 px-8 rounded bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          العودة للرئيسية
        </Link>
      </div>
    </StoreLayout>
  )
}
