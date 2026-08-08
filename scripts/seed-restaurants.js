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

const restaurantId = 'cmsg8102t0000621750ioc5mc';

const restaurantCats = [
  { name: "معدات المطاعم", subs: ["معدات الطهي","معدات القلي","معدات الشوي","معدات التسخين","معدات البوفيه","معدات تحضير الطعام"] },
  { name: "معدات الكافيهات", subs: ["ماكينات القهوة","مطاحن القهوة","خلاطات","عصارات","معدات المشروبات","معدات تحضير الشاي"] },
  { name: "معدات المخابز والحلويات", subs: ["أفران","عجان","خلاطات","معدات تشكيل","معدات تخمير","معدات حفظ وعرض"] },
  { name: "التبريد والتجميد", subs: ["ثلاجات","فريزرات","ثلاجات عرض","فريزرات عرض","ثلاجات تحت الطاولة","معدات حفظ الطعام"] },
  { name: "معدات التحضير", subs: ["قطاعات خضار","قطاعات لحوم","مفرمات","عجان","خلاطات","معدات تقطيع","معدات تجهيز وتحضير"] },
  { name: "معدات الغسيل والنظافة", subs: ["أحواض غسيل","غسالات أطباق","معدات تنظيف","طاولات غسيل","وحدات صرف"] },
  { name: "معدات الستانلس", subs: ["طاولات ستانلس","أرفف","أحواض","عربات","خزائن","وحدات تجهيز"] },
  { name: "التهوية والشفاطات", subs: ["شفاطات","هود مطاعم","فلاتر","مراوح","أنظمة تهوية"] },
  { name: "أدوات ومستلزمات المطاعم", subs: ["أدوات تقديم","أدوات مائدة","صواني","أواني","حلل","سكاكين","ملاعق ومغارف","مستلزمات البوفيه"] },
  { name: "معدات التعبئة والتغليف", subs: ["ماكينات تغليف","ماكينات تفريغ هواء","أكياس وعبوات","أدوات تعبئة"] },
  { name: "معدات الآيس كريم والحلويات", subs: ["ماكينات آيس كريم","فريزرات آيس كريم","معدات وافل وكريب"] }
];

async function main() {
  console.log("Adding Restaurant categories...");
  for (const mainCat of restaurantCats) {
    const slug = await generateSlug(mainCat.name);
    const createdMain = await prisma.category.create({
      data: {
        name: mainCat.name,
        slug,
        departmentId: restaurantId
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
