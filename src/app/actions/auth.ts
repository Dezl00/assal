"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  if (!name || !phone || !password) {
    return { error: "جميع الحقول مطلوبة" }
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return { error: "رقم الهاتف مسجل مسبقاً" }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        name,
        phone,
        passwordHash,
        role: "CUSTOMER"
      }
    })

    return { success: true, user: { id: user.id, phone: user.phone, name: user.name } }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "حدث خطأ أثناء إنشاء الحساب" }
  }
}

export async function loginUser(formData: FormData) {
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  if (!phone || !password) {
    return { error: "رقم الهاتف وكلمة المرور مطلوبان" }
  }

  try {
    const user = await db.user.findUnique({
      where: { phone }
    })

    if (!user || !user.passwordHash) {
      return { error: "رقم الهاتف أو كلمة المرور غير صحيحة" }
    }

    // Check password with bcrypt, with legacy plaintext migration
    let isValid = false
    if (user.passwordHash.startsWith("$2")) {
      isValid = await bcrypt.compare(password, user.passwordHash)
    } else {
      isValid = password === user.passwordHash
      if (isValid) {
        // Auto-migrate plaintext to bcrypt hash
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword }
        })
      }
    }

    if (!isValid) {
      return { error: "رقم الهاتف أو كلمة المرور غير صحيحة" }
    }

    if (user.isActive === false) {
      return { error: "تم تعطيل هذا الحساب. يرجى مراجعة الإدارة" }
    }

    return { success: true, role: user.role, permissions: user.permissions }
  } catch (error) {
    console.error("Login check error:", error)
    return { error: "حدث خطأ أثناء تسجيل الدخول" }
  }
}

