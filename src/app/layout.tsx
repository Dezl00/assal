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
  
  return {
    title: theme?.storeName || "عسل",
    description: theme?.storeDescription || "أفضل المنتجات وأعلاها جودة",
    icons: {
      icon: theme?.faviconUrl || "/favicon.ico",
    }
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
