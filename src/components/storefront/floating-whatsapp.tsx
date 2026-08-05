'use client'
import React from 'react'
import { MessageCircle } from 'lucide-react'

export function FloatingWhatsApp({ number }: { number: string }) {
  if (!number) return null;
  const whatsappUrl = \https://wa.me/\\;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-xl hover:scale-110 hover:bg-green-600 transition-all animate-bounce"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  )
}
