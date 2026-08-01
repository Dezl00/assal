"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const WidgetSchema = z.object({
  type: z.string().min(1),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  status: z.boolean().default(true),
  sortOrder: z.number().default(0),
  showDesktop: z.boolean().default(true),
  showTablet: z.boolean().default(true),
  showMobile: z.boolean().default(true),
  settings: z.any().optional(),
  dataSource: z.any().optional(),
  display: z.any().optional(),
})

export async function createWidget(data: z.infer<typeof WidgetSchema>) {
  try {
    const parsed = WidgetSchema.parse(data)
    
    // We should compute sortOrder if it's not provided explicitly, but for now we trust the client.
    const widget = await db.widget.create({ data: parsed })
    
    await db.activityLog.create({
      data: {
        action: "Create",
        entityType: "Widget",
        entityId: widget.id,
        details: { type: widget.type, title: widget.title }
      }
    })
    
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    return { success: true, widget }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateWidgetOrder(updates: { id: string, sortOrder: number }[]) {
  try {
    // Perform sequentially or in a transaction. Let's do a transaction.
    await db.$transaction(
      updates.map((update) => 
        db.widget.update({
          where: { id: update.id },
          data: { sortOrder: update.sortOrder }
        })
      )
    )
    
    await db.activityLog.create({
      data: {
        action: "UpdateOrder",
        entityType: "Widget",
        details: { count: updates.length }
      }
    })
    
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update widget order" }
  }
}

export async function getWidgets() {
  try {
    const widgets = await db.widget.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    })
    return { success: true, widgets }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch widgets" }
  }
}

export async function deleteWidget(id: string) {
  try {
    await db.widget.delete({ where: { id } })
    
    await db.activityLog.create({
      data: {
        action: "Delete",
        entityType: "Widget",
        entityId: id,
      }
    })
    
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete widget" }
  }
}
