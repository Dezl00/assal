import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { db } from "@/lib/db";
import NextTopLoader from 'nextjs-toploader';

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
  const favicon = theme?.faviconUrl || "/favicon.ico";

  return {
    metadataBase: new URL("https://assal1.vercel.app"), // Base URL for OG images
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: storeDescription,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
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
        <NextTopLoader 
          color="var(--color-primary, #b79045)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px var(--color-primary, #b79045),0 0 5px var(--color-primary, #b79045)"
        />
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          dir="rtl"
        />
      </body>
    </html>
  );
}
