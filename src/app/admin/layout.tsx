import React from "react"
import Link from "next/link"
import { LayoutDashboard, ShoppingBag, FolderTree, Image as ImageIcon, LayoutTemplate, Settings, ListTree, ExternalLink, LogOut } from "lucide-react"
import { Toaster } from "sonner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "العملاء", href: "/admin/customers", icon: FolderTree },
    { name: "منشئ الواجهات", href: "/admin/widgets", icon: LayoutTemplate },
    { name: "مكتبة الوسائط", href: "/admin/media", icon: ImageIcon },
    { name: "المنتجات", href: "/admin/products", icon: ShoppingBag },
    { name: "الأقسام", href: "/admin/categories", icon: FolderTree },
    { name: "القوائم والروابط", href: "/admin/navigation", icon: ListTree },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-72 border-l border-border bg-background/80 backdrop-blur-md transition-all flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-border shrink-0">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-primary">Assal Admin</span>
        </div>
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary active:scale-95"
            >
              <item.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary rtl-flip" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border shrink-0">
          <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 active:scale-95">
            <LogOut className="h-5 w-5 rtl-flip" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-8 shrink-0">
          <h2 className="text-lg font-semibold text-foreground">لوحة التحكم</h2>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              target="_blank" 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              عرض المتجر
              <ExternalLink className="h-4 w-4" />
            </Link>
             <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold ms-4">
               A
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
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
