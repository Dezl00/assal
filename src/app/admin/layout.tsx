"use client"
import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, FolderTree, Image as ImageIcon, LayoutTemplate, Settings, ListTree, ExternalLink, LogOut, Menu as MenuIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut, useSession, SessionProvider } from "next-auth/react"
import { AdminGlobalSearch } from "@/components/admin/admin-global-search"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  )
}

function AdminLayoutInner({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isManager = session?.user?.role === "MANAGER"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "العملاء", href: "/admin/customers", icon: FolderTree },
    { name: "المجالات", href: "/admin/departments", icon: LayoutDashboard },
    { name: "الأقسام", href: "/admin/categories", icon: ListTree },
    { name: "المنتجات", href: "/admin/products", icon: ShoppingBag },
    ...(isManager ? [] : [
      { name: "الإحصائيات", href: "/admin/analytics", icon: LayoutDashboard },
      { name: "منشئ الواجهات", href: "/admin/widgets", icon: LayoutTemplate },
      { name: "الحسابات والأدوار", href: "/admin/accounts", icon: FolderTree },
      { name: "سجل الأمان", href: "/admin/security", icon: LayoutDashboard },
      { name: "الإعدادات", href: "/admin/settings", icon: Settings },
    ])
  ]

  // For bottom nav, we only show top 4 most important
  const bottomNavItems = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "الواجهات", href: "/admin/widgets", icon: LayoutTemplate },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-l border-border/10 bg-admin text-white transition-all flex-col fixed inset-y-0 right-0 z-50">
        <div className="flex h-16 items-center px-6 border-b border-border/10 shrink-0">
          {/* Logo or Title */}
          <span className="text-xl font-bold text-white">Assal Admin</span>
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
                  isActive ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/80 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-colors rtl-flip", isActive ? "text-white" : "text-white/70 group-hover:text-white")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border shrink-0">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 active:scale-95"
          >
            <LogOut className="h-5 w-5 rtl-flip" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/10 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-72 bg-admin text-white border-l border-border/10 flex flex-col transition-transform duration-300 ease-in-out md:hidden shadow-xl",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex h-14 items-center justify-between px-6 border-b border-border/10 shrink-0">
          <span className="text-xl font-bold text-white">Assal Admin</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 rounded-md hover:bg-white/10 text-white/80">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all active:scale-95",
                  isActive ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/80 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-colors rtl-flip", isActive ? "text-white" : "text-white/70 group-hover:text-white")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border shrink-0">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 active:scale-95"
          >
            <LogOut className="h-5 w-5 rtl-flip" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:mr-72 min-h-screen">
        <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8 shrink-0 sticky top-0 z-30">
          
          {/* Mobile Header Left */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-md hover:bg-muted text-foreground"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <span className="text-base font-bold bg-clip-text text-transparent bg-primary">Assal Admin</span>
          </div>

          {/* Desktop Header Left (Nav items) */}
          <div className="hidden md:flex items-center gap-6">
             <div className="flex items-center gap-4">
               <Link href="/admin" className={cn("text-sm font-medium transition-colors", pathname === "/admin" ? "text-primary" : "text-muted-foreground hover:text-foreground")}>الرئيسية</Link>
               <Link href="/admin/orders" className={cn("text-sm font-medium transition-colors", pathname.startsWith("/admin/orders") ? "text-primary" : "text-muted-foreground hover:text-foreground")}>الطلبات</Link>
               <Link href="/admin/customers" className={cn("text-sm font-medium transition-colors", pathname.startsWith("/admin/customers") ? "text-primary" : "text-muted-foreground hover:text-foreground")}>العملاء</Link>
             </div>
          </div>

          {/* Central Search Bar */}
          <div className="hidden md:flex flex-1 justify-center max-w-xl mx-4">
            <AdminGlobalSearch />
          </div>

          {/* Header Right (Profile) */}
          <div className="flex items-center gap-3 md:gap-4 justify-end">
            <div className="md:hidden flex-1">
              <AdminGlobalSearch />
            </div>
            
            <Link 
              href="/" 
              target="_blank" 
              className="hidden sm:flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-muted/30 px-3 py-1.5 rounded-full"
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

    </div>
  )
}
