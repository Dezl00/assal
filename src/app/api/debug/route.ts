import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const article = await db.article.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ content: article?.content });
}
