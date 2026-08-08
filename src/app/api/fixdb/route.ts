import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const article = await db.article.findFirst({
    where: { slug: decodeURIComponent('%D9%83%D9%8A%D9%81-%D8%AA%D8%AE%D8%AA%D8%A7%D8%B1-%D8%A7%D9%84%D8%B4%D9%86%D9%8A%D9%88%D8%B1-%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%B3%D8%A8-0244') }
  });
  if (!article) return NextResponse.json({ error: "Not found" });
  
  let newContent = article.content.replace(/<a href="(https:\/\/www\.youtube\.com\/embed\/[^"]+)">(?:https:\/\/www\.youtube\.com\/embed\/[^<]+)<\/a>/gi, '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="$1"></iframe>');
  
  await db.article.update({
    where: { id: article.id },
    data: { content: newContent }
  });
  
  return NextResponse.json({ message: "Updated", old: article.content, new: newContent });
}
