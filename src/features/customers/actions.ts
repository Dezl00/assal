"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function deleteCustomer(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId }
    })
    revalidatePath("/admin/customers")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete customer" }
  }
}
