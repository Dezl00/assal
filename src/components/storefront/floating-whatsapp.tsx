"use client"

import React from "react"
import { MessageCircle } from "lucide-react"
import Link from "next/link"

export function FloatingWhatsApp({ number }: { number: string }) {
  if (!number) return null
  
  return (
    <Link
      href={`https://wa.me/${number}`}
      target="_blank"
      className="fixed bottom-20 md:bottom-8 left-6 md:left-8 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-8 fade-in"
      aria-label="تواصل معنا عبر واتساب"
    >
      <MessageCircle className="w-8 h-8" />
    </Link>
  )
}
