"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function addAddress(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "غير مصرح" }

    const title = formData.get("title") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const governorate = formData.get("governorate") as string
    const isDefault = formData.get("isDefault") === "true"

    if (!title || !address || !governorate) {
      return { error: "يرجى تعبئة الحقول المطلوبة" }
    }

    const existingAddressesCount = await db.address.count({ where: { userId: session.user.id } })
    const shouldBeDefault = isDefault || existingAddressesCount === 0

    if (shouldBeDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      })
    }

    await db.address.create({
      data: {
        userId: session.user.id,
        title,
        address,
        city,
        governorate,
        isDefault: shouldBeDefault
      }
    })

    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    return { error: "حدث خطأ أثناء إضافة العنوان" }
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "غير مصرح" }

    await db.address.delete({
      where: { 
        id: addressId,
        userId: session.user.id
      }
    })

    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    return { error: "حدث خطأ أثناء حذف العنوان" }
  }
}

export async function setDefaultAddress(addressId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "غير مصرح" }

    await db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false }
    })

    await db.address.update({
      where: { 
        id: addressId,
        userId: session.user.id
      },
      data: { isDefault: true }
    })

    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    return { error: "حدث خطأ أثناء تعيين العنوان الافتراضي" }
  }
}
