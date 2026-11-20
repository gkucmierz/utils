import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..');
const DOCS_SRC_DIR = path.join(ROOT_DIR, 'docs-src');
const DOCS_OUT_DIR = path.join(ROOT_DIR, 'docs');

const ROUTE_SLUGS = [
  'orthotope',
  'compendium',
  'grid-nav',
  'statistics',
  'combinatorics',
  'color',
  'matrix',
];

const copyDirRecursive = (srcDir, destDir) => {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

/* ==========================================================================
 * DETERMINISTIC 1200x630 OG SOCIAL PREVIEW PNG GENERATOR (Zero Dependencies)
 * ======================================================================== */
const buildCrc32Table = () => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
};

const CRC_TABLE = buildCrc32Table();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const makePngChunk = (typeStr, dataBuf) => {
  const typeBuf = Buffer.from(typeStr, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(dataBuf.length, 0);
  const crcInput = Buffer.concat([typeBuf, dataBuf]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
};

const generateOgImagePng = (outPath) => {
  const W = 1200;
  const H = 630;
  const rgb = new Uint8Array(W * H * 3);

  const setPx = (x, y, r, g, b, alpha = 1) => {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || ix >= W || iy < 0 || iy >= H) return;
    const off = (iy * W + ix) * 3;
    if (alpha >= 1) {
      rgb[off] = r;
      rgb[off + 1] = g;
      rgb[off + 2] = b;
    } else {
      rgb[off] = Math.round(rgb[off] * (1 - alpha) + r * alpha);
      rgb[off + 1] = Math.round(rgb[off + 1] * (1 - alpha) + g * alpha);
      rgb[off + 2] = Math.round(rgb[off + 2] * (1 - alpha) + b * alpha);
    }
  };

  const fillRect = (x0, y0, w, h, r, g, b, alpha = 1) => {
    const sx = Math.max(0, Math.floor(x0));
    const ex = Math.min(W - 1, Math.ceil(x0 + w));
    const sy = Math.max(0, Math.floor(y0));
    const ey = Math.min(H - 1, Math.ceil(y0 + h));
    for (let y = sy; y <= ey; y += 1) {
      for (let x = sx; x <= ex; x += 1) {
        setPx(x, y, r, g, b, alpha);
      }
    }
  };

  const drawSegment = (x1, y1, x2, y2, thickness, r, g, b, alpha = 1) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) * 1.5));
    const rad = Math.max(1, Math.floor(thickness / 2));
    for (let s = 0; s <= steps; s += 1) {
      const px = x1 + (dx * s) / steps;
      const py = y1 + (dy * s) / steps;
      for (let oy = -rad; oy <= rad; oy += 1) {
        for (let ox = -rad; ox <= rad; ox += 1) {
          if (ox * ox + oy * oy <= rad * rad + 1) {
            setPx(px + ox, py + oy, r, g, b, alpha);
          }
        }
      }
    }
  };

  const drawDisk = (cx, cy, rad, r, g, b) => {
    for (let oy = -rad; oy <= rad; oy += 1) {
      for (let ox = -rad; ox <= rad; ox += 1) {
        if (ox * ox + oy * oy <= rad * rad) {
          setPx(cx + ox, cy + oy, r, g, b, 1);
        }
      }
    }
  };

  // 1. Dark graphite background (#111316) + subtle Cartesian grid (#1b2026)
  fillRect(0, 0, W, H, 17, 19, 22, 1);
  for (let gx = 60; gx < W; gx += 60) {
    drawSegment(gx, 0, gx, H, 1, 28, 34, 41, 0.85);
  }
  for (let gy = 60; gy < H; gy += 60) {
    drawSegment(0, gy, W, gy, 1, 28, 34, 41, 0.85);
  }

  // Outer card frame (#2a3139) + top accent bar (#2dd4bf)
  fillRect(42, 42, W - 84, H - 84, 24, 28, 32, 0.88);
  fillRect(42, 42, W - 84, 6, 45, 212, 191, 1);

  // 2. Left visual: 2D Boolean AABB Shards (diffBox decomposition)
  fillRect(100, 140, 260, 220, 45, 212, 191, 0.22);
  drawSegment(100, 140, 360, 140, 4, 45, 212, 191, 1);
  drawSegment(100, 360, 360, 360, 4, 45, 212, 191, 1);
  drawSegment(100, 140, 100, 360, 4, 45, 212, 191, 1);
  drawSegment(360, 140, 360, 360, 4, 45, 212, 191, 1);

  fillRect(230, 210, 220, 210, 251, 191, 36, 0.22);
  drawSegment(230, 210, 450, 210, 4, 251, 191, 36, 1);
  drawSegment(230, 420, 450, 420, 4, 251, 191, 36, 1);
  drawSegment(230, 210, 230, 420, 4, 251, 191, 36, 1);
  drawSegment(450, 210, 450, 420, 4, 251, 191, 36, 1);

  // Intersection highlight (emerald #34d399)
  fillRect(230, 210, 130, 150, 52, 211, 153, 0.36);

  // 1D timeline interval bar along bottom left
  drawSegment(100, 500, 480, 500, 5, 56, 189, 248, 1);
  drawDisk(100, 500, 10, 45, 212, 191);
  drawDisk(310, 500, 10, 251, 191, 36);
  drawDisk(480, 500, 10, 56, 189, 248);

  // 3. Right visual: 4D Schlegel Tesseract Projection (outer + inner cube + 8 w-bridges)
  const cx = 860;
  const cy = 325;
  const outer = [
    [cx - 165, cy - 145],
    [cx + 125, cy - 145],
    [cx + 175, cy - 95],
    [cx - 115, cy - 95],
    [cx - 165, cy + 135],
    [cx + 125, cy + 135],
    [cx + 175, cy + 185],
    [cx - 115, cy + 185],
  ];
  const inner = [
    [cx - 75, cy - 62],
    [cx + 55, cy - 62],
    [cx + 85, cy - 34],
    [cx - 45, cy - 34],
    [cx - 75, cy + 58],
    [cx + 55, cy + 58],
    [cx + 85, cy + 86],
    [cx - 45, cy + 86],
  ];
  const cubeEdges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  for (let i = 0; i < 8; i += 1) {
    drawSegment(outer[i][0], outer[i][1], inner[i][0], inner[i][1], 3, 192, 132, 252, 0.85);
  }
  cubeEdges.forEach(([u, v]) => {
    drawSegment(outer[u][0], outer[u][1], outer[v][0], outer[v][1], 5, 45, 212, 191, 1);
    drawSegment(inner[u][0], inner[u][1], inner[v][0], inner[v][1], 4, 251, 191, 36, 1);
  });
  outer.forEach(([px, py]) => drawDisk(px, py, 7, 45, 212, 191));
  inner.forEach(([px, py]) => drawDisk(px, py, 6, 251, 191, 36));

  // Encode raw scanlines with filter byte 0 per row
  const rawScanlines = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y += 1) {
    const rowStart = y * (1 + W * 3);
    rawScanlines[rowStart] = 0;
    const srcStart = y * W * 3;
    Buffer.from(rgb.buffer, srcStart, W * 3).copy(rawScanlines, rowStart + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type 2 = Truecolor RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const pngBuf = Buffer.concat([
    signature,
    makePngChunk('IHDR', ihdr),
    makePngChunk('IDAT', compressed),
    makePngChunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(outPath, pngBuf);
};

/* ==========================================================================
 * BUILD PIPELINE EXECUTION
 * ======================================================================== */
fs.mkdirSync(DOCS_OUT_DIR, { recursive: true });

// 1. Preserve JSDoc landing page as docs/api.html and prune legacy SVG webfonts
const fontsDir = path.join(DOCS_OUT_DIR, 'fonts');
if (fs.existsSync(fontsDir)) {
  const pruneSvgFonts = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) pruneSvgFonts(full);
      else if (entry.name.endsWith('.svg')) fs.unlinkSync(full);
    });
  };
  pruneSvgFonts(fontsDir);
}

