import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 

async function run() { 
  const widgets = await prisma.widget.findMany({ 
    where: { type: 'BrandSlider' }, 
    include: { items: true } 
  }); 
  
  for (const widget of widgets) { 
    const settings = widget.settings; 
    if (settings && settings.disableRouting) { 
      for (const item of widget.items) { 
        if (item.title) { 
          await prisma.brand.deleteMany({ where: { name: item.title } }); 
          console.log('Deleted brand:', item.title); 
        } 
      } 
    } 
  } 
} 

run().catch(console.error).finally(() => prisma.$disconnect());
