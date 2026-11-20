import {
  range,
  formatRange,
  mutualRange,
  sumRange,
  diffRange,
  xorRange,
  measureRange,
  mutualBox,
  sumBox,
  diffBox,
  xorBox,
  measureBox,
  OrthoSet,
  getOrthotopeTaxonomy,
  explodeBoxesNd,
  projectBox3D,
  sliceBox4DAtW,
  sliceBoxes4DAtW,
  projectBox4DSchlegel,
  sampleSmallMultiples4D,
  evaluateParallelAxesNd,
  buildPairwiseProjectionsNd,
} from './esm/main.mjs';

const SHARD_PALETTE_DARK = ['#2dd4bf', '#38bdf8', '#fbbf24', '#c084fc', '#34d399', '#fb7185', '#f472b6', '#a3e635'];
const SHARD_PALETTE_LIGHT = ['#0f766e', '#0369a1', '#b45309', '#7e22ce', '#047857', '#be123c', '#be185d', '#4d7c0f'];

const snapQuarter = (v) => Math.max(0, Math.min(10, Math.round(v * 4) / 4));
const fmtNum = (n) => (Number.isInteger(n) ? String(n) : Number(n.toFixed(3)).toString());

const hexWithAlpha = (hex, alpha) => {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const computeOpBoxes = (op, boxA, boxB) => {
  const setA = new OrthoSet(boxA);
  const setB = new OrthoSet(boxB);
  if (op === 'AND') return setA.and(setB).toArray();
  if (op === 'OR') return setA.or(setB).toArray();
  if (op === 'XOR') return setA.xor(setB).toArray();
  return setA.sub(setB).toArray();
};

const setupHiDpiCanvas = (canvas, logicalW, logicalH) => {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(logicalW * dpr) || canvas.height !== Math.round(logicalH * dpr)) {
    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
};

const drawBox3DOnCanvas = (ctx, box3, cam, cx, cy, style) => {
  const { faces, edges } = projectBox3D(box3, cam);
  if (style.fillAlpha > 0) {
    for (let i = 0; i < faces.length; i += 1) {
      const f = faces[i];
      ctx.beginPath();
      ctx.moveTo(cx + f.points[0].x, cy + f.points[0].y);
      for (let k = 1; k < f.points.length; k += 1) {
        ctx.lineTo(cx + f.points[k].x, cy + f.points[k].y);
      }
      ctx.closePath();
      ctx.fillStyle = hexWithAlpha(style.color, style.fillAlpha);
      ctx.fill();
    }
  }

  for (let i = 0; i < edges.length; i += 1) {
    const e = edges[i];
    ctx.beginPath();
    ctx.setLineDash(style.dashed || !e.closed ? [5, 4] : []);
    ctx.lineWidth = style.lineWidth || 1.7;
    ctx.strokeStyle = style.strokeColor || style.color;
    ctx.moveTo(cx + e.p1.x, cy + e.p1.y);
    ctx.lineTo(cx + e.p2.x, cy + e.p2.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
};

export const createOrthotopeController = (state, getDict, onStateMutated) => {
  const palette = () => (state.theme === 'dark' ? SHARD_PALETTE_DARK : SHARD_PALETTE_LIGHT);

  const render1D = (host) => {
    const t = getDict();
    const styleMode = state.notationStyle;
    const ivA = range(state.d1.a[0], state.d1.a[1], state.d1.aLc, state.d1.aRc);
    const ivB = range(state.d1.b[0], state.d1.b[1], state.d1.bLc, state.d1.bRc);

    const resAnd = mutualRange(ivA, ivB);
    const resOr = sumRange(ivA, ivB);
    const resSub = diffRange(ivA, ivB);
    const resXor = xorRange(ivA, ivB);
    const checkDisjoint = mutualRange(resSub, ivB).length === 0;

    const activeMap = { AND: resAnd, OR: resOr, SUB: resSub, XOR: resXor };
    const activeRes = activeMap[state.op] || resSub;

    const W = 820;
    const H = 310;
    const padL = 115;
    const padR = 36;
    const trackW = W - padL - padR;
    const xOf = (val) => padL + (val / 10) * trackW;
    const valOf = (px) => snapQuarter(((px - padL) / trackW) * 10);

    const isDark = state.theme === 'dark';
    const colA = isDark ? '#2dd4bf' : '#0f766e';
    const colB = isDark ? '#fbbf24' : '#b45309';
    const colAnd = isDark ? '#34d399' : '#047857';
    const colOr = isDark ? '#38bdf8' : '#0369a1';
    const colSub = isDark ? '#fb7185' : '#be123c';
    const colXor = isDark ? '#c084fc' : '#7e22ce';
    const axisStroke = isDark ? '#3b4550' : '#b6b1a2';
    const bgDot = isDark ? '#13171b' : '#faf9f5';
    const textCol = isDark ? '#eef2f6' : '#15191e';
    const mutedCol = isDark ? '#9aa6b2' : '#4b5563';

    const drawIntervalsSvg = (list, y, color, interactiveKey = '') => {
      if (!list || list.length === 0) {
        return `<text x="${padL + 8}" y="${y + 4}" fill="${mutedCol}" font-size="12" font-family="monospace">∅ (λ₁ = 0)</text>`;
      }
      return list
        .map((iv) => {
          const x1 = xOf(iv[0]);
          const x2 = xOf(iv[1]);
          const lc = iv.leftClosed ?? true;
          const rc = iv.rightClosed ?? true;
          const isPoint = iv[0] === iv[1];
          const label = `${formatRange(iv, styleMode)} · λ₁=${fmtNum(iv[1] - iv[0])}`;
          const bodyAttr = interactiveKey ? `data-drag="${interactiveKey}:move" style="cursor:grab"` : '';
          const lAttr = interactiveKey ? `data-ep="${interactiveKey}:L" style="cursor:pointer"` : '';
          const rAttr = interactiveKey ? `data-ep="${interactiveKey}:R" style="cursor:pointer"` : '';
          const lResize = interactiveKey ? `<rect x="${x1 - 12}" y="${y - 12}" width="8" height="24" fill="transparent" data-drag="${interactiveKey}:L" style="cursor:ew-resize"/>` : '';
          const rResize = interactiveKey ? `<rect x="${x2 + 4}" y="${y - 12}" width="8" height="24" fill="transparent" data-drag="${interactiveKey}:R" style="cursor:ew-resize"/>` : '';

          return `
            <g>
              ${!isPoint ? `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="7" stroke-linecap="butt" ${bodyAttr}/>` : ''}
              ${lResize}
              ${rResize}
              <circle cx="${x1}" cy="${y}" r="6.5" fill="${lc ? color : bgDot}" stroke="${color}" stroke-width="2.5" ${lAttr}/>
              ${!isPoint ? `<circle cx="${x2}" cy="${y}" r="6.5" fill="${rc ? color : bgDot}" stroke="${color}" stroke-width="2.5" ${rAttr}/>` : ''}
              <text x="${Math.min(W - 145, 0.5 * (x1 + x2) - 38)}" y="${y - 12}" fill="${textCol}" font-size="11.5" font-family="monospace">${label}</text>
            </g>
          `;
        })
        .join('');
    };

    const ticks = Array.from({ length: 11 }, (_, i) => {
      const x = xOf(i);
      return `
        <line x1="${x}" y1="22" x2="${x}" y2="${H - 18}" stroke="${axisStroke}" stroke-opacity="0.32" stroke-dasharray="2 3"/>
        <text x="${x}" y="16" text-anchor="middle" fill="${mutedCol}" font-size="11" font-family="monospace">${i}</text>
      `;
    }).join('');

    const rows = [
      { label: 'A (Input)', y: 54, html: drawIntervalsSvg(ivA ? [ivA] : [], 54, colA, 'A') },
      { label: 'B (Input)', y: 102, html: drawIntervalsSvg(ivB ? [ivB] : [], 102, colB, 'B') },
      { label: 'AND (A ∩ B)', y: 156, html: drawIntervalsSvg(resAnd, 156, colAnd) },
      { label: 'OR  (A ∪ B)', y: 198, html: drawIntervalsSvg(resOr, 198, colOr) },
      { label: 'SUB (A \\ B)', y: 240, html: drawIntervalsSvg(resSub, 240, colSub) },
      { label: 'XOR (A Δ B)', y: 282, html: drawIntervalsSvg(resXor, 282, colXor) },
    ];

    host.innerHTML = `
      <div class="telemetry-bar">
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureA}</span><span class="metric-value accent">${fmtNum(measureRange(ivA))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureB}</span><span class="metric-value amber">${fmtNum(measureRange(ivB))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureOp} (${state.op})</span><span class="metric-value">${fmtNum(measureRange(activeRes))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.shards}</span><span class="metric-value">${activeRes.length} (≤ 2)</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.invariant}</span><span class="metric-value accent">(A\\B)∩B = ${checkDisjoint ? '∅ ✓' : '!'}</span></div>
      </div>
      <div class="canvas-frame">
        <div class="hud-top-bar">
          <span>${t.ortho.hint1d}</span>
          <button type="button" class="action-btn" id="btn-1d-notation">${styleMode === 'angle' ? t.ortho.notationAngle : t.ortho.notationBracket}</button>
        </div>
        <svg id="svg-1d-track" class="interactive-svg" viewBox="0 0 ${W} ${H}">
          ${ticks}
          ${rows
    .map(
      (r) => `
            <line x1="${padL}" y1="${r.y}" x2="${W - padR}" y2="${r.y}" stroke="${axisStroke}" stroke-width="1.2"/>
            <text x="14" y="${r.y + 4}" fill="${textCol}" font-size="12" font-weight="700" font-family="monospace">${r.label}</text>
            ${r.html}
          `
    )
    .join('')}
        </svg>
      </div>
      <div class="code-panel">
        <pre><code>import { range, mutualRange, sumRange, diffRange, xorRange, formatRange } from '@gkucmierz/utils';
const A = range(${state.d1.a[0]}, ${state.d1.a[1]}, ${state.d1.aLc}, ${state.d1.aRc}); // ${formatRange(ivA, styleMode)}
const B = range(${state.d1.b[0]}, ${state.d1.b[1]}, ${state.d1.bLc}, ${state.d1.bRc}); // ${formatRange(ivB, styleMode)}
diffRange(A, B).map(r => formatRange(r, '${styleMode}')); // [${resSub.map((r) => `'${formatRange(r, styleMode)}'`).join(', ')}]</code></pre>
      </div>
    `;

    const notBtn = host.querySelector('#btn-1d-notation');
    if (notBtn) {
      notBtn.addEventListener('click', () => {
        state.notationStyle = state.notationStyle === 'angle' ? 'bracket' : 'angle';
        onStateMutated();
      });
    }

    const svg = host.querySelector('#svg-1d-track');
    if (!svg) return;

    svg.querySelectorAll('[data-ep]').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const [which, side] = el.getAttribute('data-ep').split(':');
        if (which === 'A') {
          if (side === 'L') state.d1.aLc = !state.d1.aLc;
          else state.d1.aRc = !state.d1.aRc;
          if (state.d1.a[0] === state.d1.a[1]) {
            state.d1.aLc = true;
            state.d1.aRc = true;
          }
        } else {
          if (side === 'L') state.d1.bLc = !state.d1.bLc;
          else state.d1.bRc = !state.d1.bRc;
          if (state.d1.b[0] === state.d1.b[1]) {
            state.d1.bLc = true;
            state.d1.bRc = true;
          }
        }
        onStateMutated();
      });
    });

    let dragCtx = null;
    const toSvgX = (clientX) => {
      const rect = svg.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * W;
    };

    svg.addEventListener('pointerdown', (ev) => {
      const target = ev.target.closest('[data-drag]');
      if (!target) return;
      const [which, mode] = target.getAttribute('data-drag').split(':');
      const tuple = which === 'A' ? state.d1.a.slice() : state.d1.b.slice();
      dragCtx = { which, mode, startVal: valOf(toSvgX(ev.clientX)), orig: tuple };
      svg.setPointerCapture(ev.pointerId);
    });

    svg.addEventListener('pointermove', (ev) => {
      if (!dragCtx) return;
      const curVal = valOf(toSvgX(ev.clientX));
      const delta = curVal - dragCtx.startVal;
      const targetArr = dragCtx.which === 'A' ? state.d1.a : state.d1.b;
      if (dragCtx.mode === 'move') {
        const span = dragCtx.orig[1] - dragCtx.orig[0];
        const nextLo = Math.max(0, Math.min(10 - span, snapQuarter(dragCtx.orig[0] + delta)));
        targetArr[0] = nextLo;
        targetArr[1] = Number((nextLo + span).toFixed(4));
      } else if (dragCtx.mode === 'L') {
        targetArr[0] = Math.min(targetArr[1], curVal);
        if (targetArr[0] === targetArr[1]) {
          if (dragCtx.which === 'A') state.d1.aLc = state.d1.aRc = true;
          else state.d1.bLc = state.d1.bRc = true;
        }
      } else if (dragCtx.mode === 'R') {
        targetArr[1] = Math.max(targetArr[0], curVal);
        if (targetArr[0] === targetArr[1]) {
          if (dragCtx.which === 'A') state.d1.aLc = state.d1.aRc = true;
          else state.d1.bLc = state.d1.bRc = true;
        }
      }
      render1D(host);
    });

    svg.addEventListener('pointerup', () => {
      dragCtx = null;
    });
  };

  const render2D = (host) => {
    const t = getDict();
    const boxA = [
      range(state.d2.a[0][0], state.d2.a[0][1], state.d2.aClosed, state.d2.aClosed),
      range(state.d2.a[1][0], state.d2.a[1][1], state.d2.aClosed, state.d2.aClosed),
    ];
    const boxB = [
      range(state.d2.b[0][0], state.d2.b[0][1], state.d2.bClosed, state.d2.bClosed),
      range(state.d2.b[1][0], state.d2.b[1][1], state.d2.bClosed, state.d2.bClosed),
    ];

    const rawShards = computeOpBoxes(state.op, boxA, boxB);
    const displayShards = explodeBoxesNd(rawShards, state.explode2d);
    const disjointOk = mutualBox(diffBox(boxA, boxB), boxB).length === 0;

    const W = 560;
    const H = 400;
    const pad = 38;
    const plotW = W - 2 * pad;
    const plotH = H - 2 * pad;
    const sx = (v) => pad + (v / 10) * plotW;
    const sy = (v) => H - pad - (v / 10) * plotH;
    const ux = (px) => snapQuarter(((px - pad) / plotW) * 10);
    const uy = (py) => snapQuarter(((H - pad - py) / plotH) * 10);

    const isDark = state.theme === 'dark';
    const pal = palette();
    const gridStroke = isDark ? '#222930' : '#e5e2d8';
    const colA = isDark ? '#2dd4bf' : '#0f766e';
    const colB = isDark ? '#fbbf24' : '#b45309';
    const textCol = isDark ? '#eef2f6' : '#15191e';

    const gridLines = Array.from({ length: 11 }, (_, i) => {
      const gx = sx(i);
      const gy = sy(i);
      return `
        <line x1="${gx}" y1="${pad}" x2="${gx}" y2="${H - pad}" stroke="${gridStroke}" stroke-width="1"/>
        <line x1="${pad}" y1="${gy}" x2="${W - pad}" y2="${gy}" stroke="${gridStroke}" stroke-width="1"/>
        <text x="${gx}" y="${H - 14}" text-anchor="middle" font-size="10.5" fill="${textCol}" opacity="0.65" font-family="monospace">${i}</text>
        <text x="18" y="${gy + 4}" text-anchor="middle" font-size="10.5" fill="${textCol}" opacity="0.65" font-family="monospace">${i}</text>
      `;
    }).join('');

    const renderShard2D = (b, origB, idx) => {
      const c = pal[idx % pal.length];
      const x0 = sx(b[0][0]);
      const x1 = sx(b[0][1]);
      const yTop = sy(b[1][1]);
      const yBot = sy(b[1][0]);
      const w = Math.max(2, x1 - x0);
      const h = Math.max(2, yBot - yTop);
      const area = measureBox([origB]);
      const lcX = b[0].leftClosed ?? true;
      const rcX = b[0].rightClosed ?? true;
      const lcY = b[1].leftClosed ?? true;
      const rcY = b[1].rightClosed ?? true;

      return `
        <g>
          <rect x="${x0}" y="${yTop}" width="${w}" height="${h}" fill="${c}" fill-opacity="0.24"/>
          <line x1="${x0}" y1="${yTop}" x2="${x1}" y2="${yTop}" stroke="${c}" stroke-width="2.2" ${rcY ? '' : 'stroke-dasharray="5 4"'}/>
          <line x1="${x0}" y1="${yBot}" x2="${x1}" y2="${yBot}" stroke="${c}" stroke-width="2.2" ${lcY ? '' : 'stroke-dasharray="5 4"'}/>
          <line x1="${x0}" y1="${yTop}" x2="${x0}" y2="${yBot}" stroke="${c}" stroke-width="2.2" ${lcX ? '' : 'stroke-dasharray="5 4"'}/>
          <line x1="${x1}" y1="${yTop}" x2="${x1}" y2="${yBot}" stroke="${c}" stroke-width="2.2" ${rcX ? '' : 'stroke-dasharray="5 4"'}/>
          ${w > 36 && h > 22 ? `<text x="${0.5 * (x0 + x1)}" y="${0.5 * (yTop + yBot) + 4}" text-anchor="middle" font-size="11" font-weight="700" font-family="monospace" fill="${textCol}">λ₂=${fmtNum(area)}</text>` : ''}
        </g>
      `;
    };

    const drawDraggableOutline = (b, key, color, closed) => {
      const x0 = sx(b[0][0]);
      const x1 = sx(b[0][1]);
      const yTop = sy(b[1][1]);
      const yBot = sy(b[1][0]);
      return `
        <g>
          <rect x="${x0}" y="${yTop}" width="${Math.max(4, x1 - x0)}" height="${Math.max(4, yBot - yTop)}"
            fill="${color}" fill-opacity="0.06" stroke="${color}" stroke-width="1.6"
            ${closed ? '' : 'stroke-dasharray="6 4"'} data-boxdrag="${key}:move" style="cursor:grab"/>
          <rect x="${x1 - 6}" y="${yTop - 6}" width="12" height="12" rx="3" fill="${color}" data-boxdrag="${key}:corner" style="cursor:nesw-resize"/>
          <text x="${x0 + 6}" y="${yTop + 15}" font-size="11" font-weight="700" font-family="monospace" fill="${color}">${key}</text>
        </g>
      `;
    };

    host.innerHTML = `
      <div class="telemetry-bar">
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureA}</span><span class="metric-value accent">${fmtNum(measureBox([boxA]))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureB}</span><span class="metric-value amber">${fmtNum(measureBox([boxB]))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureOp} (${state.op})</span><span class="metric-value">${fmtNum(measureBox(rawShards))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.shards}</span><span class="metric-value">${rawShards.length} (≤ 2d = 4)</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.invariant}</span><span class="metric-value accent">${disjointOk ? '(A\\B)∩B = ∅ ✓' : '!'}</span></div>
      </div>
      <div class="stage-grid-2">
        <div class="canvas-frame">
          <div class="hud-top-bar">
            <span>${t.ortho.hint2d}</span>
          </div>
          <svg id="svg-2d-aabb" class="interactive-svg" viewBox="0 0 ${W} ${H}">
            ${gridLines}
            ${drawDraggableOutline(boxA, 'A', colA, state.d2.aClosed)}
            ${drawDraggableOutline(boxB, 'B', colB, state.d2.bClosed)}
            ${displayShards.map((sh, i) => renderShard2D(sh, rawShards[i], i)).join('')}
          </svg>
        </div>
        <div>
          <div class="section-card" style="margin-bottom:0">
            <div class="card-body">
              <div style="display:flex;flex-direction:column;gap:12px">
                <label class="nano-switch-label" id="lbl-2d-ac">
                  <button type="button" role="switch" class="nano-switch-btn" aria-checked="${state.d2.aClosed}"><span class="nano-switch-thumb"></span></button>
                  <span>Box A Closed Boundary (● solid / ○ dashed)</span>
                </label>
                <label class="nano-switch-label" id="lbl-2d-bc">
                  <button type="button" role="switch" class="nano-switch-btn" aria-checked="${state.d2.bClosed}"><span class="nano-switch-thumb"></span></button>
                  <span>Box B Closed Boundary (● solid / ○ dashed)</span>
                </label>
                <label class="slider-field">
                  <span>${t.ortho.explodeLabel}:</span>
                  <input type="range" id="rng-2d-explode" min="0" max="0.6" step="0.02" value="${state.explode2d}">
                  <span class="slider-val">${state.explode2d.toFixed(2)}</span>
                </label>
              </div>
              <div class="code-panel">
                <pre><code>const shards = ${state.op === 'SUB' ? 'diffBox' : state.op === 'XOR' ? 'xorBox' : state.op === 'OR' ? 'sumBox' : 'mutualBox'}(
  [[${boxA[0][0]}, ${boxA[0][1]}], [${boxA[1][0]}, ${boxA[1][1]}]],
  [[${boxB[0][0]}, ${boxB[0][1]}], [${boxB[1][0]}, ${boxB[1][1]}]]
);
// ${rawShards.length} disjoint 2-orthotope shard(s):
${rawShards.map((s, idx) => `// #${idx + 1}: ${formatRange(s[0])} × ${formatRange(s[1])} (λ₂=${fmtNum(measureBox([s]))})`).join('\n') || '// ∅'}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    host.querySelector('#lbl-2d-ac')?.addEventListener('click', (e) => {
      e.preventDefault();
      state.d2.aClosed = !state.d2.aClosed;
      onStateMutated();
    });
    host.querySelector('#lbl-2d-bc')?.addEventListener('click', (e) => {
      e.preventDefault();
      state.d2.bClosed = !state.d2.bClosed;
      onStateMutated();
    });
    host.querySelector('#rng-2d-explode')?.addEventListener('input', (e) => {
      state.explode2d = Number(e.target.value);
      render2D(host);
    });

    const svg = host.querySelector('#svg-2d-aabb');
    if (!svg) return;
    let drag2d = null;
    const ptSvg = (ev) => {
      const r = svg.getBoundingClientRect();
      return { x: ((ev.clientX - r.left) / r.width) * W, y: ((ev.clientY - r.top) / r.height) * H };
    };
    svg.addEventListener('pointerdown', (ev) => {
      const el = ev.target.closest('[data-boxdrag]');
      if (!el) return;
      const [who, mode] = el.getAttribute('data-boxdrag').split(':');
      const p = ptSvg(ev);
      const src = who === 'A' ? state.d2.a : state.d2.b;
      drag2d = {
        who,
        mode,
        sx: ux(p.x),
        sy: uy(p.y),
        orig: [[src[0][0], src[0][1]], [src[1][0], src[1][1]]],
      };
      svg.setPointerCapture(ev.pointerId);
    });
    svg.addEventListener('pointermove', (ev) => {
      if (!drag2d) return;
      const p = ptSvg(ev);
      const vx = ux(p.x);
      const vy = uy(p.y);
      const dst = drag2d.who === 'A' ? state.d2.a : state.d2.b;
      if (drag2d.mode === 'move') {
        const w = drag2d.orig[0][1] - drag2d.orig[0][0];
        const h = drag2d.orig[1][1] - drag2d.orig[1][0];
        const nx = Math.max(0, Math.min(10 - w, snapQuarter(drag2d.orig[0][0] + (vx - drag2d.sx))));
        const ny = Math.max(0, Math.min(10 - h, snapQuarter(drag2d.orig[1][0] + (vy - drag2d.sy))));
        dst[0] = [nx, Number((nx + w).toFixed(4))];
        dst[1] = [ny, Number((ny + h).toFixed(4))];
      } else {
        dst[0][1] = Math.max(dst[0][0] + 0.5, vx);
        dst[1][1] = Math.max(dst[1][0] + 0.5, vy);
      }
      render2D(host);
    });
    svg.addEventListener('pointerup', () => {
      drag2d = null;
    });
  };

  const render3D = (host) => {
    const t = getDict();
    const boxA = state.d3.a.map((iv) => range(iv[0], iv[1], true, true));
    const boxB = state.d3.b.map((iv) => range(iv[0], iv[1], true, true));
    const rawShards = computeOpBoxes(state.op, boxA, boxB);
    const exploded = explodeBoxesNd(rawShards, state.explode3d, [5, 5, 5]);
    const sumShardMeasures = rawShards.reduce((acc, s) => acc + measureBox([s]), 0);

    host.innerHTML = `
      <div class="telemetry-bar">
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureA}</span><span class="metric-value accent">${fmtNum(measureBox([boxA]))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureB}</span><span class="metric-value amber">${fmtNum(measureBox([boxB]))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureOp} (${state.op})</span><span class="metric-value">${fmtNum(sumShardMeasures)}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.shards}</span><span class="metric-value">${rawShards.length} (≤ 2d = 6)</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.explodeLabel}</span><span class="metric-value amber">δr = ${state.explode3d.toFixed(2)}×</span></div>
      </div>
      <div class="stage-grid-2">
        <div class="canvas-frame">
          <div class="hud-top-bar">
            <span>${t.ortho.hint3d}</span>
            <label class="slider-field">
              <span>${t.ortho.explodeLabel}</span>
              <input type="range" id="rng-3d-explode" min="0" max="0.9" step="0.02" value="${state.explode3d}">
              <span class="slider-val" id="val-3d-explode">${state.explode3d.toFixed(2)}</span>
            </label>
          </div>
          <canvas id="canvas-3d-ortho" class="interactive-canvas" style="height:400px"></canvas>
        </div>
        <div class="section-card" style="margin-bottom:0">
          <div class="card-body">
            <div style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto">
              ${rawShards
    .map((s, idx) => {
      const col = palette()[idx % palette().length];
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border:1px solid var(--border);border-left:4px solid ${col};border-radius:6px;font-family:monospace;font-size:0.76rem">
                    <span>#${idx + 1} ${formatRange(s[0])}×${formatRange(s[1])}×${formatRange(s[2])}</span>
                    <strong>λ₃=${fmtNum(measureBox([s]))}</strong>
                  </div>`;
    })
    .join('') || '<div class="mono">∅</div>'}
            </div>
            <div class="code-panel">
              <pre><code>import { diffBox, explodeBoxesNd, measureBox } from '@gkucmierz/utils';
