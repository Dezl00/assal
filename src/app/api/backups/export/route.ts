import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [products, categories, departments, brands, orders, users, themeConfig, branches] = await Promise.all([
      db.product.findMany({ include: { images: true } }),
      db.category.findMany(),
      db.department.findMany(),
      db.brand.findMany(),
      db.order.findMany({ include: { items: true } }),
      db.user.findMany(),
      db.themeConfig.findUnique({ where: { id: "default" } }),
      db.branch.findMany()
    ])

    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
      data: {
        products,
        categories,
        departments,
        brands,
        orders,
        users,
        themeConfig,
        branches
      }
    }

    const jsonString = JSON.stringify(backupData, null, 2)
    const buffer = Buffer.from(jsonString, "utf-8")

    // Log the backup
    await db.backup.create({
      data: {
        filename: `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
        size: buffer.byteLength,
        status: "COMPLETED"
      }
    })

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="assal-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error("Backup failed", error)
    return NextResponse.json({ error: "Failed to generate backup" }, { status: 500 })
  }
}
