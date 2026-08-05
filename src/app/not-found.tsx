import React from "react"
import Link from "next/link"
import StoreLayout from "@/app/(store)/layout"
import { FileQuestion } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  description: "عذراً، الصفحة التي تبحث عنها غير موجودة.",
}

export default async function NotFound() {
  return (
    <StoreLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-white" style={{ backgroundColor: 'white' }}>
        <div className="mb-6 text-primary">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">الصفحة الحالية غير موجودة</h1>
        <p className="text-slate-600 mb-8 text-sm">عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.</p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          العودة للرئيسية
        </Link>
      </div>
    </StoreLayout>
  )
}
