import React from "react"
import Link from "next/link"
import { LayoutDashboard, ShoppingBag, FolderTree, Image as ImageIcon, LayoutTemplate, Settings, ListTree } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Widget Builder", href: "/admin/widgets", icon: LayoutTemplate },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Navigation", href: "/admin/navigation", icon: ListTree },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-l border-border bg-card">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <span className="text-xl font-bold">Assal Admin</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              <item.icon className="h-5 w-5 rtl-flip" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="flex h-16 items-center border-b border-border bg-card px-8">
          <h2 className="text-lg font-semibold">Administration</h2>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
