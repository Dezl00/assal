import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seed() {
  const branches = [
    {
      name: "الإدارة",
      address: "أسوان- النفق عمارة مركز الزهراء الدور الثالث",
      phone: "01000329303",
    },
    {
      name: "معرض العسال فرنتشر للأثاث",
      address: "أسوان شارع الغازات أمام شركة الغازات سابقاً",
      phone: "01098711123",
    },
    {
      name: "مصنع العسال فرنتشر للأثاث",
      address: "أسوان- المنطقة الصناعية الجديدة بالعلاقي",
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
      phone: "01080911981 - 01100663739",
    },
  ];

  for (const b of branches) {
    const exists = await db.branch.findFirst({ where: { name: b.name } });
    if (!exists) {
      await db.branch.create({ data: b });
      console.log(`Added ${b.name}`);
    } else {
      console.log(`${b.name} already exists`);
    }
  }
}

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); })
