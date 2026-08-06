"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createDepartment(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const imageUrl = formData.get("imageUrl") as string

    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required" }
    }

    await db.department.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
      }
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create department" }
  }
}

export async function deleteDepartment(id: string) {
  try {
    await db.department.delete({
      where: { id }
    })
    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete department" }
  }
}

export async function updateDepartment(id: string, formData: FormData) {
  try {
    const isActiveStr = formData.get("isActive");
    if (isActiveStr !== null) {
      await db.department.update({
        where: { id },
        data: { isActive: isActiveStr === "true" }
      });
      revalidatePath("/admin/departments")
      return { success: true }
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const imageUrl = formData.get("imageUrl") as string

    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required" }
    }

    await db.department.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
      }
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update department" }
  }
}
