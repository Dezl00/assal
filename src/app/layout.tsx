import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { db } from "@/lib/db";

const fallbackFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-agnadeen",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const theme = await db.themeConfig.findUnique({ where: { id: "default" } });
  
  const storeName = theme?.storeName || "عسل";
  const storeDescription = theme?.storeDescription || "أفضل المنتجات وأعلاها جودة";
  const logo = theme?.logoUrl || "/favicon.ico";
  // Add a cache-buster so browsers don't cache the old favicon
  const favicon = theme?.faviconUrl ? `${theme.faviconUrl}?v=${Date.now()}` : "/favicon.ico";

  return {
    metadataBase: new URL("https://assal1.vercel.app"), // Base URL for OG images
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: storeDescription,
    icons: {
      icon: favicon,
      apple: favicon,
      shortcut: favicon,
    },
    openGraph: {
      title: storeName,
      description: storeDescription,
      url: '/',
      siteName: storeName,
      images: [
        {
          url: logo,
          width: 800,
          height: 600,
          alt: storeName,
        },
      ],
      locale: 'ar_EG',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description: storeDescription,
      images: [logo],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await db.themeConfig.findUnique({ where: { id: "default" } });

  return (
    <html lang="ar" dir="rtl" className={fallbackFont.variable}>
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            ${theme?.primaryColor ? `--color-primary: ${theme.primaryColor}; --color-ring: ${theme.primaryColor};` : ''}
            ${theme?.secondaryColor ? `--color-secondary: ${theme.secondaryColor};` : ''}
          }
        `}} />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          dir="rtl"
          toastOptions={{
            style: {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none',
              fontFamily: 'inherit',
            },
            className: 'bg-background/95 backdrop-blur-lg border-none shadow-lg font-sans w-fit mx-auto min-w-[200px] justify-center',
          }}
        />
      </body>
    </html>
  );
}
