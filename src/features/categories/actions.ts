"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const parentId = formData.get("parentId") as string

    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required" }
    }

    await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
      }
    })

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" }
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.category.delete({
      where: { id }
    })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete category" }
  }
}
