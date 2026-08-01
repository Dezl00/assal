"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const MenuSchema = z.object({
  name: z.string().min(2),
})

export async function createMenu(data: z.infer<typeof MenuSchema>) {
  try {
    const parsed = MenuSchema.parse(data)
    const menu = await db.menu.create({ data: parsed })
    revalidatePath("/admin/navigation")
    return { success: true, menu }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

const MenuItemSchema = z.object({
  menuId: z.string(),
  label: z.string().min(1),
  url: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
  parentId: z.string().optional().nullable(),
})

export async function createMenuItem(data: z.infer<typeof MenuItemSchema>) {
  try {
    const parsed = MenuItemSchema.parse(data)
    const menuItem = await db.menuItem.create({ data: parsed })
    
    await db.activityLog.create({
      data: {
        action: "Create",
        entityType: "MenuItem",
        entityId: menuItem.id,
        details: { label: menuItem.label, url: menuItem.url }
      }
    })
    
    revalidatePath("/admin/navigation")
    revalidatePath("/")
    return { success: true, menuItem }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getMenu(name: string) {
  try {
    const menu = await db.menu.findUnique({
      where: { name },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: { children: { orderBy: { sortOrder: 'asc' } } } // Nested inclusion
        }
      }
    })
    return { success: true, menu }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch menu" }
  }
}
