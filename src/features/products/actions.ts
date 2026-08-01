"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { uploadImage } from "@/lib/cloudinary"

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const sku = formData.get("sku") as string
    const price = parseFloat(formData.get("price") as string)
    const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : null
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string
    const description = formData.get("description") as string
    const imageFile = formData.get("image") as File | null

    if (!name || !slug || !sku || isNaN(price) || !categoryId) {
      return { success: false, error: "Missing required fields" }
    }

    // 1. Upload image to Cloudinary if provided
    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const result: any = await uploadImage(buffer, "assal/products")
      imageUrl = result.secure_url
    }

    // 2. Create the Product and the ProductImage simultaneously
    await db.product.create({
      data: {
        name,
        slug,
        sku,
        price,
        discountPrice,
        stock: isNaN(stock) ? 0 : stock,
        categoryId,
        description: description || null,
        ...(imageUrl && {
          images: {
            create: {
              url: imageUrl,
              isPrimary: true
            }
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
    const description = formData.get("description") as string
    const imageFile = formData.get("image") as File | null

    if (!name || !slug || !sku || isNaN(price) || !categoryId) {
      return { success: false, error: "Missing required fields" }
    }

    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const result: any = await uploadImage(buffer, "assal/products")
      imageUrl = result.secure_url
    }

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
        description: description || null,
        ...(imageUrl && {
          images: {
            create: {
              url: imageUrl,
              isPrimary: true
            }
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
