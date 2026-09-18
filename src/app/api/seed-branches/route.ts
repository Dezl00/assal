import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const branches = [
      {
        name: "الإدارة",
        address: "أسوان - النفق عمارة مركز الزهراء الدور الثالث",
        phone: "01000329303",
      },
      {
        name: "معرض العسال فرنتشر للأثاث",
        address: "أسوان شارع الغازات أمام شركة الغازات سابقاً",
        phone: "01098711123",
      },
      {
        name: "مصنع العسال فرنتشر للأثاث",
        address: "أسوان - المنطقة الصناعية الجديدة بالعلاقي",
        phone: "01100663739",
      },
      {
        name: "معرض توتال وتجهيز الفنادق",
        address: "أسوان - العناني عمارة د. عبد الحميد حامد الدور الأرضي",
        phone: "01100663739",
      },
      {
        name: "مول العسال للعدد والأدوات والسلامة المهنية",
        address: "محافظة قنا - شارع 16 - مول العسال.",
        phone: "01100663739 - 01080911981",
      },
    ];

    await db.branch.createMany({ data: branches, skipDuplicates: true });

    return NextResponse.json({ success: true, message: "تم إضافة الفروع بنجاح!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
