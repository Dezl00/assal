"use server"

import { requireAdmin, requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { revalidatePath, updateTag } from "next/cache"
import { auth } from "@/lib/auth"

export async function createCategory(formData: FormData) {
  try {
    try {
      await requirePermission("categories.create")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
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
    updateTag("categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" }
  }
}

export async function deleteCategory(id: string) {
  try {
    try {
      await requirePermission("categories.delete")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }

    // Safety: check for products in this category
    const productCount = await db.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return { success: false, error: `لا يمكن حذف هذا القسم لأنه يحتوي على ${productCount} منتج. قم بنقل المنتجات أولاً.` }
    }

    // Safety: check for child categories
    const childCount = await db.category.count({ where: { parentId: id } })
    if (childCount > 0) {
      return { success: false, error: `لا يمكن حذف هذا القسم لأنه يحتوي على ${childCount} أقسام فرعية. قم بحذفها أولاً.` }
    }

    await db.category.delete({
      where: { id }
    })
    revalidatePath("/admin/categories")
    updateTag("categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete category" }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    try {
      await requirePermission("categories.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
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
    updateTag("categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" }
  }
}

export async function bulkUpdateCategories(ids: string[], data: { departmentId?: string, parentId?: string }) {
  try {
    try {
      await requirePermission("categories.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    if (!ids.length) return { success: false, error: "لا توجد أقسام محددة" }

    await db.category.updateMany({
      where: { id: { in: ids } },
      data: {
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
      }
    })

    revalidatePath("/admin/categories")
    updateTag("categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "فشل تحديث الأقسام" }
  }
}

export async function bulkCreateCategories(categoriesToCreate: { main: string, sub?: string }[]) {
  try {
    const session = await auth()
    const isAdmin = session?.user?.role === "ADMIN"
    const hasPerm = session?.user?.permissions?.includes("categories.create")
    if (!isAdmin && !hasPerm) {
      return { success: false, error: "Not authorized to create categories" }
    }

    if (!categoriesToCreate || categoriesToCreate.length === 0) return { success: true, categories: [] }

    // 1. Process Main Categories first
    const uniqueMains = [...new Set(categoriesToCreate.map(c => c.main.trim()))].filter(Boolean)
    
    for (const mainName of uniqueMains) {
      let mainCat = await db.category.findFirst({
        where: { name: mainName, parentId: null }
      })
      if (!mainCat) {
        let slug = mainName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (!slug || slug.trim() === '') slug = `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        
        // Ensure slug is unique
        const existingSlug = await db.category.findUnique({ where: { slug } })
        if (existingSlug) slug = `${slug}-${Date.now()}`

        mainCat = await db.category.create({
          data: { name: mainName, slug }
        })
      }

      // 2. Process Sub Categories for this main category
      const subsForMain = categoriesToCreate.filter(c => c.main === mainName && c.sub).map(c => c.sub!.trim());
      const uniqueSubs = [...new Set(subsForMain)].filter(Boolean);

      for (const subName of uniqueSubs) {
        const subCat = await db.category.findFirst({
          where: { name: subName, parentId: mainCat.id }
        })
        if (!subCat) {
          let subSlug = subName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          if (!subSlug || subSlug.trim() === '') subSlug = `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`
          
          const existingSubSlug = await db.category.findUnique({ where: { slug: subSlug } })
          if (existingSubSlug) subSlug = `${subSlug}-${Date.now()}`

          await db.category.create({
            data: { name: subName, slug: subSlug, parentId: mainCat.id }
          })
        }
      }
    }

    revalidatePath("/admin/categories")
    updateTag("categories")
    return { success: true }
  } catch (error: any) {
    console.error("bulkCreateCategories error:", error)
    return { success: false, error: "حدث خطأ أثناء إنشاء الأقسام" }
  }
}
