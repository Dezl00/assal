"use server"

import { requireAdmin, requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { uploadImage, deleteImage as deleteCloudinaryImage } from "@/lib/cloudinary"
import { revalidatePath } from "next/cache"

export async function uploadMediaAction(formData: FormData) {
  try {
    try {
      await requirePermission("products.add")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string || "assal/general"

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadResult: any = await uploadImage(buffer, folder)

    // Save to database
    const mediaAsset = await db.mediaAsset.create({
      data: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        folder: folder,
      }
    })

    // Log the activity
    await db.activityLog.create({
      data: {
        action: "Create",
        entityType: "MediaAsset",
        entityId: mediaAsset.id,
        details: { fileName: file.name, size: file.size }
      }
    })

    revalidatePath("/admin/media")
    return { success: true, asset: mediaAsset }
  } catch (error: any) {
    console.error("Media upload error:", error)
    return { success: false, error: error.message || "Failed to upload media" }
  }
}

export async function deleteMediaAction(id: string) {
  try {
    try {
      await requirePermission("products.delete")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const asset = await db.mediaAsset.findUnique({ where: { id } })
    if (!asset) return { success: false, error: "Asset not found" }

    await deleteCloudinaryImage(asset.publicId)
    await db.mediaAsset.delete({ where: { id } })

    // Log the activity
    await db.activityLog.create({
      data: {
        action: "Delete",
        entityType: "MediaAsset",
        entityId: id,
        details: { publicId: asset.publicId }
      }
    })

    revalidatePath("/admin/media")
    return { success: true }
  } catch (error: any) {
    console.error("Media delete error:", error)
    return { success: false, error: error.message || "Failed to delete media" }
  }
}

export async function getMediaAssets(folder?: string) {
  try {
    const assets = await db.mediaAsset.findMany({
      where: folder ? { folder } : undefined,
      orderBy: { createdAt: "desc" }
    })
    return { success: true, assets }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch media assets" }
  }
}
