import React from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Package, User, MapPin, LogOut } from "lucide-react"
import { AccountClient } from "./account-client"
import { StorefrontFooter } from "@/components/storefront/footer"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "حسابي | عسل",
}

export default async function AccountPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/")
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!user) {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">مرحباً بك، {user.name || 'عميلنا العزيز'}!</h1>
        <p className="text-muted-foreground mt-2">من خلال لوحة تحكم حسابك يمكنك استعراض طلباتك السابقة وتعديل بياناتك بسهولة.</p>
      </div>

      <AccountClient user={user} />
    </div>
  )
}
