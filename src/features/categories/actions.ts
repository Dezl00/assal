"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const categoryType = formData.get("categoryType") as string
    const imageUrl = formData.get("imageUrl") as string
    const parentId = categoryType === "sub" ? (formData.get("parentId") as string) : null
    const departmentId = formData.get("departmentId") as string

    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required" }
    }

    await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
        departmentId: departmentId || null,
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

export async function updateCategory(id: string, formData: FormData) {
  try {
    const isActiveStr = formData.get("isActive");
    if (isActiveStr !== null) {
      await db.category.update({
        where: { id },
        data: { isActive: isActiveStr === "true" }
      });
      revalidatePath("/admin/categories")
      return { success: true }
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const categoryType = formData.get("categoryType") as string
    const imageUrl = formData.get("imageUrl") as string
    const parentId = categoryType === "sub" ? (formData.get("parentId") as string) : null
    const departmentId = formData.get("departmentId") as string

    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required" }
    }

    await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
        departmentId: departmentId || null,
      }
    })

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" }
  }
}

export async function bulkUpdateCategories(ids: string[], data: { departmentId?: string, parentId?: string }) {
  try {
    if (!ids.length) return { success: false, error: "لا توجد أقسام محددة" }

    await db.category.updateMany({
      where: { id: { in: ids } },
      data: {
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
      }
    })

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "فشل تحديث الأقسام" }
  }
}
