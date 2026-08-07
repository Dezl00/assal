"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function addContactNumber(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "غير مصرح" }

    const title = formData.get("title") as string
    const number = formData.get("number") as string
    const isDefault = formData.get("isDefault") === "true"

    if (!title || !number) {
      return { error: "يرجى تعبئة الحقول المطلوبة" }
    }

    const existingContactsCount = await db.contactNumber.count({ where: { userId: session.user.id } })
    const shouldBeDefault = isDefault || existingContactsCount === 0

    if (shouldBeDefault) {
      await db.contactNumber.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      })
    }

    await db.contactNumber.create({
      data: {
        userId: session.user.id,
        title,
        number,
        isDefault: shouldBeDefault
      }
    })

    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    return { error: "حدث خطأ أثناء إضافة رقم التواصل" }
  }
}

export async function deleteContactNumber(contactId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "غير مصرح" }

    await db.contactNumber.delete({
      where: { 
        id: contactId,
        userId: session.user.id
      }
    })

    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    return { error: "حدث خطأ أثناء حذف رقم التواصل" }
  }
}

export async function setDefaultContactNumber(contactId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "غير مصرح" }

    await db.contactNumber.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false }
    })

    await db.contactNumber.update({
      where: { 
        id: contactId,
        userId: session.user.id
      },
      data: { isDefault: true }
    })

    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    return { error: "حدث خطأ أثناء تعيين الرقم الافتراضي" }
  }
}
