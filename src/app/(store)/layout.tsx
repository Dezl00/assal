import React from "react"
import { db } from "@/lib/db"
import { StorefrontHeader } from "@/components/storefront/header"
import { StorefrontFooter } from "@/components/storefront/footer"
import { CartDrawer } from "@/components/storefront/cart-drawer"
import { AuthModal } from "@/components/auth/auth-modal"
import { MobileSidebar } from "@/components/storefront/mobile-sidebar"
import { MobileBottomNav } from "@/components/storefront/mobile-bottom-nav"
import { auth } from "@/lib/auth"

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user || null

  // Fetch header menu (assuming 'header-menu' is a common name/identifier we use)
  const headerMenu = await db.menu.findFirst({
    where: { name: { contains: "header", mode: "insensitive" } },
    include: { items: { orderBy: { sortOrder: 'asc' } } }
  })
  
  // Fetch footer menu
  const footerMenu = await db.menu.findFirst({
    where: { name: { contains: "footer", mode: "insensitive" } },
    include: { items: { orderBy: { sortOrder: 'asc' } } }
  })

  // Fallback to first available menu if specific ones aren't found
  const fallbackMenu = await db.menu.findFirst({
    include: { items: { orderBy: { sortOrder: 'asc' } } }
  })

  // Fetch Theme Config
  const themeConfig = await db.themeConfig.findUnique({
    where: { id: "default" }
  })

  // Fetch Categories for Mega Menu
  const categories = await db.category.findMany({
    include: {
      children: true
    }
  })

  // Fetch Departments
  const departments = await db.department.findMany({
    include: {
      categories: true
    }
  })

  const topNavItems = headerMenu?.items || fallbackMenu?.items || []
  const footerItems = footerMenu?.items || fallbackMenu?.items || []

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 md:pb-0 selection:bg-primary/20">
      <StorefrontHeader menuItems={topNavItems} themeConfig={themeConfig} user={user} categories={categories} departments={departments} />
      <MobileSidebar menuItems={topNavItems} themeConfig={themeConfig} categories={categories} departments={departments} />
      <CartDrawer />
      <AuthModal themeConfig={themeConfig} />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      <StorefrontFooter menuItems={footerItems} themeConfig={themeConfig} />
      <MobileBottomNav user={user} />
    </div>
  )
}
