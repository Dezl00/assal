"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string
    let slug = formData.get("slug") as string
    let sku: string | null = formData.get("sku") as string || null
    
    if (!slug) {
      // Find the next available sequential number
      const products = await db.product.findMany({ select: { slug: true } });
      const numericSlugs = products
        .map(p => {
          const match = p.slug.match(/^(?:P-)?(\d+)$/i);
          return match ? parseInt(match[1], 10) : NaN;
        })
        .filter(n => !isNaN(n) && n > 0);
      
      let nextId = 10001;
      if (numericSlugs.length > 0) {
        const maxId = Math.max(...numericSlugs);
        nextId = maxId >= 10001 ? maxId + 1 : 10001;
      }
      slug = `P-${nextId}`;
    }
    

    const price = parseFloat(formData.get("price") as string)
    const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : null
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string
    const departmentId = formData.get("departmentId") as string || null
    const brandId = formData.get("brandId") as string || null
    const description = formData.get("description") as string
    
    // Parse images array from hidden input
    let images: string[] = []
    try {
      images = JSON.parse(formData.get("images") as string || "[]")
    } catch (e) {}

    if (!name || isNaN(price) || !categoryId) {
      return { success: false, error: "Missing required fields" }
    }

    // 2. Create the Product and the ProductImages
    await db.product.create({
      data: {
        name,
        slug,
        sku,
        price,
        discountPrice,
        stock: isNaN(stock) ? 0 : stock,
        categoryId,
        departmentId,
        brandId,
        description: description || null,
        ...(images.length > 0 && {
          images: {
            create: images.map((url, idx) => ({
              url,
              isPrimary: idx === 0,
              sortOrder: idx
            }))
          }
        })
      }
    })

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create product" }
  }
}

import { auth } from "@/lib/auth"

export async function deleteProduct(id: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Not authorized to delete products" }
    }
    
    const product = await db.product.delete({
      where: { id }
    })
    
    await db.activityLog.create({
      data: {
        action: "DELETE",
        entityType: "Product",
        entityId: product.id,
        details: { message: `تم حذف المنتج: ${product.name}` },
        userId: session.user.id || null
      }
    })

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete product" }
  }
}

// ... skipped down to bulkDeleteProducts ...

export async function bulkDeleteProducts(ids: string[]) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Not authorized to delete products" }
    }

    await db.product.deleteMany({
      where: { id: { in: ids } }
    })
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete products" }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    let slug = formData.get("slug") as string
    let sku: string | null = formData.get("sku") as string || null
    
    if (!slug) slug = `product-${Date.now()}`
    const price = parseFloat(formData.get("price") as string)
    const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : null
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string
    const departmentId = formData.get("departmentId") as string || null
    const brandId = formData.get("brandId") as string || null
    const description = formData.get("description") as string
    
    let images: string[] = []
    try {
      images = JSON.parse(formData.get("images") as string || "[]")
    } catch (e) {}

    if (!name || isNaN(price) || !categoryId) {
      return { success: false, error: "Missing required fields" }
    }

    // Delete old images first to replace them with the new ordered array
    await db.productImage.deleteMany({
      where: { productId: id }
    })

    await db.product.update({
      where: { id },
      data: {
        name,
        slug,
        sku,
        price,
        discountPrice,
        stock: isNaN(stock) ? 0 : stock,
        categoryId,
        departmentId,
        brandId,
        description: description || null,
        ...(images.length > 0 && {
          images: {
            create: images.map((url, idx) => ({
              url,
              isPrimary: idx === 0,
              sortOrder: idx
            }))
          }
        })
      }
    })

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update product" }
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    await db.product.update({
      where: { id },
      data: { isActive }
    })
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update product status" }
  }
}

export async function bulkToggleProductsStatus(ids: string[], isActive: boolean) {
  try {
    await db.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive }
    })
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update products status" }
  }
}

export async function bulkUpdateProducts(productsData: any[]) {
  try {
    // We update sequentially or use transaction
    await db.$transaction(
      productsData.map(p => 
        db.product.update({
          where: { id: p.id },
          data: {
            name: p.name,
            price: p.price,
            stock: p.stock,
            categoryId: p.categoryId,
            brandId: p.brandId || null,
            isActive: p.isActive
          }
        })
      )
    )
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update products" }
  }
}
