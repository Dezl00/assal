const fs = require('fs');

function addTag(file, tag) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('updateTag')) {
    content = content.replace(/import \{.*?revalidatePath.*?\} from "next\/cache"/, 'import { revalidatePath, updateTag } from "next/cache"');
  }

  // Insert updateTag(tag) after revalidatePath
  const regex = new RegExp(`revalidatePath\\(["'].*?["']\\)`, 'g');
  
  // We only want to insert it once per function. Let's just find `revalidatePath("/admin/products")` for products
  // and insert updateTag("products") after it.
  
  const blocks = content.split('export async function');
  for (let i = 1; i < blocks.length; i++) {
    if (blocks[i].includes('revalidatePath')) {
      // replace the LAST revalidatePath in this block
      const lastIndex = blocks[i].lastIndexOf('revalidatePath(');
      if (lastIndex !== -1 && !blocks[i].includes(`updateTag("${tag}")`)) {
         const endOfLine = blocks[i].indexOf('\n', lastIndex);
         blocks[i] = blocks[i].substring(0, endOfLine) + `\n    updateTag("${tag}")` + blocks[i].substring(endOfLine);
      }
    }
  }
  
  content = blocks[0] + blocks.slice(1).map(b => 'export async function' + b).join('');
  
  fs.writeFileSync(file, content);
}

addTag('src/features/products/actions.ts', 'products');
addTag('src/features/categories/actions.ts', 'categories');
addTag('src/features/departments/actions.ts', 'departments');

if (fs.existsSync('src/features/catalog/actions.ts')) {
  addTag('src/features/catalog/actions.ts', 'brands');
}
