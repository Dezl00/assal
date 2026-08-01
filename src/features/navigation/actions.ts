"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createMenu(formData: FormData) {
  try {
    const name = formData.get("name") as string

    if (!name) {
      return { success: false, error: "Name is required" }
    }

    await db.menu.create({
      data: { name }
    })

    revalidatePath("/admin/navigation")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create menu" }
  }
}

export async function deleteMenu(id: string) {
  try {
    await db.menu.delete({
      where: { id }
    })
    revalidatePath("/admin/navigation")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete menu" }
  }
}
