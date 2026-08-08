import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const slugify = (text: string) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const generateSlug = async (name: string) => {
  let baseSlug = slugify(name);
  if (!baseSlug) {
    baseSlug = name.replace(/\s+/g, '-').substring(0, 50);
  }
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await db.category.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

const safetyId = 'cmskes54f0002byu62sx8yheg';
const totalId = 'cmskeszes0000nblzv53jkjjw';
const pitId = 'cmsg81pee0000ixoetp0729zi';
const restaurantId = 'cmsg8102t0000621750ioc5mc';

const safetyCats = [
  { name: "مهمات الوقاية الشخصية PPE", subs: ["خوذات أمان","نظارات حماية","واقيات الوجه","واقيات الأذن","سدادات الأذن","كمامات","أقنعة تنفس","جوانتيات","أحذية أمان","ملابس عمل وأمان"] },
  { name: "الحماية من السقوط", subs: ["أحزمة أمان","Full Body Harness","حبال أمان","خطوط حياة","لانيارد","معدات تثبيت وربط"] },
  { name: "السلامة من الحريق", subs: ["طفايات حريق","خراطيم حريق","بكرات خراطيم","بطانيات حريق","صناديق ومستلزمات الحريق","لوحات وإشارات الحريق"] },
  { name: "السلامة والتحذير", subs: ["لافتات تحذيرية","علامات السلامة","شريط تحذيري","أقماع مرورية","حواجز سلامة","مرايات السلامة"] },
  { name: "السلامة الصناعية", subs: ["معدات حماية السمع","معدات حماية التنفس","معدات حماية اليد","معدات حماية القدم","معدات حماية الجسم","معدات حماية العين والوجه"] },
  { name: "الإسعافات الأولية", subs: ["شنط إسعافات أولية","صناديق إسعافات","مستلزمات الإسعافات","لوازم الطوارئ"] },
  { name: "السلامة الكهربائية", subs: ["قفازات عزل","أحذية عزل","أدوات عزل","حصائر عازلة","معدات الحماية الكهربائية"] }
];

const totalCats = ["العدد اليدوية","العدد الكهربائية","العدد اللاسلكية","البطاريات والشواحن","اللقم والريش","القطع والتجليخ والصنفرة","أدوات القياس","العدد الهوائية","أدوات السيارات والميكانيكا","أدوات السباكة","أدوات الكهرباء","أدوات النجارة","أدوات البناء والتشطيبات","أطقم وصناديق العدد","إكسسوارات العدد"];

const pitCats = ["العدد الكهربائية","العدد اللاسلكية","الشنيور","الهيلتي والتكسير","الصاروخ والجلاخة","المناشير","الصنفرة والتلميع","البطاريات والشواحن","اللقم والريش","أقراص القطع والتجليخ","العدد اليدوية","أدوات القياس","العدد الهوائية","أطقم العدد","إكسسوارات P.I.T"];

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

export async function GET() {
  try {
    const existingTotal = await db.category.findFirst({ where: { departmentId: totalId } });
    if (!existingTotal) {
      for (const mainCat of safetyCats) {
        const slug = await generateSlug(mainCat.name);
        const createdMain = await db.category.create({ data: { name: mainCat.name, slug, departmentId: safetyId } });
        for (const sub of mainCat.subs) {
          const subSlug = await generateSlug(sub);
          await db.category.create({ data: { name: sub, slug: subSlug, parentId: createdMain.id } });
        }
      }
      for (const mainName of totalCats) {
        const slug = await generateSlug(mainName);
        await db.category.create({ data: { name: mainName, slug, departmentId: totalId } });
      }
      for (const mainName of pitCats) {
        const slug = await generateSlug(mainName);
        await db.category.create({ data: { name: mainName, slug, departmentId: pitId } });
      }
    }

    const existingRes = await db.category.findFirst({ where: { departmentId: restaurantId } });
    if (!existingRes) {
      for (const mainCat of restaurantCats) {
        const slug = await generateSlug(mainCat.name);
        const createdMain = await db.category.create({ data: { name: mainCat.name, slug, departmentId: restaurantId } });
        for (const sub of mainCat.subs) {
          const subSlug = await generateSlug(sub);
          await db.category.create({ data: { name: sub, slug: subSlug, parentId: createdMain.id } });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Seeded successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
