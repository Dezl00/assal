import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ translated: '' });
    
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    const translatedText = data[0][0][0] || text;
    
    // Convert to slug format (e.g. "Natural Honey" -> "natural-honey")
    let slug = translatedText.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w0-9\-]+/g, '');
    
    // Ensure slug isn't empty or just a dash
    if (!slug || slug === '-') {
      slug = 'slug-' + Math.random().toString(36).substring(2, 6);
    }
    
    return NextResponse.json({ translated: slug });
  } catch (error) {
    console.error("Translation error:", error);
    // Fallback to basic transliteration or random string
    return NextResponse.json({ translated: 'brand-' + Math.random().toString(36).substring(2, 6) });
  }
}
