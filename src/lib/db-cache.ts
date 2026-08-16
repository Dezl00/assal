import { unstable_cache } from "next/cache"
import { db } from "@/lib/db"
import { cache } from "react"

// Theme Config
export const getCachedThemeConfig = unstable_cache(
  async () => {
    return await db.themeConfig.findUnique({
      where: { id: "default" }
    })
  },
  ['theme-config'],
  { tags: ['theme-config'], revalidate: 3600 }
)

// Menus
export const getCachedMenu = unstable_cache(
  async (menuName: string) => {
    return await db.menu.findFirst({
      where: { name: { contains: menuName, mode: "insensitive" } },
      include: { items: { orderBy: { sortOrder: 'asc' } } }
    })
  },
  ['menus'],
  { tags: ['menus'], revalidate: 3600 }
)

export const getCachedFallbackMenu = unstable_cache(
  async () => {
    return await db.menu.findFirst({
      include: { items: { orderBy: { sortOrder: 'asc' } } }
    })
  },
  ['fallback-menu'],
  { tags: ['menus'], revalidate: 3600 }
)

// Categories for Mega Menu
export const getCachedCategories = unstable_cache(
  async () => {
    return await db.category.findMany({
      include: {
        children: true
      }
    })
  },
  ['categories-all'],
  { tags: ['categories'], revalidate: 3600 }
)

// Branches
export const getCachedBranches = unstable_cache(
  async () => {
    return await db.branch.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })
  },
  ['branches-active'],
  { tags: ['branches'], revalidate: 3600 }
)

// Departments
export const getCachedDepartments = unstable_cache(
  async () => {
    return await db.department.findMany({
      include: {
        categories: true
      }
    })
  },
  ['departments-all'],
  { tags: ['departments'], revalidate: 3600 }
)

// Widgets
export const getCachedWidgets = unstable_cache(
  async () => {
    return await db.widget.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    })
  },
  ['widgets-all'],
  { tags: ['widgets'], revalidate: 3600 }
)

// React Cache for deduplication within the same request (Product details)
export const getCachedProductBySlug = cache(async (slug: string) => {
  return await db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: {
        include: {
          department: true,
          parent: { include: { department: true } }
        }
      },
      brand: true,
    }
  })
})
