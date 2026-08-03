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
      icon: [
        { url: favicon, href: favicon }
      ],
      apple: [
        { url: favicon, href: favicon }
      ],
      shortcut: [
        { url: favicon, href: favicon }
      ]
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={fallbackFont.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