const shards = diffBox(A3, B3); // ${diffBox(boxA, boxB).length} disjoint cuboids (≤ 6)
const separated = explodeBoxesNd(shards, ${state.explode3d.toFixed(2)});
measureBox(shards) === measureBox(separated); // true (${fmtNum(measureBox(diffBox(boxA, boxB)))})</code></pre>
            </div>
          </div>
        </div>
      </div>
    `;

    const canvas = host.querySelector('#canvas-3d-ortho');
    const paint = () => {
      if (!canvas) return;
      const W = canvas.clientWidth || 560;
      const H = 400;
      const ctx = setupHiDpiCanvas(canvas, W, H);
      ctx.clearRect(0, 0, W, H);
      const cam = {
        azimuth: state.cam3d.azimuth,
        elevation: state.cam3d.elevation,
        distance: 28,
        scale: Math.min(W, H) * 0.045,
        center: [5, 5, 5],
      };

      const curExploded = explodeBoxesNd(rawShards, state.explode3d, [5, 5, 5]);
      const pal = palette();
      const sorted = curExploded
        .map((b, idx) => {
          const c = [0.5 * (b[0][0] + b[0][1]), 0.5 * (b[1][0] + b[1][1]), 0.5 * (b[2][0] + b[2][1])];
          const p = projectBox3D(b, cam);
          const avgDepth = p.vertices.reduce((acc, v) => acc + v.depth, 0) / 8;
          return { b, idx, avgDepth, c };
        })
        .sort((x, y) => x.avgDepth - y.avgDepth);

      // Ghost of B
      drawBox3DOnCanvas(ctx, boxB, cam, W * 0.5, H * 0.52, {
        color: state.theme === 'dark' ? '#fbbf24' : '#b45309',
        fillAlpha: 0.04,
        dashed: true,
        lineWidth: 1.3,
      });

      for (let i = 0; i < sorted.length; i += 1) {
        const item = sorted[i];
        drawBox3DOnCanvas(ctx, item.b, cam, W * 0.5, H * 0.52, {
          color: pal[item.idx % pal.length],
          fillAlpha: 0.24,
          lineWidth: 1.8,
        });
      }
    };

    paint();

    const rng = host.querySelector('#rng-3d-explode');
    const valEl = host.querySelector('#val-3d-explode');
    rng?.addEventListener('input', (e) => {
      state.explode3d = Number(e.target.value);
      if (valEl) valEl.textContent = state.explode3d.toFixed(2);
      paint();
    });

    let orb = null;
    canvas?.addEventListener('pointerdown', (ev) => {
      orb = { x: ev.clientX, y: ev.clientY, az: state.cam3d.azimuth, el: state.cam3d.elevation };
      canvas.setPointerCapture(ev.pointerId);
    });
    canvas?.addEventListener('pointermove', (ev) => {
      if (!orb) return;
      state.cam3d.azimuth = orb.az + (ev.clientX - orb.x) * 0.008;
      state.cam3d.elevation = Math.max(-1.25, Math.min(1.25, orb.el + (ev.clientY - orb.y) * 0.008));
      paint();
    });
    canvas?.addEventListener('pointerup', () => {
      orb = null;
    });
  };

  const render4D = (host) => {
    const t = getDict();
    const boxA4 = state.d4.a.map((iv) => range(iv[0], iv[1], true, true));
    const boxB4 = state.d4.b.map((iv) => range(iv[0], iv[1], true, true));
    const shards4 = computeOpBoxes(state.op, boxA4, boxB4);
    const activeSlices3 = sliceBoxes4DAtW(shards4, state.w4d);
    const sliceA = sliceBox4DAtW(boxA4, state.w4d);
    const sliceB = sliceBox4DAtW(boxB4, state.w4d);
    const stripFrames = sampleSmallMultiples4D(shards4, [0, 10], 6);

    host.innerHTML = `
      <div class="telemetry-bar">
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureA} (λ₄)</span><span class="metric-value accent">${fmtNum(measureBox([boxA4]))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureB} (λ₄)</span><span class="metric-value amber">${fmtNum(measureBox([boxB4]))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.measureOp} (${state.op})</span><span class="metric-value">${fmtNum(measureBox(shards4))}</span></div>
        <div class="metric-box"><span class="metric-label">${t.ortho.metrics.shards}</span><span class="metric-value">${shards4.length} (≤ 2d = 8)</span></div>
        <div class="metric-box"><span class="metric-label">Slice λ₃ @ w=${state.w4d.toFixed(1)}</span><span class="metric-value amber">${fmtNum(measureBox(activeSlices3))}</span></div>
      </div>

      <div class="control-strip" style="border-radius:8px;border:1px solid var(--border);margin-bottom:14px">
        <label class="slider-field">
          <span>${t.ortho.wScrubberLabel}:</span>
          <input type="range" id="rng-4d-w" min="0" max="10" step="0.1" value="${state.w4d}">
          <span class="slider-val" id="val-4d-w">w = ${state.w4d.toFixed(1)}</span>
        </label>
        <label class="slider-field">
          <span>${t.ortho.xwRotLabel}:</span>
          <input type="range" id="rng-4d-xw" min="-1.57" max="1.57" step="0.03" value="${state.xwAngle4d}">
          <span class="slider-val" id="val-4d-xw">${state.xwAngle4d.toFixed(2)} rad</span>
        </label>
        <span class="mono" style="font-size:0.75rem;color:var(--text-muted)">w_A=${formatRange(boxA4[3])} · w_B=${formatRange(boxB4[3])} · w_(A∩B)=${formatRange(mutualRange(boxA4[3], boxB4[3])[0])}</span>
      </div>

      <div class="stage-4d-grid">
        <div class="canvas-frame">
          <div class="hud-top-bar"><span>${t.ortho.hint4dSlice}</span></div>
          <canvas id="canvas-4d-slice" class="interactive-canvas" style="height:290px"></canvas>
        </div>
        <div class="canvas-frame">
          <div class="hud-top-bar"><span>${t.ortho.hint4dSchlegel}</span></div>
          <canvas id="canvas-4d-schlegel" class="interactive-canvas" style="height:290px"></canvas>
        </div>
      </div>

      <div style="margin-top:14px">
        <div style="font-size:0.78rem;font-weight:700;color:var(--text-muted);margin-bottom:6px">${t.ortho.hint4dStrip}</div>
        <div class="small-multiples-strip" id="strip-4d">
          ${stripFrames
    .map(
      (fr) => `
            <button type="button" class="sm-frame-btn ${Math.abs(fr.w - state.w4d) < 0.9 ? 'is-current' : ''}" data-w="${fr.w}">
              <canvas class="sm-canvas" data-idx="${fr.index}" style="width:100%;height:88px;display:block"></canvas>
              <span class="sm-caption">w=${fr.w.toFixed(1)} · λ₃=${fmtNum(fr.measure3D)}</span>
            </button>
          `
    )
    .join('')}
        </div>
      </div>
    `;

    const paintAll4D = () => {
      const isDark = state.theme === 'dark';
      const pal = palette();
      const curSlices = sliceBoxes4DAtW(shards4, state.w4d);
      const curSliceB = sliceBox4DAtW(boxB4, state.w4d);
      const curSliceA = sliceBox4DAtW(boxA4, state.w4d);

      // 1. Spacetime slice canvas
      const cSlice = host.querySelector('#canvas-4d-slice');
      if (cSlice) {
        const W = cSlice.clientWidth || 420;
        const H = 290;
        const ctx = setupHiDpiCanvas(cSlice, W, H);
        ctx.clearRect(0, 0, W, H);
        const cam = { azimuth: state.cam3d.azimuth, elevation: state.cam3d.elevation, distance: 28, scale: Math.min(W, H) * 0.042, center: [5, 5, 5] };
        if (curSliceA) {
          drawBox3DOnCanvas(ctx, curSliceA, cam, W * 0.5, H * 0.53, { color: isDark ? '#2dd4bf' : '#0f766e', fillAlpha: 0.05, dashed: true, lineWidth: 1.1 });
        }
        if (curSliceB) {
          drawBox3DOnCanvas(ctx, curSliceB, cam, W * 0.5, H * 0.53, { color: isDark ? '#fbbf24' : '#b45309', fillAlpha: 0.06, dashed: true, lineWidth: 1.2 });
        }
        curSlices.forEach((b3, idx) => {
          drawBox3DOnCanvas(ctx, b3, cam, W * 0.5, H * 0.53, { color: pal[idx % pal.length], fillAlpha: 0.28, lineWidth: 1.8 });
        });
      }

      // 2. Schlegel wireframe canvas
      const cSch = host.querySelector('#canvas-4d-schlegel');
      if (cSch) {
        const W = cSch.clientWidth || 420;
        const H = 290;
        const ctx = setupHiDpiCanvas(cSch, W, H);
        ctx.clearRect(0, 0, W, H);
        const cx = W * 0.5;
        const cy = H * 0.52;
        const drawTess = (b4, baseCol, bridgeCol, alpha = 1) => {
          const { edges, vertices } = projectBox4DSchlegel(b4, {
            center4: [5, 5, 5, 5],
            halfSpan: 4.5,
            wCamera: 2.55,
            xwAngle: state.xwAngle4d,
            azimuth: state.cam3d.azimuth,
            elevation: state.cam3d.elevation,
            scale: Math.min(W, H) * 0.22,
          });
          edges.forEach((e) => {
            ctx.beginPath();
            ctx.globalAlpha = alpha;
            ctx.setLineDash(!e.closed ? [4, 3] : []);
            ctx.lineWidth = e.wSide === 'bridge' ? 1.5 : 1.9;
            ctx.strokeStyle = e.wSide === 'bridge' ? bridgeCol : baseCol;
            ctx.moveTo(cx + e.p1.x, cy + e.p1.y);
            ctx.lineTo(cx + e.p2.x, cy + e.p2.y);
            ctx.stroke();
          });
          vertices.forEach((v) => {
            ctx.beginPath();
            ctx.fillStyle = (v.mask & 8) !== 0 ? bridgeCol : baseCol;
            ctx.arc(cx + v.x, cy + v.y, 2.3, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.globalAlpha = 1;
          ctx.setLineDash([]);
        };

        drawTess(boxB4, isDark ? '#fbbf24' : '#b45309', isDark ? '#f59e0b' : '#92400e', 0.35);
        shards4.forEach((sh4, idx) => {
          drawTess(sh4, pal[idx % pal.length], isDark ? '#fbbf24' : '#b45309', 0.92);
        });
      }

      // 3. Small Multiples 6 mini canvases
      host.querySelectorAll('.sm-canvas').forEach((mc) => {
        const idx = Number(mc.getAttribute('data-idx'));
        const fr = stripFrames[idx];
        if (!fr) return;
        const W = mc.clientWidth || 140;
        const H = 88;
        const ctx = setupHiDpiCanvas(mc, W, H);
        ctx.clearRect(0, 0, W, H);
        const cam = { azimuth: -0.65, elevation: 0.5, distance: 28, scale: Math.min(W, H) * 0.055, center: [5, 5, 5] };
        fr.boxes3D.forEach((b3, sIdx) => {
          drawBox3DOnCanvas(ctx, b3, cam, W * 0.5, H * 0.55, { color: pal[sIdx % pal.length], fillAlpha: 0.28, lineWidth: 1.2 });
        });
      });
    };

    paintAll4D();

    host.querySelector('#rng-4d-w')?.addEventListener('input', (e) => {
      state.w4d = Number(e.target.value);
      render4D(host);
    });
    host.querySelector('#rng-4d-xw')?.addEventListener('input', (e) => {
      state.xwAngle4d = Number(e.target.value);
      const vEl = host.querySelector('#val-4d-xw');
      if (vEl) vEl.textContent = `${state.xwAngle4d.toFixed(2)} rad`;
      paintAll4D();
    });
    host.querySelectorAll('.sm-frame-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.w4d = Number(btn.getAttribute('data-w'));
        render4D(host);
      });
    });

    ['#canvas-4d-slice', '#canvas-4d-schlegel'].forEach((sel) => {
      const c = host.querySelector(sel);
      let orb = null;
      c?.addEventListener('pointerdown', (ev) => {
        orb = { x: ev.clientX, y: ev.clientY, az: state.cam3d.azimuth, el: state.cam3d.elevation };
        c.setPointerCapture(ev.pointerId);
      });
      c?.addEventListener('pointermove', (ev) => {
        if (!orb) return;
        state.cam3d.azimuth = orb.az + (ev.clientX - orb.x) * 0.008;
        state.cam3d.elevation = Math.max(-1.25, Math.min(1.25, orb.el + (ev.clientY - orb.y) * 0.008));
        paintAll4D();
      });
      c?.addEventListener('pointerup', () => {
        orb = null;
      });
    });
  };

  const renderND = (host) => {
    const t = getDict();
    const N = state.dn.dim;
    const tax = getOrthotopeTaxonomy(N);
    const boxA = state.dn.a.slice(0, N).map((iv) => range(iv[0], iv[1], true, true));
    const boxB = state.dn.b.slice(0, N).map((iv) => range(iv[0], iv[1], true, true));
    const evalRes = evaluateParallelAxesNd(boxA, boxB);
    const activeBoxes = computeOpBoxes(state.op, boxA, boxB);
    const cornerDims = Math.min(N, 6);
    const cornerCells = buildPairwiseProjectionsNd(activeBoxes.length > 0 ? activeBoxes : [boxA], { maxAxes: cornerDims });

    const W = 780;
    const H = 260;
    const padX = 52;
    const padY = 30;
    const usableH = H - 2 * padY;
    const stepX = (W - 2 * padX) / Math.max(1, N - 1);
    const yOf = (v) => H - padY - (v / 10) * usableH;
    const valOfY = (py) => snapQuarter(((H - padY - py) / usableH) * 10);

    const isDark = state.theme === 'dark';
    const colA = isDark ? '#2dd4bf' : '#0f766e';
    const colB = isDark ? '#fbbf24' : '#b45309';
    const colOk = isDark ? '#34d399' : '#047857';
    const colBlock = isDark ? '#fb7185' : '#be123c';
    const axisCol = isDark ? '#3b4550' : '#b6b1a2';
    const textCol = isDark ? '#eef2f6' : '#15191e';

    const axesSvg = evalRes.axes
      .map((ax, i) => {
        const x = padX + i * stepX;
        const ya0 = yOf(ax.ivA[0]);
        const ya1 = yOf(ax.ivA[1]);
        const yb0 = yOf(ax.ivB[0]);
        const yb1 = yOf(ax.ivB[1]);
        const blocked = ax.overlapLength <= 0;
        const interSvg =
          ax.intersection.length > 0
            ? `<line x1="${x}" y1="${yOf(ax.intersection[0][1])}" x2="${x}" y2="${yOf(ax.intersection[0][0])}" stroke="${colOk}" stroke-width="5"/>`
            : '';

        return `
          <g>
            <line x1="${x}" y1="${padY}" x2="${x}" y2="${H - padY}" stroke="${blocked ? colBlock : axisCol}" stroke-width="${blocked ? 2 : 1.2}" ${blocked ? 'stroke-dasharray="4 3"' : ''}/>
            <line x1="${x - 6}" y1="${ya1}" x2="${x - 6}" y2="${ya0}" stroke="${colA}" stroke-width="6" stroke-linecap="round" data-nddrag="A:${i}" style="cursor:ns-resize"/>
            <line x1="${x + 6}" y1="${yb1}" x2="${x + 6}" y2="${yb0}" stroke="${colB}" stroke-width="6" stroke-linecap="round" data-nddrag="B:${i}" style="cursor:ns-resize"/>
            ${interSvg}
            <text x="${x}" y="18" text-anchor="middle" font-size="11.5" font-weight="700" font-family="monospace" fill="${blocked ? colBlock : textCol}">${ax.axisLabel}</text>
            <text x="${x}" y="${H - 8}" text-anchor="middle" font-size="10.5" font-family="monospace" fill="${blocked ? colBlock : colOk}">Δ=${fmtNum(ax.overlapLength)}</text>
          </g>
        `;
      })
      .join('');

    // Build triangular matrix rows r = 1 .. cornerDims - 1
    const cellMap = new Map();
    cornerCells.forEach((cell) => cellMap.set(`${cell.axisX}:${cell.axisY}`, cell));
    let cornerHtml = '';
    for (let r = 1; r < cornerDims; r += 1) {
      for (let c = 0; c < cornerDims - 1; c += 1) {
        if (c >= r) {
          cornerHtml += '<div></div>';
          continue;
        }
        const cell = cellMap.get(`${c}:${r}`);
        const rects = (cell ? cell.boxes2D : [])
          .slice(0, 12)
          .map((b2, idx) => {
            const col = palette()[idx % palette().length];
            const rx = 6 + (b2[0][0] / 10) * 68;
            const rw = Math.max(2, ((b2[0][1] - b2[0][0]) / 10) * 68);
            const ry = 74 - (b2[1][1] / 10) * 68;
            const rh = Math.max(2, ((b2[1][1] - b2[1][0]) / 10) * 68);
            return `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${col}" fill-opacity="0.32" stroke="${col}" stroke-width="1.2"/>`;
          })
          .join('');
        cornerHtml += `
          <div class="corner-cell">
            <svg viewBox="0 0 80 80" style="width:100%;display:block">
              <rect x="6" y="6" width="68" height="68" fill="none" stroke="${axisCol}" stroke-width="0.8"/>
              ${rects}
              <text x="8" y="16" font-size="9" font-family="monospace" fill="${textCol}">x${c + 1}×x${r + 1}</text>
            </svg>
          </div>
        `;
      }
    }

    host.innerHTML = `
      <div class="telemetry-bar">
        <div class="metric-box"><span class="metric-label">Polytope (${N}D)</span><span class="metric-value accent">${state.lang === 'pl' ? tax.hypercubePl : tax.hypercubeEn}</span></div>
        <div class="metric-box"><span class="metric-label">${tax.measureSymbol}(A ∩ B)</span><span class="metric-value ${evalRes.intersectionMeasure === 0 ? 'rose' : 'accent'}">${fmtNum(evalRes.intersectionMeasure)}</span></div>
        <div class="metric-box"><span class="metric-label">${tax.measureSymbol}(${state.op})</span><span class="metric-value">${fmtNum(measureBox(activeBoxes))}</span></div>
        <div class="metric-box"><span class="metric-label">diffBox Shards</span><span class="metric-value amber">${evalRes.diffShardCount} (≤ 2N = ${2 * N})</span></div>
        <div class="metric-box"><span class="metric-label">Blocking Axes</span><span class="metric-value ${evalRes.blockingAxes.length > 0 ? 'rose' : 'accent'}">${evalRes.blockingAxes.length === 0 ? 'None ✓' : evalRes.blockingAxes.map((d) => `x${d + 1}`).join(', ')}</span></div>
      </div>

      <div class="control-strip" style="border-radius:8px;border:1px solid var(--border);margin-bottom:14px">
        <div class="stepper-field">
          <span>${t.ortho.dimStepperLabel}:</span>
          <div class="nano-stepper">
            <button type="button" id="btn-nd-dec" aria-label="Decrease dimension">−</button>
            <span class="stepper-val">${N}D</span>
            <button type="button" id="btn-nd-inc" aria-label="Increase dimension">+</button>
          </div>
        </div>
        <button type="button" class="action-btn" id="btn-nd-break">${t.ortho.breakAxisBtn}</button>
        <button type="button" class="action-btn" id="btn-nd-heal">${t.ortho.healAxesBtn}</button>
      </div>

      <div class="canvas-frame">
        <div class="hud-top-bar"><span>${t.ortho.hintNdParallel}</span></div>
        <svg id="svg-nd-parallel" class="interactive-svg" viewBox="0 0 ${W} ${H}">
          ${axesSvg}
        </svg>
      </div>

      <div style="margin-top:16px">
        <div style="font-size:0.79rem;font-weight:700;color:var(--text-muted)">${t.ortho.hintNdCorner} (x₁..x_${cornerDims})</div>
        <div class="corner-plot-grid" style="grid-template-columns:repeat(${cornerDims - 1}, minmax(0, 1fr))">
          ${cornerHtml}
        </div>
      </div>
    `;

    host.querySelector('#btn-nd-dec')?.addEventListener('click', () => {
      state.dn.dim = Math.max(5, state.dn.dim - 1);
      renderND(host);
    });
    host.querySelector('#btn-nd-inc')?.addEventListener('click', () => {
      state.dn.dim = Math.min(12, state.dn.dim + 1);
      renderND(host);
    });
    host.querySelector('#btn-nd-break')?.addEventListener('click', () => {
      state.dn.b[2] = [7.5, 9.5];
      state.dn.a[2] = [1.5, 5.0];
      renderND(host);
    });
    host.querySelector('#btn-nd-heal')?.addEventListener('click', () => {
      for (let i = 0; i < 12; i += 1) {
        state.dn.a[i] = [2, 7];
        state.dn.b[i] = [4, 8.5];
      }
      renderND(host);
    });

    const svg = host.querySelector('#svg-nd-parallel');
    let dragNd = null;
    svg?.addEventListener('pointerdown', (ev) => {
      const el = ev.target.closest('[data-nddrag]');
      if (!el) return;
      const [who, idxStr] = el.getAttribute('data-nddrag').split(':');
      const idx = Number(idxStr);
      const rect = svg.getBoundingClientRect();
      const py = ((ev.clientY - rect.top) / rect.height) * H;
      const arr = who === 'A' ? state.dn.a[idx] : state.dn.b[idx];
      dragNd = { who, idx, startVal: valOfY(py), orig: [arr[0], arr[1]] };
      svg.setPointerCapture(ev.pointerId);
    });
    svg?.addEventListener('pointermove', (ev) => {
      if (!dragNd) return;
      const rect = svg.getBoundingClientRect();
      const py = ((ev.clientY - rect.top) / rect.height) * H;
      const delta = valOfY(py) - dragNd.startVal;
      const span = dragNd.orig[1] - dragNd.orig[0];
      const lo = Math.max(0, Math.min(10 - span, snapQuarter(dragNd.orig[0] + delta)));
      const target = dragNd.who === 'A' ? state.dn.a : state.dn.b;
      target[dragNd.idx] = [lo, Number((lo + span).toFixed(4))];
      renderND(host);
    });
    svg?.addEventListener('pointerup', () => {
      dragNd = null;
    });
  };

  const render = (container) => {
    const t = getDict();
    container.innerHTML = `
      <section class="section-card">
        <div class="card-header">
          <div class="card-title-group">
            <h1 class="card-title">${t.ortho.title}</h1>
            <p class="card-subtitle">${t.ortho.subtitle}</p>
          </div>
          <a class="action-btn" href="${state.basePath || './'}module-geometry.OrthoSet.html">OrthoSet API →</a>
        </div>
        <div class="control-strip">
          <div class="seg-group" role="tablist" aria-label="Dimension Stage">
            ${['d1', 'd2', 'd3', 'd4', 'dn']
    .map(
      (k) => `<button type="button" class="seg-btn ${state.orthoStage === k ? 'is-active' : ''}" data-stage="${k}">${t.ortho.dims[k]}</button>`
    )
    .join('')}
          </div>
          <div class="seg-group" role="group" aria-label="Boolean Operator">
            ${[
    ['SUB', 'SUB (A \\ B)'],
    ['XOR', 'XOR (A Δ B)'],
    ['AND', 'AND (A ∩ B)'],
    ['OR', 'OR (A ∪ B)'],
  ]
    .map(
      ([op, lbl]) => `<button type="button" class="seg-btn ${state.op === op ? 'is-active' : ''}" data-op="${op}">${lbl}</button>`
    )
    .join('')}
          </div>
          <div style="display:inline-flex;gap:6px;flex-wrap:wrap">
            <button type="button" class="action-btn" data-preset="overlap">${t.ortho.presets.overlap}</button>
            <button type="button" class="action-btn" data-preset="punch">${t.ortho.presets.punch}</button>
            <button type="button" class="action-btn" data-preset="touch">${t.ortho.presets.touch}</button>
            ${state.orthoStage === 'd1' ? `<button type="button" class="action-btn" data-preset="singleton">${t.ortho.presets.singleton}</button>` : ''}
          </div>
        </div>
        <div class="card-body" id="ortho-stage-body"></div>
      </section>
    `;

    container.querySelectorAll('[data-stage]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.orthoStage = btn.getAttribute('data-stage');
        render(container);
      });
    });

    container.querySelectorAll('[data-op]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.op = btn.getAttribute('data-op');
        render(container);
      });
    });

    container.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-preset');
        if (p === 'overlap') {
          state.d1 = { a: [1.5, 6], aLc: true, aRc: true, b: [4, 8.5], bLc: true, bRc: true };
          state.d2.a = [[1.5, 6.5], [2, 7.5]];
          state.d2.b = [[4, 8.5], [3.5, 8.5]];
          state.d3.a = [[1.5, 6.5], [1.5, 6.5], [1.5, 6.5]];
          state.d3.b = [[4, 8.5], [3.5, 8.5], [3.5, 8.5]];
        } else if (p === 'punch') {
          state.d1 = { a: [1, 9], aLc: true, aRc: true, b: [3.5, 6.5], bLc: true, bRc: true };
          state.d2.a = [[1, 9], [1, 9]];
          state.d2.b = [[3.5, 6.5], [3.5, 6.5]];
          state.d3.a = [[1.5, 8.5], [1.5, 8.5], [1.5, 8.5]];
          state.d3.b = [[3.5, 6.5], [3.5, 6.5], [3.5, 6.5]];
          state.explode3d = 0.36;
        } else if (p === 'touch') {
          state.d1 = { a: [1, 5], aLc: true, aRc: true, b: [5, 8.5], bLc: true, bRc: false };
          state.d2.a = [[1, 5], [2, 8]];
          state.d2.b = [[5, 9], [2, 8]];
          state.d3.a = [[1, 5], [2, 8], [2, 8]];
          state.d3.b = [[5, 9], [2, 8], [2, 8]];
        } else if (p === 'singleton') {
          state.d1 = { a: [1, 8], aLc: true, aRc: true, b: [4, 4], bLc: true, bRc: true };
          state.op = 'SUB';
        }
        render(container);
      });
    });

    const stageBody = container.querySelector('#ortho-stage-body');
    if (state.orthoStage === 'd1') render1D(stageBody);
    else if (state.orthoStage === 'd2') render2D(stageBody);
    else if (state.orthoStage === 'd3') render3D(stageBody);
    else if (state.orthoStage === 'd4') render4D(stageBody);
    else renderND(stageBody);
  };

  return { render };
};
