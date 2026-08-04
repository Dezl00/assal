import React from "react"
import Link from "next/link"
import { MapPin, Phone, MessageCircle, Globe } from "lucide-react"

export function StorefrontFooter({ menuItems, themeConfig, branches = [] }: { menuItems: any[], themeConfig?: any, branches?: any[] }) {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold tracking-tight text-white">{themeConfig?.storeName || "عسل"}</span>
            </Link>
            <p className="text-sm text-secondary-foreground/70 leading-relaxed">
              {themeConfig?.storeDescription || "متجرك الأول للحصول على أرقى المنتجات بأعلى جودة. نسعى دائماً لتقديم الأفضل لعملائنا."}
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
            <h4 className="font-semibold text-white mb-6">الفروع والتواصل</h4>
            <ul className="space-y-4">
              {branches.length > 0 ? branches.map(branch => (
                <li key={branch.id} className="text-sm text-secondary-foreground/70">
                  <div className="font-medium text-white/90 mb-1">{branch.name}</div>
                  {branch.address && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                      <span>{branch.address}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Phone className="w-4 h-4 shrink-0 text-primary/70" />
                      <span dir="ltr">{branch.phone}</span>
                    </div>
                  )}
                </li>
              )) : (
                <>
                  <li><Link href="/faq" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">الأسئلة الشائعة</Link></li>
                  <li><Link href="/contact" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">تواصل معنا</Link></li>
                </>
              )}
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
              <button className="h-10 px-4 rounded-l-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                اشترك
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-foreground/50">
            © {new Date().getFullYear()} {themeConfig?.storeName || "عسل"}. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            {themeConfig?.facebookUrl && (
              <Link href={themeConfig.facebookUrl} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center font-bold font-sans">
                F
              </Link>
            )}
            {themeConfig?.instagramUrl && (
              <Link href={themeConfig.instagramUrl} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center font-bold font-sans">
                I
              </Link>
            )}
            {themeConfig?.twitterUrl && (
              <Link href={themeConfig.twitterUrl} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center font-bold font-sans">
                X
              </Link>
            )}
            {themeConfig?.whatsappNumber && (
              <Link href={`https://wa.me/${themeConfig.whatsappNumber}`} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </Link>
            )}
            {themeConfig?.tiktokUrl && (
              <Link href={themeConfig.tiktokUrl} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center text-sm font-bold">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.33-5.17 1.99-7.1 1.77-2.03 4.54-3.13 7.22-2.73.04.14.07.28.1.42 1.14.39 2.1.95 2.1 2.27-.04.42-.1.85-.16 1.27-1.07-.37-2.28-.48-3.4-.23-1.46.33-2.67 1.4-3.16 2.82-.44 1.25-.36 2.7.23 3.91.73 1.47 2.37 2.45 4.02 2.49 1.53.04 3.06-.69 3.98-1.92.51-.7.83-1.52.93-2.38.02-.17.02-.34.02-.51V0c-.01 0 .01.01.01.02z"/></svg>
              </Link>
            )}
            {themeConfig?.snapchatUrl && (
              <Link href={themeConfig.snapchatUrl} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center text-sm font-bold">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.01 0c-.26 0-.5.06-.72.16-1.4.63-2.6 1.83-3.3 3.32-.42.92-.66 2-.72 3.17-.03.58-.02 1.17.03 1.75-.85.34-1.67.75-2.4 1.26-.6.4-1.12.9-1.5 1.46-.22.33-.36.72-.37 1.12-.02.48.14.93.42 1.29.35.43.86.72 1.43.79.16.02.32.02.48.01.05.78.36 1.48.86 2.01.62.65 1.47 1.05 2.41 1.1.28.02.57.01.85-.04.6-.1 1.18-.32 1.71-.65.25.18.52.34.81.47.28.13.59.2.91.22.61.03 1.19-.17 1.66-.54.6.36 1.32.55 2.08.5 1.08-.07 2.06-.57 2.71-1.33.6-.71.95-1.62.97-2.58.01-.22.01-.44 0-.66.6-.1 1.14-.42 1.51-.9.34-.45.52-1.02.48-1.57-.03-.53-.26-1.01-.62-1.39-.46-.47-1.06-.8-1.74-1.01.08-.85.04-1.72-.11-2.55-.38-2.12-1.6-4.03-3.41-5.18-1.05-.66-2.31-1.03-3.6-1.03zm0 1.26c1.1 0 2.16.32 3.06.91 1.51.98 2.53 2.58 2.85 4.36.14.77.17 1.56.09 2.34-.03.26-.06.51-.12.76-.05.21 0 .43.14.59.18.2.45.33.74.33.25 0 .5-.09.68-.26.24-.22.4-.53.44-.86.03-.32-.07-.63-.26-.87-.24-.31-.62-.48-1.01-.48-.26 0-.5.09-.69.26-.08-.09-.16-.18-.25-.26-1.06-1.02-2.56-1.6-4.14-1.6-1.57 0-3.07.57-4.14 1.6-.08.08-.16.17-.25.26-.18-.17-.43-.26-.69-.26-.39 0-.77.17-1.01.48-.19.24-.29.55-.26.87.04.33.2.64.44.86.18.17.43.26.68.26.29 0 .56-.13.74-.33.14-.16.19-.38.14-.59-.05-.25-.09-.5-.12-.76-.08-.78-.05-1.57.09-2.34.32-1.78 1.34-3.38 2.85-4.36.9-.59 1.96-.91 3.06-.91z"/></svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
