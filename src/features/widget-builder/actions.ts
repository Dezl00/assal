"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function translateToEnglish(text: string): Promise<string> {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0][0][0] || text;
  } catch (e) {
    return text;
  }
}

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

export async function updateWidget(id: string, data: any) {
  try {
    const widget = await db.widget.update({
      where: { id },
      data
    })
    
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    return { success: true, widget }
  } catch (error: any) {
    return { success: false, error: "Failed to update widget" }
  }
}

export async function createWidgetContentItem(widgetId: string, formData: FormData) {
  try {
    const desktopImage = formData.get("desktopImage") as string || null
    const mobileImage = formData.get("mobileImage") as string || null
    const title = formData.get("title") as string || null
    const subtitle = formData.get("subtitle") as string || null
    const buttonText = formData.get("buttonText") as string || null
    let buttonUrl = formData.get("buttonUrl") as string || null
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0

    // Check if widget is BrandSlider
    const widget = await db.widget.findUnique({ where: { id: widgetId } })
    
    if (widget?.type === "BrandSlider" && title) {
      // Auto-sync: Create Brand
      const translated = await translateToEnglish(title);
      let baseSlug = translated.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w0-9\-]+/g, '');
      if (!baseSlug || baseSlug === '-') {
        baseSlug = 'brand';
      }
      let slug = baseSlug;
      let counter = 1;
      
      // Ensure unique slug
      while (await db.brand.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      const brand = await db.brand.create({
        data: {
          name: title,
          slug: slug,
          logoUrl: desktopImage,
        }
      })
      // Auto-link the buttonUrl to the brand products if not explicitly set
      if (!buttonUrl) {
        buttonUrl = `/brand/${brand.slug}`
      }
    }

    const item = await db.widgetContentItem.create({
      data: {
        widgetId,
        desktopImage,
        mobileImage,
        title,
        subtitle,
        buttonText,
        buttonUrl,
        sortOrder
      }
    })

    revalidatePath("/admin/widgets")
    revalidatePath("/")
    return { success: true, item }
  } catch (error: any) {
    return { success: false, error: "Failed to create widget item" }
  }
}

export async function deleteWidgetContentItem(id: string) {
  try {
    await db.widgetContentItem.delete({ where: { id } })
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete widget item" }
  }
}

export async function updateWidgetContentItem(id: string, formData: FormData) {
  try {
    const desktopImage = formData.get("desktopImage") as string || null
    const mobileImage = formData.get("mobileImage") as string || null
    const title = formData.get("title") as string || null
    const subtitle = formData.get("subtitle") as string || null
    const buttonText = formData.get("buttonText") as string || null
    let buttonUrl = formData.get("buttonUrl") as string || null

    const oldItem = await db.widgetContentItem.findUnique({
      where: { id },
      include: { widget: true }
    })

    if (oldItem?.widget?.type === "BrandSlider" && title) {
      const slug = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A0-9\-]+/g, '') + '-' + Math.random().toString(36).substring(2, 6)
      
      // If the title changed, we create a new brand (since we don't have a direct link to the old brand ID)
      // If the title is the same, we update the existing brand's logo
      const existingBrand = await db.brand.findFirst({
        where: { name: oldItem.title || "" }
      })

      if (existingBrand) {
        await db.brand.update({
          where: { id: existingBrand.id },
          data: {
            name: title,
            logoUrl: desktopImage || existingBrand.logoUrl
          }
        })
        if (!buttonUrl) buttonUrl = `/brand/${existingBrand.slug}`
      } else {
        const brand = await db.brand.create({
          data: {
            name: title,
            slug: slug,
            logoUrl: desktopImage,
          }
        })
        if (!buttonUrl) buttonUrl = `/brand/${brand.slug}`
      }
    }

    const dataToUpdate: any = {}
    if (desktopImage !== null) dataToUpdate.desktopImage = desktopImage
    if (mobileImage !== null) dataToUpdate.mobileImage = mobileImage
    if (title !== null) dataToUpdate.title = title
    if (subtitle !== null) dataToUpdate.subtitle = subtitle
    if (buttonText !== null) dataToUpdate.buttonText = buttonText
    if (buttonUrl !== null) dataToUpdate.buttonUrl = buttonUrl

    const item = await db.widgetContentItem.update({
      where: { id },
      data: dataToUpdate
    })

    revalidatePath("/admin/widgets")
    revalidatePath("/")
    return { success: true, item }
  } catch (error: any) {
    return { success: false, error: "Failed to update widget item" }
  }
}

export async function updateWidgetContentItemOrder(updates: { id: string, sortOrder: number }[]) {
  try {
    await db.$transaction(
      updates.map((update) => 
        db.widgetContentItem.update({
          where: { id: update.id },
          data: { sortOrder: update.sortOrder }
        })
      )
    )
    
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update widget item order" }
  }
}