const jsdocIndexPath = path.join(DOCS_OUT_DIR, 'index.html');
const apiHtmlPath = path.join(DOCS_OUT_DIR, 'api.html');
if (fs.existsSync(jsdocIndexPath)) {
  const existingHtml = fs.readFileSync(jsdocIndexPath, 'utf8');
  if (!existingHtml.includes('id="help-dialog"')) {
    fs.renameSync(jsdocIndexPath, apiHtmlPath);
  }
}

const docHtmlFiles = fs.readdirSync(DOCS_OUT_DIR).filter((f) => f.endsWith('.html'));
docHtmlFiles.forEach((fileName) => {
  const fullPath = path.join(DOCS_OUT_DIR, fileName);
  let html = fs.readFileSync(fullPath, 'utf8');
  html = html.replace(/href="index\.html"/g, 'href="api.html"');
  if (html.includes('<nav') && !html.includes('data-visual-sandbox-link')) {
    html = html.replace(
      /<nav([^>]*)>/,
      '<nav$1><div data-visual-sandbox-link="1" style="padding:10px 14px 4px"><a href="./index.html" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:7px;background:#0f766e;color:#ffffff;font-weight:700;font-size:13px;text-decoration:none">← Interactive Visual Sandbox</a></div>'
    );
  }
  fs.writeFileSync(fullPath, html, 'utf8');
});

// 2. Copy live ESM library into docs/esm/
const esmDir = path.join(DOCS_OUT_DIR, 'esm');
fs.mkdirSync(esmDir, { recursive: true });
fs.copyFileSync(path.join(ROOT_DIR, 'main.mjs'), path.join(esmDir, 'main.mjs'));
copyDirRecursive(path.join(ROOT_DIR, 'src'), path.join(esmDir, 'src'));

// 3. Copy interactive visual docs assets from docs-src/ -> docs/
copyDirRecursive(DOCS_SRC_DIR, DOCS_OUT_DIR);

// 4. Generate clean HTML5 static route entrypoints docs/<slug>/index.html
const rootIndexHtml = fs.readFileSync(path.join(DOCS_SRC_DIR, 'index.html'), 'utf8');
const subRouteHtml = rootIndexHtml
  .replace(/href="\.\//g, 'href="../')
  .replace(/src="\.\//g, 'src="../');

ROUTE_SLUGS.forEach((slug) => {
  const routeDir = path.join(DOCS_OUT_DIR, slug);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), subRouteHtml, 'utf8');
});

// 5. Generate deterministic 1200x630 Open Graph preview card
generateOgImagePng(path.join(DOCS_OUT_DIR, 'og-image.png'));
