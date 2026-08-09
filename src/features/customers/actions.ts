"use server"

import { requireAdmin, requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function deleteCustomer(userId: string) {
  try {
    try {
      await requirePermission("customers.delete")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    await db.user.delete({
      where: { id: userId }
    })
    revalidatePath("/admin/customers")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete customer" }
  }
}
