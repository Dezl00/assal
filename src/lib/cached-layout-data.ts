import { db } from "@/lib/db"
import { unstable_cache } from "next/cache"

export const getCachedLayoutData = unstable_cache(
  async () => {
    const [
      headerMenu,
      footerMenu,
      fallbackMenu,
      themeConfig,
      categories,
      branches,
      departments
    ] = await Promise.all([
      db.menu.findFirst({
        where: { name: { contains: "header", mode: "insensitive" } },
        select: {
          items: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, label: true, url: true }
          }
        }
      }),
      db.menu.findFirst({
        where: { name: { contains: "footer", mode: "insensitive" } },
        select: {
          items: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, label: true, url: true }
          }
        }
      }),
      db.menu.findFirst({
        select: {
          items: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, label: true, url: true }
          }
        }
      }),
      db.themeConfig.findUnique({
        where: { id: "default" },
        select: {
          logoUrl: true,
          storeName: true,
          storeDescription: true,
          whatsappEnabled: true,
          whatsappNumber: true,
          facebookUrl: true,
          instagramUrl: true,
          twitterUrl: true,
          tiktokUrl: true,
          snapchatUrl: true,
          promoPopupEnabled: true,
          promoPopupDelay: true,
          promoPopupTitle: true,
          promoPopupDescription: true,
          promoPopupCode: true,
        }
      }),
      db.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          departmentId: true,
          parentId: true,
          imageUrl: true,
          children: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        }
      }),
      db.branch.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
        }
      }),
      // NOTE: Removed `include: { categories: true }` — components filter
      // the main `categories` array by `departmentId`, not dept.categories
      db.department.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        }
      })
    ])

    return {
      headerMenu,
      footerMenu,
      fallbackMenu,
      themeConfig,
      categories,
      branches,
      departments
    }
  },
  ['store-layout-data'],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['layout-data']
  }
)

