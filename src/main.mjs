
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = fs.readdirSync(__dirname);

const utilsFiles = files
  .filter(name => name.match(/\.mjs$/))
  .filter(name => name !== 'main.mjs');

const methods = {};

for (const file of utilsFiles) {
  const obj = await import(`./${file}`);
  Object.keys(obj).map(key => {
    if (key in methods) throw Error('Duplicate method name');
    methods[key] = obj[key];
  });
};

export default methods;
