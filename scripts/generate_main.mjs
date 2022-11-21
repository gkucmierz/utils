
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MAIN_FILE = './main.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname([path.dirname(__filename), '/../src/.'].join(''));

const files = fs.readdirSync(__dirname);

const utilsFiles = files
  .filter(name => name.match(/\.mjs$/))
  .filter(name => name !== 'main.mjs');

const allMethods = {};
const map = new Map();

for (const file of utilsFiles) {
  const f = [__dirname, file].join('/');
  const obj = await import(f);
  map.set(file, Object.keys(obj));
  Object.keys(obj).map(key => {
    if (key in allMethods) throw Error('Duplicate method name');
    allMethods[key] = obj[key];
  });
};

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

