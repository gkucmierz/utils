import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MAIN_FILE = './main.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname([path.dirname(__filename), '/../src/.'].join(''));

// Recursive file finder returning paths relative to baseDir with forward slashes
function getMjsFilesRecursively(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMjsFilesRecursively(fullPath, baseDir));
    } else if (file.endsWith('.mjs')) {
      const relativePath = path.relative(baseDir, fullPath).split(path.sep).join('/');
      results.push(relativePath);
    }
  });
  return results;
}

const utilsFiles = getMjsFilesRecursively(__dirname);

const allMethods = {};
const map = new Map();

for (const file of utilsFiles) {
  const f = [__dirname, file].join('/');
  const obj = await import(f);
  map.set(file, Object.keys(obj));
  Object.keys(obj).map(key => {
    if (key in allMethods) throw Error(`Duplicate method name: ${key}`);
    allMethods[key] = obj[key];
  });
}

fs.writeFileSync(MAIN_FILE, [
  '',
  ...[...map].map(([file, methods]) => {
    return `import {\n  ${methods.join(', ')}\n} from './src/${file}'`;
  }),
  '',
  ...utilsFiles.map(file => `export * from './src/${file}';`),
  '',
  `export default [`,
  `  ${Object.keys(allMethods).join(', ')}`,
  `];`,
  '',
].join('\n'));
