"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const sku = formData.get("sku") as string
    const price = parseFloat(formData.get("price") as string)
    const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : null
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string
    const brandId = formData.get("brandId") as string || null
    const description = formData.get("description") as string
    
    // Parse images array from hidden input
    let images: string[] = []
    try {
      images = JSON.parse(formData.get("images") as string || "[]")
    } catch (e) {}

    if (!name || !slug || !sku || isNaN(price) || !categoryId) {
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

export async function deleteProduct(id: string) {
  try {
    await db.product.delete({
      where: { id }
    })
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete product" }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const sku = formData.get("sku") as string
    const price = parseFloat(formData.get("price") as string)
    const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : null
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string
    const brandId = formData.get("brandId") as string || null
    const description = formData.get("description") as string
    
    let images: string[] = []
    try {
      images = JSON.parse(formData.get("images") as string || "[]")
    } catch (e) {}

    if (!name || !slug || !sku || isNaN(price) || !categoryId) {
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
