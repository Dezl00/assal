"use client"

import React, { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (searchParams?.get("locked") === "true") {
      setError("تم تعطيل حسابك من قبل الإدارة. يرجى التواصل مع الدعم.")
      signIn("credentials", { redirect: false }) 
      import("next-auth/react").then(({ signOut }) => signOut({ redirect: false }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        phone,
        password,
      })

      if (result?.error) {
        setError("بيانات الدخول غير صحيحة")
        setLoading(false)
      } else {
        router.push("/admin")
        router.refresh()
        
        setTimeout(() => {
          setLoading(false)
        }, 3000)
      }
    } catch (err) {
      console.error(err)
      setError("حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
          <p className="mt-2 text-sm text-muted-foreground">لوحة تحكم إدارة منصة عسل</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {searchParams?.get("locked") === "true" ? (
            <div className="bg-destructive/15 text-destructive border-l-4 border-destructive p-4 rounded-xl flex items-start gap-3 shadow-sm mb-6 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold mb-1">جلسة مغلقة</h4>
              <p className="text-sm">تم تعطيل حسابك من قبل الإدارة. يرجى التواصل مع المسؤول للحصول على صلاحيات الدخول.</p>
            </div>
          </div>
          ) : error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">رقم الهاتف / البريد الإلكتروني</label>
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="text-left"
              dir="ltr"
              placeholder="010... / admin@assal.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">كلمة المرور</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-left"
              dir="ltr"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">جاري التحميل...</div>}>
      <LoginContent />
    </Suspense>
  )
}
