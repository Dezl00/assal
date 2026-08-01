import type { Metadata } from "next";
// import localFont from "next/font/local";
import { IBM_Plex_Sans_Arabic } from "next/font/google"; // Requested font by user
import "./globals.css";

const fallbackFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-agnadeen",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Assal | Enterprise E-Commerce",
  description: "Premium enterprise e-commerce platform.",
  // Next.js will auto-generate other tags in specialized files later
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${fallbackFont.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
