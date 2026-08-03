import { auth } from "@/lib/auth"
import CheckoutClient from "./checkout-client"
import { db } from "@/lib/db"

export default async function CheckoutPage() {
  const session = await auth()
  
  let userDetails = null
  
  if (session?.user?.email) {
    const dbUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { name: true, email: true, phone: true, address: true }
    })
    if (dbUser) {
      userDetails = dbUser
    }
  }

  return <CheckoutClient user={userDetails} />
}
