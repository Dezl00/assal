"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function updateUserAccount(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return { error: "غير مصرح لك بإجراء هذا التعديل" }
  }

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const password = formData.get("password") as string
  const newPassword = formData.get("newPassword") as string

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { error: "المستخدم غير موجود" }
    }

    let updatedData: any = {
      name: name || user.name,
      phone: phone || user.phone,
      address: address || user.address,
    }

    // Password update logic
    if (password && newPassword) {
      if (user.passwordHash !== password) {
        return { error: "كلمة المرور الحالية غير صحيحة" }
      }
      updatedData.passwordHash = newPassword
    }

    await db.user.update({
      where: { id: user.id },
      data: updatedData
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to update user:", error)
    return { error: "حدث خطأ أثناء حفظ التعديلات" }
  }
}
