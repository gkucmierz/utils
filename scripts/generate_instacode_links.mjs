import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lzString from 'lz-string';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

const files = fs.readdirSync(srcDir).filter(name => name.endsWith('.mjs'));

for (const file of files) {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  const obj = await import('file://' + filePath);
  const exportedNames = Object.keys(obj);

  let updatedFunctions = [];

  for (const name of exportedNames) {
    const code = `\nimport { ${name} } from "@gkucmierz/utils";\n\n${name};\n`;
    const hash = lzString.compressToEncodedURIComponent(code);
    const url = `https://instacode.app/run/${hash}`;
    const seeTag = `@see {@link ${url}|▶ Try it live in Instacode}`;

    const regex = new RegExp(`(\\/\\*\\*(?:(?!\\*\\/)[\\s\\S])*?)(\n\\s*\\*\\/\\n\\s*export\\s+(?:const|function|class|let|var)\\s+${name}\\b)`);
    
    content = content.replace(regex, (match, p1, p2) => {
      const cleanP1 = p1.replace(/\n\s*\*\s*@see\s*\{@link\s*https:\/\/instacode\.app\/run\/[^}]+\}/g, '');
      updatedFunctions.push(name);
      return `${cleanP1}\n * ${seeTag}${p2}`;
    });
  }

  if (updatedFunctions.length > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file} (added links for: ${updatedFunctions.join(', ')})`);
  }
}
