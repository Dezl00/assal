import type { Metadata } from "next";
// import localFont from "next/font/local";
import { Cairo } from "next/font/google"; // Temporary fallback until DG Agnadeen is uploaded
import "./globals.css";

/* 
// UNCOMMENT THIS WHEN FONTS ARE UPLOADED TO src/fonts/
const agnadeenFont = localFont({
  src: [
    {
      path: "../fonts/DGAgnadeen-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/DGAgnadeen-Medium.woff2",
      weight: "500",
      style: "normal",
    }
  ],
  variable: "--font-agnadeen",
  display: "swap",
});
*/

const fallbackFont = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500"],
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
