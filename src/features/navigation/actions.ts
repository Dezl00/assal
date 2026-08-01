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

export async function createMenuItem(menuId: string, formData: FormData) {
  try {
    const label = formData.get("label") as string
    const url = formData.get("url") as string
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0

    if (!label) {
      return { success: false, error: "Label is required" }
    }

    await db.menuItem.create({
      data: {
        menuId,
        label,
        url,
        sortOrder
      }
    })

    revalidatePath(`/admin/navigation/${menuId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to create menu item" }
  }
}

export async function updateMenuItem(id: string, menuId: string, formData: FormData) {
  try {
    const label = formData.get("label") as string
    const url = formData.get("url") as string
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0

    if (!label) {
      return { success: false, error: "Label is required" }
    }

    await db.menuItem.update({
      where: { id },
      data: {
        label,
        url,
        sortOrder
      }
    })

    revalidatePath(`/admin/navigation/${menuId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update menu item" }
  }
}

export async function deleteMenuItem(id: string, menuId: string) {
  try {
    await db.menuItem.delete({
      where: { id }
    })
    revalidatePath(`/admin/navigation/${menuId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete menu item" }
  }
}
