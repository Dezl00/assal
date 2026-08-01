import React from "react"
import Link from "next/link"

export function StorefrontFooter({ menuItems }: { menuItems: any[] }) {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-tight text-white mb-4 block">عسل</Link>
            <p className="text-sm text-secondary-foreground/70 leading-relaxed">
              متجرك الأول للحصول على أرقى المنتجات بأعلى جودة. نسعى دائماً لتقديم الأفضل لعملائنا.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              {menuItems.map(item => (
                <li key={item.id}>
                  <Link href={item.url} className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6">الدعم والمساعدة</h4>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link href="/contact" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">تواصل معنا</Link></li>
              <li><Link href="/shipping" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">الشحن والتوصيل</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6">النشرة البريدية</h4>
            <p className="text-sm text-secondary-foreground/70 mb-4">اشترك ليصلك كل جديد وعروضنا الحصرية.</p>
            <div className="flex items-center">
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                className="h-10 w-full rounded-r-md bg-white/10 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="h-10 px-4 rounded-l-md gold-gradient text-white font-medium text-sm hover:opacity-90 transition-opacity">
                اشترك
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-foreground/50">
            © {new Date().getFullYear()} متجر عسل. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            {/* Social Icons Placeholders */}
            <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer"></div>
            <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer"></div>
            <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer"></div>
          </div>
        </div>
      </div>
    </footer>
  )
}
