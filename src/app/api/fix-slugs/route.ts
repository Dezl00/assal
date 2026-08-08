import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function GET() {
  try {
    const articles = await db.article.findMany();
    let updatedCount = 0;
    
    for (const article of articles) {
      // Regenerate the slug purely from the title
      const correctSlug = generateSlug(article.title);
      
      // Check if current slug has the "-1234" random suffix or is just different
      if (article.slug !== correctSlug) {
        try {
          await db.article.update({
            where: { id: article.id },
            data: { slug: correctSlug }
          });
          updatedCount++;
        } catch (e: any) {
          // If there's a unique constraint violation, it will skip
          console.error(`Failed to update slug for ${article.title}:`, e.message);
        }
      }
    }
    
    return NextResponse.json({ success: true, updatedCount, totalChecked: articles.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
