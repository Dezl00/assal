const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const generateSlug = async (name) => {
  let baseSlug = slugify(name);
  if (!baseSlug) {
    // Fallback for Arabic only strings that might get stripped completely by \w
    baseSlug = name.replace(/\s+/g, '-').substring(0, 50);
  }
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

const safetyId = 'cmskes54f0002byu62sx8yheg';
const totalId = 'cmskeszes0000nblzv53jkjjw';
const pitId = 'cmsg81pee0000ixoetp0729zi';

const safetyCats = [
  {
    name: "مهمات الوقاية الشخصية PPE",
    subs: [
      "خوذات أمان",
      "نظارات حماية",
      "واقيات الوجه",
      "واقيات الأذن",
      "سدادات الأذن",
      "كمامات",
      "أقنعة تنفس",
      "جوانتيات",
      "أحذية أمان",
      "ملابس عمل وأمان"
    ]
  },
  {
    name: "الحماية من السقوط",
    subs: [
      "أحزمة أمان",
      "Full Body Harness",
      "حبال أمان",
      "خطوط حياة",
      "لانيارد",
      "معدات تثبيت وربط"
    ]
  },
  {
    name: "السلامة من الحريق",
    subs: [
      "طفايات حريق",
      "خراطيم حريق",
      "بكرات خراطيم",
      "بطانيات حريق",
      "صناديق ومستلزمات الحريق",
      "لوحات وإشارات الحريق"
    ]
  },
  {
    name: "السلامة والتحذير",
    subs: [
      "لافتات تحذيرية",
      "علامات السلامة",
      "شريط تحذيري",
      "أقماع مرورية",
      "حواجز سلامة",
      "مرايات السلامة"
    ]
  },
  {
    name: "السلامة الصناعية",
    subs: [
      "معدات حماية السمع",
      "معدات حماية التنفس",
      "معدات حماية اليد",
      "معدات حماية القدم",
      "معدات حماية الجسم",
      "معدات حماية العين والوجه"
    ]
  },
  {
    name: "الإسعافات الأولية",
    subs: [
      "شنط إسعافات أولية",
      "صناديق إسعافات",
      "مستلزمات الإسعافات",
      "لوازم الطوارئ"
    ]
  },
  {
    name: "السلامة الكهربائية",
    subs: [
      "قفازات عزل",
      "أحذية عزل",
      "أدوات عزل",
      "حصائر عازلة",
      "معدات الحماية الكهربائية"
    ]
  }
];

const totalCats = [
  "العدد اليدوية",
  "العدد الكهربائية",
  "العدد اللاسلكية",
  "البطاريات والشواحن",
  "اللقم والريش",
  "القطع والتجليخ والصنفرة",
  "أدوات القياس",
  "العدد الهوائية",
  "أدوات السيارات والميكانيكا",
  "أدوات السباكة",
  "أدوات الكهرباء",
  "أدوات النجارة",
  "أدوات البناء والتشطيبات",
  "أطقم وصناديق العدد",
  "إكسسوارات العدد"
];

const pitCats = [
  "العدد الكهربائية",
  "العدد اللاسلكية",
  "الشنيور",
  "الهيلتي والتكسير",
  "الصاروخ والجلاخة",
  "المناشير",
  "الصنفرة والتلميع",
  "البطاريات والشواحن",
  "اللقم والريش",
  "أقراص القطع والتجليخ",
  "العدد اليدوية",
  "أدوات القياس",
  "العدد الهوائية",
  "أطقم العدد",
  "إكسسوارات P.I.T"
];

async function main() {
  console.log("Adding Safety categories...");
  for (const mainCat of safetyCats) {
    const slug = await generateSlug(mainCat.name);
    const createdMain = await prisma.category.create({
      data: {
        name: mainCat.name,
        slug,
        departmentId: safetyId
      }
    });
    console.log(`Created Main: ${createdMain.name}`);

    for (const sub of mainCat.subs) {
      const subSlug = await generateSlug(sub);
      await prisma.category.create({
        data: {
          name: sub,
          slug: subSlug,
          parentId: createdMain.id
        }
      });
      console.log(`  Created Sub: ${sub}`);
    }
  }

  console.log("\nAdding Total categories...");
  for (const mainName of totalCats) {
    const slug = await generateSlug(mainName);
    await prisma.category.create({
      data: {
        name: mainName,
        slug,
        departmentId: totalId
      }
    });
    console.log(`Created Main: ${mainName}`);
  }

  console.log("\nAdding P.I.T categories...");
  for (const mainName of pitCats) {
    const slug = await generateSlug(mainName);
    await prisma.category.create({
      data: {
        name: mainName,
        slug,
        departmentId: pitId
      }
    });
    console.log(`Created Main: ${mainName}`);
  }

  console.log("\nDone!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
