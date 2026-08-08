import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

// Helper to generate a slug
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const data = [
  {
    name: "العسال للعدد",
    sub: [
      "مفكات",
      "مفاتيح",
      "بنسات وكماشة",
      "شواكيش ومطارق",
      "أزاميل",
      "سكاكين وأدوات قطع",
      "مناشير يدوية",
      "مبارد",
      "أدوات خلع وسحب",
      "أدوات تثبيت وربط",
      "أطقم عدة"
    ]
  },
  {
    name: "العدد الكهربائية",
    sub: [
      "شنيور",
      "شنيور دقاق",
      "هيلتي وتكسير",
      "صاروخ وجلاخة",
      "مناشير كهربائية",
      "صنفرة وتلميع",
      "راوتر",
      "مسدسات حرارية",
      "مسدسات رش",
      "خلاطات",
      "العدد اللاسلكية",
      "Brushless"
    ]
  },
  {
    name: "البطاريات والشواحن",
    sub: [
      "بطاريات",
      "شواحن",
      "بطاريات ليثيوم",
      "أطقم بطارية + شاحن",
      "إكسسوارات البطاريات"
    ]
  },
  {
    name: "القياس والمعايرة",
    sub: [
      "متر وشريط قياس",
      "ميزان مياه",
      "ميزان ليزر",
      "أجهزة قياس المسافات",
      "قدم ورنية",
      "ميكرومتر",
      "فرجار",
      "أجهزة قياس دقيقة"
    ]
  },
  {
    name: "اللقم والريش والإكسسوارات",
    sub: [
      "لقم مفكات",
      "لقم شنيور",
      "ريش خرسانة",
      "ريش حديد",
      "ريش خشب",
      "ريش زجاج وسيراميك",
      "ريش متعددة الاستخدام",
      "سوكيت ولقم",
      "وصلات وأطراف",
      "حوامل لقم"
    ]
  },
  {
    name: "القطع والتجليخ والصنفرة",
    sub: [
      "أقراص قطع",
      "أقراص تجليخ",
      "أقراص صنفرة",
      "شفرات مناشير",
      "فرش سلك",
      "أحجار تجليخ",
      "ورق صنفرة"
    ]
  },
  {
    name: "عدد السيارات والميكانيكا",
    sub: [
      "أطقم ميكانيكا",
      "مفاتيح ميكانيكا",
      "سوكيت",
      "مفاتيح عزم",
      "مفاتيح فلتر",
      "أدوات فك وتركيب",
      "أدوات سحب",
      "كوريك",
      "حوامل سيارات",
      "معدات تغيير الزيوت",
      "أجهزة فحص السيارات"
    ]
  },
  {
    name: "عدد السباكة",
    sub: [
      "مفاتيح مواسير",
      "أدوات قطع المواسير",
      "أدوات تركيب المواسير",
      "أدوات لحام المواسير",
      "أدوات تسليك",
      "معدات PPR",
      "معدات PVC"
    ]
  },
  {
    name: "عدد الكهرباء",
    sub: [
      "بنسات كهرباء",
      "قواطع أسلاك",
      "أدوات تعرية الأسلاك",
      "مفكات كهرباء",
      "أدوات كبس",
      "أدوات تركيب الكابلات",
      "أفوميتر",
      "كماشة أمبير",
      "كاشف كهرباء"
    ]
  },
  {
    name: "العدد الهوائية والضغط",
    sub: [
      "كمبروسرات",
      "مسدسات هواء",
      "مفاتيح Impact",
      "شنيور هواء",
      "صاروخ هواء",
      "دباسات هواء",
      "مسدسات رش",
      "خراطيم هواء",
      "وصلات هواء"
    ]
  },
  {
    name: "المعدات الهيدروليكية",
    sub: [
      "جاكات هيدروليك",
      "طلمبات هيدروليك",
      "مكابس",
      "قواطع هيدروليك",
      "أدوات كبس",
      "معدات رفع",
      "معدات سحب"
    ]
  },
  {
    name: "معدات الورش والتخزين",
    sub: [
      "مناضد عمل",
      "عربات عدة",
      "ملزمات",
      "حوامل معدات",
      "خزائن وأدراج عدة",
      "منظمات العدد",
      "معدات تخزين"
    ]
  },
  {
    name: "أطقم وصناديق العدد",
    sub: [
      "شنط عدة",
      "صناديق عدة",
      "عربات عدة",
      "أطقم عدة يدوية",
      "أطقم ميكانيكا",
      "أطقم مفكات",
      "أطقم لقم"
    ]
  }
];

async function generateUniqueSlug(baseName: string) {
  let slug = generateSlug(baseName);
  let count = 1;
  let uniqueSlug = slug;
  
  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug: uniqueSlug }
    });
    if (!existing) break;
    uniqueSlug = `${slug}-${count}`;
    count++;
  }
  return uniqueSlug;
}

export async function GET() {
  const session = await auth();
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let results = [];
    
    for (const mainCat of data) {
      const mainSlug = await generateUniqueSlug(mainCat.name);
      
      // check if it exists by name first to avoid duplicates if run multiple times
      let createdMainCat = await prisma.category.findFirst({
        where: { name: mainCat.name, parentId: null }
      });
      
      if (!createdMainCat) {
        createdMainCat = await prisma.category.create({
          data: {
            name: mainCat.name,
            slug: mainSlug,
          }
        });
        results.push(`Created Main: ${createdMainCat.name}`);
      } else {
        results.push(`Skipped Main (Already exists): ${createdMainCat.name}`);
      }

      for (const subCat of mainCat.sub) {
        let existingSub = await prisma.category.findFirst({
          where: { name: subCat, parentId: createdMainCat.id }
        });
        
        if (!existingSub) {
          const subSlug = await generateUniqueSlug(subCat);
          await prisma.category.create({
            data: {
              name: subCat,
              slug: subSlug,
              parentId: createdMainCat.id
            }
          });
          results.push(`Created Sub: ${subCat}`);
        } else {
          results.push(`Skipped Sub (Already exists): ${subCat}`);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Category seeding completed", details: results });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to seed categories" }, { status: 500 });
  }
}
