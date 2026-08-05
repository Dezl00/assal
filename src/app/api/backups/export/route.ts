import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import JSZip from "jszip"
import fs from "fs/promises"
import path from "path"

async function addFolderToZipAsync(folderPath: string, zip: JSZip, rootPath: string) {
  try {
    const items = await fs.readdir(folderPath, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(folderPath, item.name);
      if (item.isDirectory()) {
        await addFolderToZipAsync(fullPath, zip, rootPath);
      } else {
        const relativePath = path.relative(rootPath, fullPath);
        const fileData = await fs.readFile(fullPath);
        zip.file(`public/${relativePath.replace(/\\/g, '/')}`, fileData);
      }
    }
  } catch (error) {
    console.error("Error reading folder:", error);
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [products, categories, departments, brands, orders, users, themeConfig, branches, widgets] = await Promise.all([
      db.product.findMany({ include: { images: true } }),
      db.category.findMany(),
      db.department.findMany(),
      db.brand.findMany(),
      db.order.findMany({ include: { items: true } }),
      db.user.findMany(),
      db.themeConfig.findUnique({ where: { id: "default" } }),
      db.branch.findMany(),
      db.widget.findMany({ include: { items: true } })
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
        branches,
        widgets
      }
    }

    const jsonString = JSON.stringify(backupData, null, 2)

    const zip = new JSZip()
    zip.file("backup.json", jsonString)

    const publicPath = path.join(process.cwd(), "public");
    await addFolderToZipAsync(publicPath, zip, publicPath);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    const filename = `assal-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`

    // Log the backup
    await db.backup.create({
      data: {
        filename,
        size: zipBuffer.byteLength,
        status: "COMPLETED"
      }
    })

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error("Backup export failed", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
