import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const config = await db.themeConfig.findUnique({
    where: { id: "default" }
  })

  const storeName = config?.storeName || "لوحة التحكم"
  const adminName = `${storeName} - الإدارة`
  
  const defaultIcon = "/icon-512x512.png" 
  const baseIconUrl = config?.logoUrl || defaultIcon

  function getIcon(url: string, size: number) {
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', `/upload/w_${size},h_${size},c_pad,f_png/`)
    }
    return url
  }

  const manifest = {
    name: adminName,
    short_name: "الإدارة",
    description: `لوحة تحكم إدارة متجر ${storeName}`,
    start_url: "/admin",
    display: "standalone",
    background_color: config?.adminColor || "#ffffff",
    theme_color: config?.adminColor || "#2453E3",
    scope: "/admin/",
    icons: [
      {
        src: getIcon(baseIconUrl, 192),
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: getIcon(baseIconUrl, 512),
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  }

  return NextResponse.json(manifest)
}
