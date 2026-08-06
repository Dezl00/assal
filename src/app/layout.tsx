import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { db } from "@/lib/db";
import NextTopLoader from 'nextjs-toploader';
import { PageTracker } from "@/components/page-tracker";
import { Suspense } from "react";

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

  let ogImage = logo;
  if (ogImage.includes("res.cloudinary.com") && ogImage.includes("/upload/")) {
    // Add Cloudinary transformations: 1200x630, pad with white bg, convert to JPG, auto quality
    // This ensures it falls under WhatsApp's 300KB limit and fits perfectly.
    ogImage = ogImage.replace("/upload/", "/upload/w_1200,h_630,c_pad,b_white,f_jpg,q_auto/");
  }

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
          url: ogImage,
          width: 1200,
          height: 630,
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
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: storeName,
        }
      ],
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
    <html lang="ar" dir="rtl" className={fallbackFont.variable} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            ${theme?.primaryColor ? `--color-primary: ${theme.primaryColor}; --color-ring: ${theme.primaryColor};` : ''}
            ${theme?.secondaryColor ? `--color-secondary: ${theme.secondaryColor};` : ''}
            ${theme?.adminColor ? `--color-admin-bg: ${theme.adminColor};` : '--color-admin-bg: #0f172a;'}
          }
        `}} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
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
        <Suspense fallback={null}>
          <PageTracker />
        </Suspense>
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          dir="rtl"
          toastOptions={{
            className: "font-sans flex justify-center text-center rounded-2xl !shadow-none border border-border/50",
          }}
        />
      </body>
    </html>
  );
}
