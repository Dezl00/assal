import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';

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

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const config = await prisma.themeConfig.findFirst({ where: { id: "default" } });
    if (!config || config.backupFrequency === 'never') {
      return NextResponse.json({ message: 'Auto backup disabled' });
    }
    
    const [products, categories, departments, brands] = await Promise.all([
      prisma.product.findMany({ include: { images: true } }),
      prisma.category.findMany(),
      prisma.department.findMany(),
      prisma.brand.findMany(),
    ]);

    const [orders, users, themeConfig, branches] = await Promise.all([
      prisma.order.findMany({ include: { items: true } }),
      prisma.user.findMany({ select: { id: true, name: true, phone: true, email: true, role: true, address: true, createdAt: true } }),
      prisma.themeConfig.findUnique({ where: { id: "default" } }),
      prisma.branch.findMany(),
    ]);

    const [widgets, collections] = await Promise.all([
      prisma.widget.findMany({ include: { items: true } }),
      prisma.collection.findMany({ include: { products: { select: { id: true } } } }),
    ]);

    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.1",
      },
      data: {
        products, categories, departments, brands, orders, users, themeConfig, branches, widgets, collections
      }
    };
    
    // We log success and could return it directly, but for cron we return a simplified response.
    // Recording in DB that a backup was requested.
    await prisma.backup.create({
      data: {
        filename: `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
        size: JSON.stringify(backupData).length,
        status: 'COMPLETED'
      }
    });
    
    return new NextResponse(JSON.stringify(backupData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json"`,
      },
    });
  } catch (error) {
    console.error("Cron backup error:", error);
    return NextResponse.json({ success: false, error: 'Cron backup failed' }, { status: 500 });
  }
}
