"use server"

import { db } from "@/lib/db"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "جميع الحقول مطلوبة" }
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "البريد الإلكتروني مسجل مسبقاً" }
    }

    // In a real app, hash the password
    // const passwordHash = await bcrypt.hash(password, 10)
    const passwordHash = password // Mocked for this build context

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CUSTOMER"
      }
    })

    return { success: true, user: { id: user.id, email: user.email, name: user.name } }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "حدث خطأ أثناء إنشاء الحساب" }
  }
}
