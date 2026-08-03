"use client"

import React, { useState } from "react"
import { useUIStore } from "@/store/ui-store"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"

export function AuthModal({ themeConfig }: { themeConfig?: any }) {
  const { isAuthModalOpen, setAuthModalOpen } = useUIStore()
  const [tab, setTab] = useState<"login" | "register">("login")

  if (!isAuthModalOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setAuthModalOpen(false)}
      />

      {/* Modal */}
      <div className="bg-card w-full sm:w-[450px] rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-8">
            {themeConfig?.logoUrl ? (
              <img src={themeConfig.logoUrl} alt="Store Logo" className="h-16 w-auto object-contain mb-4" />
            ) : (
              <span className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center text-white text-3xl shadow-lg shadow-primary/20 mb-4">ع</span>
            )}
            <h2 className="text-2xl font-bold text-foreground">
              {themeConfig?.storeName || "عسل"}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-muted p-1 mb-8">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === "login" 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === "register" 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          {/* Forms */}
          {tab === "login" ? (
            <form 
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                await signIn("credentials", {
                  email: formData.get("email"),
                  password: formData.get("password"),
                  redirectTo: "/account"
                })
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
                <Input type="email" name="email" required placeholder="name@example.com" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">كلمة المرور</label>
                <Input type="password" name="password" required className="h-12" />
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">نسيت كلمة المرور؟</button>
              </div>
              <Button type="submit" className="w-full h-12 text-lg">دخول</Button>
            </form>
          ) : (
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الاسم الكامل</label>
                <Input type="text" name="name" required placeholder="أحمد محمد" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
                <Input type="email" name="email" required placeholder="name@example.com" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">كلمة المرور</label>
                <Input type="password" name="password" required className="h-12" />
              </div>
              <Button type="submit" className="w-full h-12 text-lg">إنشاء حساب جديد</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
