"use client"
import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, FolderTree, Image as ImageIcon, LayoutTemplate, Settings, ListTree, ExternalLink, LogOut, Menu as MenuIcon, X } from "lucide-react"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "العملاء", href: "/admin/customers", icon: FolderTree },
    { name: "الأقسام", href: "/admin/categories", icon: ListTree },
    { name: "المنتجات", href: "/admin/products", icon: ShoppingBag },
    { name: "منشئ الواجهات", href: "/admin/widgets", icon: LayoutTemplate },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  ]

  // For bottom nav, we only show top 4 most important
  const bottomNavItems = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "الواجهات", href: "/admin/widgets", icon: LayoutTemplate },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-background pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-l border-border bg-background/80 backdrop-blur-md transition-all flex-col fixed inset-y-0 right-0 z-50">
        <div className="flex h-16 items-center px-6 border-b border-border shrink-0">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-primary">Assal Admin</span>
        </div>
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all active:scale-95",
                  isActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5 hover:text-primary text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-colors rtl-flip", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border shrink-0">
          <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 active:scale-95">
            <LogOut className="h-5 w-5 rtl-flip" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:mr-72 min-h-screen">
        <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 shrink-0 sticky top-0 z-40">
          <h2 className="text-base md:text-lg font-semibold text-foreground">لوحة التحكم</h2>
          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              href="/" 
              target="_blank" 
              className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-muted/30 px-3 py-1.5 rounded-full"
            >
              <span className="hidden sm:inline">عرض المتجر</span>
              <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Link>
             <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs md:text-sm ms-2">
               A
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-x-hidden p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-around z-50 px-2 pb-safe">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className={cn("p-1 rounded-full transition-all", isActive && "bg-primary/10")}>
                <item.icon className="h-5 w-5 rtl-flip" />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <Toaster 
        position="bottom-left" 
        richColors
        toastOptions={{
          style: { boxShadow: 'none' },
        }} 
      />
    </div>
  )
}
