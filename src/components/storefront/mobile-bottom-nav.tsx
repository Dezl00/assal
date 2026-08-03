"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUIStore } from "@/store/ui-store"
import { Home, Store, User } from "lucide-react"

export function MobileBottomNav({ user }: { user?: any }) {
  const { setAuthModalOpen } = useUIStore()
  const pathname = usePathname()
  const router = useRouter()

  const isHome = pathname === "/"
  const isStore = pathname === "/products"
  const isAccount = pathname === "/account"

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border/50 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-4">
        
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center transition-colors ${
            isHome ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">الرئيسية</span>
        </Link>
        
        <Link 
          href="/products" 
          className={`flex flex-col items-center justify-center transition-colors ${
            isStore ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <Store className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">المتجر</span>
        </Link>

        <button 
          onClick={() => {
            if (user) {
              router.push("/account")
            } else {
              setAuthModalOpen(true)
            }
          }}
          className={`flex flex-col items-center justify-center transition-colors ${
            isAccount ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">حسابي</span>
        </button>
        
      </div>
    </div>
  )
}
