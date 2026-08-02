import React from "react"
import { db } from "@/lib/db"
import { StorefrontHeader } from "@/components/storefront/header"
import { StorefrontFooter } from "@/components/storefront/footer"
import { CartDrawer } from "@/components/storefront/cart-drawer"

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
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

  const topNavItems = headerMenu?.items || fallbackMenu?.items || []
  const footerItems = footerMenu?.items || fallbackMenu?.items || []

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <StorefrontHeader menuItems={topNavItems} themeConfig={themeConfig} />
      <CartDrawer />
      <main className="flex-1">
        {children}
      </main>
      <StorefrontFooter menuItems={footerItems} themeConfig={themeConfig} />
    </div>
  )
}
