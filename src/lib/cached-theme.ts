import { db } from "@/lib/db"
import { unstable_cache } from "next/cache"

/**
 * Centralized cached themeConfig fetcher.
 * Use this everywhere you need themeConfig (especially in generateMetadata)
 * instead of calling db.themeConfig.findUnique directly.
 * 
 * This eliminates 3-5 duplicate uncached DB queries per page load.
 */
export const getCachedThemeConfig = unstable_cache(
  async () => {
    try {
      return await db.themeConfig.findUnique({ where: { id: "default" } })
    } catch (e) {
      return null
    }
  },
  ['global-theme-config'],
  { revalidate: 3600, tags: ['theme-config'] }
)
