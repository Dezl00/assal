import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { LoginClient } from "./login-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "تسجيل الدخول إلى حسابك في المتجر",
}

export default async function LoginPage() {
  const session = await auth()
  
  if (session?.user) {
    // Redirect to admin dashboard directly as requested by user
    redirect("/admin")
  }

  const themeConfig = await db.themeConfig.findUnique({
    where: { id: "default" }
  })

  return <LoginClient themeConfig={themeConfig} />
}
