import {
  ORTHOTOPE_TAXONOMY,
  getOrthotopeTaxonomy,
  orthotopeFaceCountBI,
  orthotopeFaceVector,
  unitBallVolume,
  hypercubeCornerConcentration,
  navigateGrid,
  detectGridColumns,
  gauss,
  mean,
  median,
  variance,
  std,
  dev,
  randNormal,
  variation,
  subset,
  combinations,
  permutations,
  nChooseK,
  bin2gray,
  gray2bin,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  interpolateColor,
  colorStops,
  matrixAsArray,
  transpose,
  rotate,
  mul,
} from './esm/main.mjs';

const fmt = (n, digits = 4) => {
  if (!Number.isFinite(n)) return '0';
  return Number.isInteger(n) ? String(n) : Number(n.toFixed(digits)).toString();
};

const setupCanvas = (canvas, w, h) => {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
};

const makeSwitchHtml = (id, checked, labelText) => `
  <label class="nano-switch-label" for="${id}">
    <button type="button" role="switch" id="${id}" class="nano-switch-btn" aria-checked="${checked ? 'true' : 'false'}">
      <span class="nano-switch-thumb"></span>
    </button>
    <span>${labelText}</span>
  </label>
`;

export const createSandboxControllers = (state, getDict) => {
  const baseHref = (file) => `${state.basePath || './'}${file}`;

  /* ========================================================================
   * TAB 2: MATHEMATICAL COMPENDIUM (0D..12D Taxonomy, 3^n Lattice, n-Ball)
   * ====================================================================== */
  const renderCompendium = (container) => {
    const t = getDict();
    const isPl = state.lang === 'pl';
    const isDark = state.theme === 'dark';
    const n = state.compendium.dim;
    const rawVec = orthotopeFaceVector(n);
    const faceVec = rawVec.map((count, k) => ({
      k,
      count,
      countBI: orthotopeFaceCountBI(n, k),
    }));
    const totalFaces = faceVec.reduce((acc, item) => acc + item.countBI, 0n);
    const expectedTernary = 3n ** BigInt(n);
    const tax = getOrthotopeTaxonomy(Math.min(12, n));
    const vBall = unitBallVolume(n);
    const cornerRatio = hypercubeCornerConcentration(n).cornerFraction;

    const maxFaceCount = Math.max(1, ...faceVec.map((f) => f.count));

    // Build SVG chart for n = 0..14 comparing V_n(1) and Corner Concentration
    const dims = Array.from({ length: 15 }, (_, idx) => idx);
    const balls = dims.map((d) => unitBallVolume(d));
    const corners = dims.map((d) => hypercubeCornerConcentration(d).cornerFraction * 100);
    const maxBall = Math.max(...balls);

    const svgW = 760;
    const svgH = 248;
    const padL = 48;
    const padR = 48;
    const padT = 24;
    const padB = 34;
    const plotW = svgW - padL - padR;
    const plotH = svgH - padT - padB;
    const xAt = (d) => padL + (d / 14) * plotW;
    const yBallAt = (v) => padT + plotH - (v / 6) * plotH;
    const yPctAt = (pct) => padT + plotH - (pct / 100) * plotH;

    const colBall = isDark ? '#2dd4bf' : '#0f766e';
    const colPeak = isDark ? '#fbbf24' : '#b45309';
    const colCorner = isDark ? '#fb7185' : '#be123c';

    const ballPoints = dims.map((d, idx) => `${xAt(d).toFixed(1)},${yBallAt(balls[idx]).toFixed(1)}`).join(' ');
    const cornerPoints = dims.map((d, idx) => `${xAt(d).toFixed(1)},${yPctAt(corners[idx]).toFixed(1)}`).join(' ');

    container.innerHTML = `
      <section class="section-card">
        <div class="card-header">
          <div class="card-title-group">
            <h1 class="card-title">${t.compendium.title}</h1>
            <p class="card-subtitle">${t.compendium.subtitle}</p>
          </div>
          <a class="action-btn" href="${baseHref('module-geometry.html')}">Geometry API →</a>
        </div>

        <div class="control-strip">
          <div class="stepper-field">
            <span>${t.ortho.dimStepperLabel}:</span>
            <div class="nano-stepper">
              <button type="button" data-comp-step="-1" aria-label="Decrease dimension">−</button>
              <span class="stepper-val">${n}D</span>
              <button type="button" data-comp-step="1" aria-label="Increase dimension">+</button>
            </div>
          </div>
          <div class="seg-group" role="group" aria-label="Quick Dimensions">
            ${[
    [0, '0D'],
    [3, '3D Cube'],
    [4, '4D Tesseract'],
    [5, '5D Peak'],
    [10, '10D Dekeract'],
    [12, '12D'],
  ]
    .map(
      ([d, lbl]) => `<button type="button" class="seg-btn ${n === d ? 'is-active' : ''}" data-comp-dim="${d}">${lbl}</button>`
    )
    .join('')}
          </div>
        </div>

        <div class="card-body">
          <div class="telemetry-bar">
            <div class="metric-box">
              <span class="metric-label">${isPl ? 'Nazwa n-ortotopu' : 'n-Orthotope'}</span>
              <span class="metric-value accent">${n <= 12 ? (isPl ? tax.orthotopePl : tax.orthotopeEn) : `${n}-orthotope`}</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Σ N_k(${n}) = 3^${n}</span>
              <span class="metric-value">${totalFaces.toString()}${totalFaces === expectedTernary ? ' ✓' : ''}</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">(n−1)-Facets (2n)</span>
              <span class="metric-value amber">${n === 0 ? 0 : 2 * n}</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Unit Ball V_${n}(1)</span>
              <span class="metric-value ${n === 5 ? 'amber' : ''}">${fmt(vBall, 5)}${n === 5 ? ' ★' : ''}</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">${isPl ? 'Udział narożników [-1,1]^n' : '[-1,1]^n Corner Share'}</span>
              <span class="metric-value rose">${(cornerRatio * 100).toFixed(2)}%</span>
            </div>
          </div>

          <div class="stage-grid-2">
            <div class="canvas-frame">
              <div class="hud-top-bar">
                <span>${t.compendium.faceTitle}</span>
                <span class="mono">n = ${n}</span>
              </div>
              <div style="padding:12px 14px;max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:7px">
                ${faceVec
    .map((item) => {
      const pct = Math.max(2, (item.count / maxFaceCount) * 100);
      const roleTag = item.k === 0
        ? (isPl ? 'wierzchołki (2^n)' : 'vertices (2^n)')
        : item.k === 1
          ? (isPl ? 'krawędzie' : 'edges')
          : item.k === n - 1 && n > 0
            ? (isPl ? 'fasety (2n)' : 'facets (2n)')
            : item.k === n
              ? (isPl ? 'wnętrze' : 'body')
              : `${item.k}-faces`;
      return `
                      <div style="display:grid;grid-template-columns:68px 1fr 92px;align-items:center;gap:8px;font-size:0.78rem">
                        <span class="mono" style="color:var(--text-muted)">k = ${item.k}</span>
                        <div style="height:18px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:5px;overflow:hidden;position:relative">
                          <div style="width:${pct.toFixed(1)}%;height:100%;background:${item.k === n - 1 ? colPeak : colBall};opacity:0.78"></div>
                          <span style="position:absolute;inset:0 8px;display:flex;align-items:center;font-size:0.7rem;color:var(--text-main)">${roleTag}</span>
                        </div>
                        <span class="mono" style="text-align:right;font-weight:700">${item.countBI.toString()}</span>
                      </div>
                    `;
    })
    .join('')}
              </div>
            </div>

            <div class="canvas-frame">
              <div class="hud-top-bar">
                <span>${t.compendium.ballTitle}</span>
                <span class="mono">Peak V_5 ≈ ${maxBall.toFixed(4)}</span>
              </div>
              <svg class="interactive-svg" viewBox="0 0 ${svgW} ${svgH}" aria-label="Unit ball volume vs hypercube corner share">
                ${[0, 2, 4, 6]
    .map(
      (v) => `
                  <line x1="${padL}" y1="${yBallAt(v)}" x2="${svgW - padR}" y2="${yBallAt(v)}" stroke="var(--grid-line)" stroke-width="1"/>
                  <text x="${padL - 8}" y="${yBallAt(v) + 4}" text-anchor="end" fill="var(--text-muted)" font-size="10" class="mono">${v}</text>
                `
    )
    .join('')}
                ${[0, 50, 100]
    .map(
      (pct) => `
                  <text x="${svgW - padR + 8}" y="${yPctAt(pct) + 4}" text-anchor="start" fill="${colCorner}" font-size="10" class="mono">${pct}%</text>
                `
    )
    .join('')}
                <polyline fill="none" stroke="${colCorner}" stroke-width="2" stroke-dasharray="5 3" points="${cornerPoints}"/>
                <polyline fill="none" stroke="${colBall}" stroke-width="2.5" points="${ballPoints}"/>
                ${dims
    .map((d, idx) => {
      const cx = xAt(d);
      const cy = yBallAt(balls[idx]);
      const isSel = d === n;
      const isPeak = d === 5;
      return `
                      <g data-pick-dim="${d}" style="cursor:pointer">
                        <rect x="${cx - 16}" y="${padT}" width="32" height="${plotH + 22}" fill="transparent"/>
                        ${isSel ? `<line x1="${cx}" y1="${padT}" x2="${cx}" y2="${padT + plotH}" stroke="${colPeak}" stroke-width="1.4" stroke-dasharray="3 3"/>` : ''}
                        <circle cx="${cx}" cy="${cy}" r="${isPeak || isSel ? 5.5 : 3.8}" fill="${isPeak ? colPeak : colBall}" stroke="var(--bg-card)" stroke-width="1.5"/>
                        <circle cx="${cx}" cy="${yPctAt(corners[idx])}" r="3" fill="${colCorner}"/>
                        <text x="${cx}" y="${svgH - 10}" text-anchor="middle" fill="${isSel ? 'var(--accent)' : 'var(--text-muted)'}" font-size="10.5" font-weight="${isSel ? '700' : '500'}" class="mono">${d}D</text>
                      </g>
                    `;
    })
    .join('')}
              </svg>
            </div>
          </div>

          <div class="nano-alert nano-alert-warn">
            <span>${t.compendium.ballNote}</span>
          </div>

          <h2 id="taxonomy-caption" style="font-size:0.95rem;margin:20px 0 10px">${t.compendium.tableTitle}</h2>
          <div tabindex="0" role="region" aria-labelledby="taxonomy-caption" class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th scope="col">${t.compendium.cols.dim}</th>
                  <th scope="col">${t.compendium.cols.polytope}</th>
                  <th scope="col">${t.compendium.cols.orthotope}</th>
                  <th scope="col">${t.compendium.cols.hypercube}</th>
                  <th scope="col">${t.compendium.cols.measure}</th>
                  <th scope="col">${t.compendium.cols.facet}</th>
                  <th scope="col">${t.compendium.cols.ballVol}</th>
                  <th scope="col">${t.compendium.cols.cornerPct}</th>
                </tr>
              </thead>
              <tbody>
                ${ORTHOTOPE_TAXONOMY.map((row) => {
    const vb = unitBallVolume(row.dim);
    const cp = hypercubeCornerConcentration(row.dim).cornerFraction * 100;
    const rowCls = row.dim === 5 ? 'is-peak' : '';
    return `
                    <tr class="${rowCls}" data-row-dim="${row.dim}" style="cursor:pointer">
                      <th scope="row">${row.dim}D${row.dim === 5 ? ' ★' : ''}</th>
                      <td data-label="${t.compendium.cols.polytope}">${isPl ? row.polytopePl : row.polytope}</td>
                      <td data-label="${t.compendium.cols.orthotope}">${isPl ? row.orthotopePl : row.orthotopeEn}</td>
                      <td data-label="${t.compendium.cols.hypercube}">${isPl ? row.hypercubePl : row.hypercubeEn}</td>
                      <td data-label="${t.compendium.cols.measure}">${isPl ? row.measurePl : row.measureEn}</td>
                      <td data-label="${t.compendium.cols.facet}" class="mono">${isPl ? row.facetPl : row.facetEn}</td>
                      <td data-label="${t.compendium.cols.ballVol}" class="mono">${vb.toFixed(4)}</td>
                      <td data-label="${t.compendium.cols.cornerPct}" class="mono">${cp.toFixed(2)}%</td>
                    </tr>
                  `;
  }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    container.querySelectorAll('[data-comp-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = Number(btn.getAttribute('data-comp-step'));
        state.compendium.dim = Math.max(0, Math.min(20, state.compendium.dim + step));
        renderCompendium(container);
      });
    });

    container.querySelectorAll('[data-comp-dim],[data-pick-dim],[data-row-dim]').forEach((el) => {
      el.addEventListener('click', () => {
        const raw = el.getAttribute('data-comp-dim') ?? el.getAttribute('data-pick-dim') ?? el.getAttribute('data-row-dim');
        state.compendium.dim = Number(raw);
        renderCompendium(container);
      });
    });
  };

  /* ========================================================================
   * TAB 3: GRID NAVIGATION (navigateGrid & detectGridColumns)
   * ====================================================================== */
  const renderGridNav = (container) => {
    const t = getDict();
    const g = state.grid;
    const isPl = state.lang === 'pl';
    g.current = Math.max(0, Math.min(g.totalItems - 1, g.current));

    const spans = Array.from({ length: g.totalItems }, (_, idx) => {
      if (g.spanLast && idx === g.totalItems - 1) {
        const rem = (g.totalItems - 1) % g.columns;
        return Math.max(1, g.columns - rem);
      }
      return 1;
    });

    const navOpts = {
      columns: g.columns,
      wrapHoriz: g.wrapH,
      wrapVert: g.wrapV,
      rowStrict: g.rowStrict,
      spanLastRow: g.spanLast,
    };

    const nextUp = navigateGrid(g.current, g.totalItems, 'up', navOpts);
    const nextDown = navigateGrid(g.current, g.totalItems, 'down', navOpts);
    const nextLeft = navigateGrid(g.current, g.totalItems, 'left', navOpts);
    const nextRight = navigateGrid(g.current, g.totalItems, 'right', navOpts);

    // Simulated noisy DOM elements for detectGridColumns(elements, getRowOffset, tolerance)
    const jitterOffsets = [0, 3, -2, 4, 0, 2, -3, 1, 0, 4, -1, 2];
    const mockElements = Array.from({ length: Math.min(12, g.totalItems) }, (_, idx) => {
      const row = Math.floor(idx / g.columns);
      return { offsetTop: row * 60 + jitterOffsets[idx % jitterOffsets.length] };
    });
    const detectedCols = detectGridColumns(mockElements, (el) => el.offsetTop, g.tolerance);

    const targetBadges = new Map();
    const pushBadge = (idx, arrow) => {
      if (idx === g.current) return;
      targetBadges.set(idx, (targetBadges.get(idx) ? `${targetBadges.get(idx)} ` : '') + arrow);
    };
    pushBadge(nextUp, '↑');
    pushBadge(nextDown, '↓');
    pushBadge(nextLeft, '←');
    pushBadge(nextRight, '→');

    container.innerHTML = `
      <section class="section-card">
        <div class="card-header">
          <div class="card-title-group">
            <h1 class="card-title">${t.grid.title}</h1>
            <p class="card-subtitle">${t.grid.subtitle}</p>
          </div>
          <a class="action-btn" href="${baseHref('module-developer-utils.html')}">Grid API →</a>
        </div>

        <div class="control-strip">
          <div class="stepper-field">
            <span>${t.grid.items}:</span>
            <div class="nano-stepper">
              <button type="button" data-grid-items="-1">−</button>
              <span class="stepper-val">${g.totalItems}</span>
              <button type="button" data-grid-items="1">+</button>
            </div>
          </div>
          <div class="stepper-field">
            <span>${t.grid.cols}:</span>
            <div class="nano-stepper">
              <button type="button" data-grid-cols="-1">−</button>
              <span class="stepper-val">${g.columns}</span>
              <button type="button" data-grid-cols="1">+</button>
            </div>
          </div>
          ${makeSwitchHtml('sw-wraph', g.wrapH, t.grid.wrapH)}
          ${makeSwitchHtml('sw-wrapv', g.wrapV, t.grid.wrapV)}
          ${makeSwitchHtml('sw-strict', g.rowStrict, t.grid.rowStrict)}
          ${makeSwitchHtml('sw-spanlast', g.spanLast, t.grid.spanLast)}
          <label class="slider-field">
            <span>${t.grid.tolerance}:</span>
            <input type="range" id="grid-tol-range" min="0" max="12" step="1" value="${g.tolerance}">
            <span class="slider-val">${g.tolerance}px</span>
          </label>
        </div>

        <div class="card-body">
          <div class="telemetry-bar">
            <div class="metric-box">
              <span class="metric-label">${isPl ? 'Aktywny Indeks' : 'Active Index'}</span>
              <span class="metric-value accent">#${g.current}</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">← / →</span>
              <span class="metric-value">#${nextLeft} / #${nextRight}</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">↑ / ↓</span>
              <span class="metric-value amber">#${nextUp} / #${nextDown}</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">detectGridColumns (±4px jitter)</span>
              <span class="metric-value ${detectedCols === g.columns ? 'accent' : 'rose'}">${detectedCols} cols</span>
            </div>
          </div>

          <div class="stage-grid-2">
            <div>
              <div class="jagged-grid" style="grid-template-columns:repeat(${g.columns}, minmax(0, 1fr))">
                ${Array.from({ length: g.totalItems }, (_, idx) => {
    const isCur = idx === g.current;
    const badge = targetBadges.get(idx) || '';
    const spanVal = spans[idx];
    return `
                    <button type="button"
                      class="grid-cell-btn ${isCur ? 'is-current' : ''} ${badge ? 'is-target' : ''}"
                      style="grid-column: span ${spanVal}"
                      data-cell-idx="${idx}">
                      <span>#${idx}${spanVal > 1 ? ` (×${spanVal})` : ''}</span>
                      <span class="grid-cell-tag">${isCur ? '● active' : badge}</span>
                    </button>
                  `;
  }).join('')}
              </div>
            </div>

            <div>
              <div class="canvas-frame" style="padding:16px">
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">
                  ${isPl ? 'Steruj przyciskami lub strzałkami klawiatury:' : 'Step with buttons or keyboard arrow keys:'}
                </div>
                <div style="display:grid;grid-template-columns:repeat(3, 56px);gap:8px;justify-content:center">
                  <span></span>
                  <button type="button" class="action-btn" style="justify-content:center" data-move-dir="up">↑</button>
                  <span></span>
                  <button type="button" class="action-btn" style="justify-content:center" data-move-dir="left">←</button>
                  <button type="button" class="action-btn" style="justify-content:center" data-move-dir="down">↓</button>
                  <button type="button" class="action-btn" style="justify-content:center" data-move-dir="right">→</button>
                </div>
                <div class="code-panel">
                  <pre>navigateGrid(${g.current}, ${g.totalItems}, dir, {
  columns: ${g.columns}, spanLastRow: ${g.spanLast},
  wrapHoriz: ${g.wrapH}, wrapVert: ${g.wrapV}, rowStrict: ${g.rowStrict},
}); // → { left: ${nextLeft}, right: ${nextRight}, up: ${nextUp}, down: ${nextDown} }</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    container.querySelectorAll('[data-grid-items]').forEach((btn) => {
      btn.addEventListener('click', () => {
        g.totalItems = Math.max(5, Math.min(23, g.totalItems + Number(btn.getAttribute('data-grid-items'))));
        g.current = Math.min(g.current, g.totalItems - 1);
        renderGridNav(container);
      });
    });

    container.querySelectorAll('[data-grid-cols]').forEach((btn) => {
      btn.addEventListener('click', () => {
        g.columns = Math.max(1, Math.min(6, g.columns + Number(btn.getAttribute('data-grid-cols'))));
        renderGridNav(container);
      });
    });

    const bindSwitch = (id, key) => {
      const el = container.querySelector(`#${id}`);
      el?.addEventListener('click', () => {
        g[key] = !g[key];
        renderGridNav(container);
      });
    };
    bindSwitch('sw-wraph', 'wrapH');
    bindSwitch('sw-wrapv', 'wrapV');
    bindSwitch('sw-strict', 'rowStrict');
    bindSwitch('sw-spanlast', 'spanLast');

    container.querySelector('#grid-tol-range')?.addEventListener('input', (e) => {
      g.tolerance = Number(e.target.value);
      renderGridNav(container);
    });

    container.querySelectorAll('[data-cell-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        g.current = Number(btn.getAttribute('data-cell-idx'));
        renderGridNav(container);
      });
    });

    container.querySelectorAll('[data-move-dir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = btn.getAttribute('data-move-dir');
        g.current = navigateGrid(g.current, g.totalItems, dir, navOpts);
        renderGridNav(container);
      });
    });
  };

  const stepGridByArrow = (dir, container) => {
    const g = state.grid;
    g.current = navigateGrid(g.current, g.totalItems, dir, {
      columns: g.columns,
      wrapHoriz: g.wrapH,
      wrapVert: g.wrapV,
      rowStrict: g.rowStrict,
      spanLastRow: g.spanLast,
    });
    renderGridNav(container);
  };

  /* ========================================================================
   * TAB 4: MATH & DESCRIPTIVE STATISTICS (gauss, mean, median, std, dev)
   * ====================================================================== */
  const renderStatistics = (container) => {
    const t = getDict();
    const st = state.stats;
    const isDark = state.theme === 'dark';

    const drawStatsCanvas = () => {
      const canvas = container.querySelector('#stats-canvas');
      if (!canvas) return;
      const W = 780;
      const H = 290;
      const ctx = setupCanvas(canvas, W, H);
      ctx.clearRect(0, 0, W, H);

      const xMin = -5;
      const xMax = 14;
      const padL = 44;
      const padR = 24;
      const padT = 24;
      const padB = 42;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      const peakY = Math.max(0.45, gauss(st.mu, st.mu, st.sigma) * 1.15);

      const xPx = (x) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
      const yPx = (y) => padT + plotH - (y / peakY) * plotH;

      // Grid lines
      ctx.strokeStyle = isDark ? '#222930' : '#e5e2d8';
      ctx.lineWidth = 1;
      for (let x = -4; x <= 14; x += 2) {
        const px = xPx(x);
        ctx.beginPath();
        ctx.moveTo(px, padT);
        ctx.lineTo(px, padT + plotH);
        ctx.stroke();
        ctx.fillStyle = isDark ? '#9aa6b2' : '#4b5563';
        ctx.font = '11px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(x), px, H - 14);
      }

      // Shaded ±3σ, ±2σ, ±1σ bands
      const colTeal = isDark ? '45, 212, 191' : '15, 118, 110';
      [3, 2, 1].forEach((k, idx) => {
        const lo = Math.max(xMin, st.mu - k * st.sigma);
        const hi = Math.min(xMax, st.mu + k * st.sigma);
        if (hi <= lo) return;
        ctx.beginPath();
        ctx.moveTo(xPx(lo), yPx(0));
        const steps = 64;
        for (let s = 0; s <= steps; s += 1) {
          const xv = lo + ((hi - lo) * s) / steps;
          ctx.lineTo(xPx(xv), yPx(gauss(xv, st.mu, st.sigma)));
        }
        ctx.lineTo(xPx(hi), yPx(0));
        ctx.closePath();
        ctx.fillStyle = `rgba(${colTeal}, ${0.08 + idx * 0.09})`;
        ctx.fill();
      });

      // Gaussian PDF curve
      ctx.beginPath();
      const totalSteps = 180;
      for (let s = 0; s <= totalSteps; s += 1) {
        const xv = xMin + ((xMax - xMin) * s) / totalSteps;
        const px = xPx(xv);
        const py = yPx(gauss(xv, st.mu, st.sigma));
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = isDark ? '#2dd4bf' : '#0f766e';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Baseline
      ctx.beginPath();
      ctx.moveTo(padL, yPx(0));
      ctx.lineTo(W - padR, yPx(0));
      ctx.strokeStyle = isDark ? '#3a4552' : '#b8b3a4';
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Sample mean vs sample median vertical lines
      const sMean = mean(st.samples);
      const sMedian = median(st.samples);

      const drawVMarker = (val, color, label, yOff) => {
        const px = xPx(Math.max(xMin, Math.min(xMax, val)));
        ctx.beginPath();
        ctx.setLineDash([5, 4]);
        ctx.moveTo(px, padT);
        ctx.lineTo(px, padT + plotH);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${label}: ${val.toFixed(2)}`, Math.min(W - 125, px + 6), padT + yOff);
      };

      drawVMarker(sMean, isDark ? '#fbbf24' : '#b45309', 'mean', 14);
      drawVMarker(sMedian, isDark ? '#38bdf8' : '#0369a1', 'median', 30);

      // Draggable sample dots on baseline
      st.samples.forEach((sv, idx) => {
        const px = xPx(Math.max(xMin, Math.min(xMax, sv)));
        const py = yPx(0);
        ctx.beginPath();
        ctx.arc(px, py, idx === st.dragIdx ? 8 : 6.5, 0, Math.PI * 2);
        ctx.fillStyle = idx === st.samples.length - 1 && sv > 9
          ? (isDark ? '#fb7185' : '#be123c')
          : (isDark ? '#fbbf24' : '#b45309');
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isDark ? '#111316' : '#ffffff';
        ctx.stroke();
      });
    };

    const updateStatsTelemetry = () => {
      const mVal = mean(st.samples);
      const medVal = median(st.samples);
      const stdVal = std(st.samples);
      const sampleStdVal = std(st.samples, true);
      const devVal = dev(st.samples);
      const varVal = variance(st.samples);
      const peakPdf = gauss(st.mu, st.mu, st.sigma);

      const setTxt = (id, v) => {
        const el = container.querySelector(id);
        if (el) el.textContent = v;
      };
      setTxt('#stat-mean', mVal.toFixed(3));
      setTxt('#stat-median', medVal.toFixed(3));
      setTxt('#stat-std', `${stdVal.toFixed(3)} / ${devVal.toFixed(3)}`);
      setTxt('#stat-var', varVal.toFixed(3));
      setTxt('#stat-pdf', peakPdf.toFixed(4));
      setTxt('#stat-code', `const samples = [${st.samples.map((x) => x.toFixed(2)).join(', ')}];
mean(samples)       // → ${mVal.toFixed(4)}
median(samples)     // → ${medVal.toFixed(4)} (outlier-resistant)
std(samples)        // → ${stdVal.toFixed(4)} (population σ ÷N)
std(samples, true)  // → ${sampleStdVal.toFixed(4)} (Bessel sample s ÷(N-1))
dev(samples)        // → ${devVal.toFixed(4)} (mean absolute deviation MAD)`);
    };

    container.innerHTML = `
      <section class="section-card">
        <div class="card-header">
          <div class="card-title-group">
            <h1 class="card-title">${t.stats.title}</h1>
            <p class="card-subtitle">${t.stats.subtitle}</p>
          </div>
          <a class="action-btn" href="${baseHref('module-statistics.html')}">Statistics API →</a>
        </div>

        <div class="control-strip">
          <label class="slider-field">
            <span>${t.stats.mu}:</span>
            <input type="range" id="stats-mu" min="-2" max="8" step="0.25" value="${st.mu}">
            <span class="slider-val" id="stats-mu-lbl">${st.mu.toFixed(2)}</span>
          </label>
          <label class="slider-field">
            <span>${t.stats.sigma}:</span>
            <input type="range" id="stats-sigma" min="0.5" max="3.5" step="0.1" value="${st.sigma}">
            <span class="slider-val" id="stats-sigma-lbl">${st.sigma.toFixed(1)}</span>
          </label>
          <button type="button" class="action-btn" id="stats-resample">${t.stats.resample}</button>
          <button type="button" class="action-btn" id="stats-outlier">${t.stats.outlier}</button>
        </div>

        <div class="card-body">
          <div class="telemetry-bar">
            <div class="metric-box">
              <span class="metric-label">mean(samples)</span>
              <span class="metric-value amber" id="stat-mean">0</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">median(samples)</span>
              <span class="metric-value accent" id="stat-median">0</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">std(σ) / dev(MAD)</span>
              <span class="metric-value" id="stat-std">0</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">variance(samples)</span>
              <span class="metric-value" id="stat-var">0</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">gauss(μ, μ, σ)</span>
              <span class="metric-value accent" id="stat-pdf">0</span>
            </div>
          </div>

          <div class="canvas-frame">
            <div class="hud-top-bar">
              <span>${t.stats.dragHint}</span>
              <span class="mono">N = ${st.samples.length}</span>
            </div>
            <canvas id="stats-canvas" class="interactive-canvas" style="height:290px;cursor:ew-resize"></canvas>
          </div>

          <div class="code-panel">
            <pre id="stat-code"></pre>
          </div>
        </div>
      </section>
    `;

    drawStatsCanvas();
    updateStatsTelemetry();

    container.querySelector('#stats-mu')?.addEventListener('input', (e) => {
      st.mu = Number(e.target.value);
      container.querySelector('#stats-mu-lbl').textContent = st.mu.toFixed(2);
      drawStatsCanvas();
      updateStatsTelemetry();
    });

    container.querySelector('#stats-sigma')?.addEventListener('input', (e) => {
      st.sigma = Number(e.target.value);
      container.querySelector('#stats-sigma-lbl').textContent = st.sigma.toFixed(1);
      drawStatsCanvas();
      updateStatsTelemetry();
    });

    container.querySelector('#stats-resample')?.addEventListener('click', () => {
      st.samples = Array.from({ length: 8 }, () => {
        const raw = randNormal(st.mu, st.sigma);
        return Math.max(-4.5, Math.min(13.5, Number(raw.toFixed(2))));
      });
      drawStatsCanvas();
      updateStatsTelemetry();
    });

    container.querySelector('#stats-outlier')?.addEventListener('click', () => {
      st.samples[st.samples.length - 1] = 13.2;
      drawStatsCanvas();
      updateStatsTelemetry();
    });

    const canvas = container.querySelector('#stats-canvas');
    const xFromPointer = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const relX = ((ev.clientX - rect.left) / rect.width) * 780;
      const val = -5 + ((relX - 44) / (780 - 44 - 24)) * 19;
      return Math.max(-4.8, Math.min(13.8, Number(val.toFixed(2))));
    };

    canvas?.addEventListener('pointerdown', (ev) => {
      const targetX = xFromPointer(ev);
      let bestIdx = -1;
      let bestDist = Infinity;
      st.samples.forEach((sv, idx) => {
        const d = Math.abs(sv - targetX);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = idx;
        }
      });
      if (bestDist < 1.1 && bestIdx >= 0) {
        st.dragIdx = bestIdx;
        canvas.setPointerCapture?.(ev.pointerId);
        st.samples[bestIdx] = targetX;
        drawStatsCanvas();
        updateStatsTelemetry();
      }
    });

    canvas?.addEventListener('pointermove', (ev) => {
      if (st.dragIdx < 0) return;
      st.samples[st.dragIdx] = xFromPointer(ev);
      drawStatsCanvas();
      updateStatsTelemetry();
    });

    const endDrag = () => {
      if (st.dragIdx >= 0) {
        st.dragIdx = -1;
        drawStatsCanvas();
      }
    };
    canvas?.addEventListener('pointerup', endDrag);
    canvas?.addEventListener('pointercancel', endDrag);
  };

  /* ========================================================================
   * TAB 5: COMBINATORICS (variation, subset, combinations, permutations, gray)
   * ====================================================================== */
  const renderCombinatorics = (container) => {
    const t = getDict();
    const cb = state.comb;
    const isDark = state.theme === 'dark';
    const maxN = cb.mode === 'permutations' ? 4 : 5;
    cb.n = Math.max(2, Math.min(maxN, cb.n));
    cb.k = Math.max(1, Math.min(cb.n, cb.k));

    const alphabet = ['A', 'B', 'C', 'D', 'E'].slice(0, cb.n);
    let tuples = [];
    let formulaLabel = '';

    if (cb.mode === 'variation') {
      tuples = variation(alphabet, cb.k);
      formulaLabel = `P(${cb.n}, ${cb.k}) = ${tuples.length}`;
    } else if (cb.mode === 'subset') {
      tuples = subset(alphabet);
      formulaLabel = `2^${cb.n} = ${tuples.length}`;
    } else if (cb.mode === 'combinations') {
      tuples = combinations(cb.k, cb.n).map((idxs) => idxs.map((i) => alphabet[i]));
      formulaLabel = `C(${cb.n}, ${cb.k}) = ${tuples.length}`;
    } else if (cb.mode === 'permutations') {
      tuples = permutations(alphabet);
      formulaLabel = `${cb.n}! = ${tuples.length}`;
    } else {
      const count = 1 << cb.n;
      tuples = Array.from({ length: count }, (_, idx) => {
        const g = bin2gray(idx);
        const bits = g.toString(2).padStart(cb.n, '0');
        return bits.split('');
      });
      formulaLabel = `Gray(${cb.n}-bit) = ${tuples.length}`;
    }

    cb.selectedIdx = Math.max(0, Math.min(tuples.length - 1, cb.selectedIdx));
    const activeTuple = tuples[cb.selectedIdx] || [];
    const bigBinom = nChooseK(100, 50);

    // Build compact prefix tree up to first 32 leaves for crisp SVG visualization
    const shownLeaves = tuples.slice(0, 32);
    const svgW = 520;
    const svgH = 290;
    const maxDepth = Math.max(1, ...shownLeaves.map((tp) => tp.length));
    const nodeMap = new Map();
    nodeMap.set('root', { id: 'root', depth: 0, label: '∅', leafIndices: [] });

    shownLeaves.forEach((tp, leafIdx) => {
      nodeMap.get('root').leafIndices.push(leafIdx);
      let prefix = 'root';
      for (let d = 0; d < tp.length; d += 1) {
        const nextId = `${prefix}/${tp[d]}`;
        if (!nodeMap.has(nextId)) {
          nodeMap.set(nextId, { id: nextId, parent: prefix, depth: d + 1, label: String(tp[d]), leafIndices: [] });
        }
        nodeMap.get(nextId).leafIndices.push(leafIdx);
        prefix = nextId;
      }
    });

    const nodes = [...nodeMap.values()];
    nodes.forEach((nd) => {
      const avgLeaf = nd.leafIndices.reduce((a, b) => a + b, 0) / Math.max(1, nd.leafIndices.length);
      nd.x = 38 + (nd.depth / maxDepth) * (svgW - 84);
      nd.y = 22 + ((avgLeaf + 0.5) / Math.max(1, shownLeaves.length)) * (svgH - 44);
    });

    const highlightIdx = cb.hoverIdx >= 0 ? cb.hoverIdx : cb.selectedIdx;
    const colActive = isDark ? '#fbbf24' : '#b45309';
    const colBase = isDark ? '#2dd4bf' : '#0f766e';

    container.innerHTML = `
      <section class="section-card">
        <div class="card-header">
          <div class="card-title-group">
            <h1 class="card-title">${t.comb.title}</h1>
            <p class="card-subtitle">${t.comb.subtitle}</p>
          </div>
          <a class="action-btn" href="${baseHref('module-combinatorics.html')}">Combinatorics API →</a>
        </div>

        <div class="control-strip">
          <div class="seg-group" role="tablist">
            ${[
    ['variation', 'variation(n, k)'],
    ['subset', 'subset(n)'],
    ['combinations', 'combinations(n, k)'],
    ['permutations', 'permutations(n)'],
    ['gray', 'bin2gray(i)'],
  ]
    .map(
      ([m, lbl]) => `<button type="button" class="seg-btn ${cb.mode === m ? 'is-active' : ''}" data-comb-mode="${m}">${lbl}</button>`
    )
    .join('')}
          </div>
          <div class="stepper-field">
            <span>${t.comb.poolSize}:</span>
            <div class="nano-stepper">
              <button type="button" data-comb-n="-1">−</button>
              <span class="stepper-val">${cb.n}</span>
              <button type="button" data-comb-n="1">+</button>
            </div>
          </div>
          ${cb.mode === 'variation' || cb.mode === 'combinations'
    ? `
            <div class="stepper-field">
              <span>${t.comb.tupleK}:</span>
              <div class="nano-stepper">
                <button type="button" data-comb-k="-1">−</button>
                <span class="stepper-val">${cb.k}</span>
                <button type="button" data-comb-k="1">+</button>
              </div>
            </div>`
    : ''}
        </div>

        <div class="card-body">
          <div class="telemetry-bar">
            <div class="metric-box">
              <span class="metric-label">Cardinality</span>
              <span class="metric-value accent">${formulaLabel}</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Selected #${highlightIdx}</span>
              <span class="metric-value amber">[${(tuples[highlightIdx] || activeTuple).join(', ')}]</span>
            </div>
            <div class="metric-box" style="grid-column: span 2">
              <span class="metric-label">Exact BigInt nChooseK(100, 50)</span>
              <span class="metric-value" style="font-size:0.8rem">${bigBinom.toString()}n</span>
            </div>
          </div>

          <div class="stage-grid-2">
            <div class="canvas-frame">
              <div class="hud-top-bar">
                <span>Prefix Decision Tree (${Math.min(32, tuples.length)}/${tuples.length})</span>
                <span class="mono">${cb.mode}</span>
              </div>
              <svg id="comb-tree-svg" class="interactive-svg" viewBox="0 0 ${svgW} ${svgH}">
                ${nodes
    .filter((nd) => nd.parent)
    .map((nd) => {
      const parent = nodeMap.get(nd.parent);
      const isHit = nd.leafIndices.includes(highlightIdx);
      return `<line class="tree-edge" data-leaves="${nd.leafIndices.join(',')}" x1="${parent.x.toFixed(1)}" y1="${parent.y.toFixed(1)}" x2="${nd.x.toFixed(1)}" y2="${nd.y.toFixed(1)}" stroke="${isHit ? colActive : 'var(--border-strong)'}" stroke-width="${isHit ? 2.4 : 1.1}"/>`;
    })
    .join('')}
                ${nodes
    .map((nd) => {
      const isHit = nd.leafIndices.includes(highlightIdx);
      return `
                      <g class="tree-node" data-leaves="${nd.leafIndices.join(',')}">
                        <circle cx="${nd.x.toFixed(1)}" cy="${nd.y.toFixed(1)}" r="${isHit ? 7 : 5}" fill="${isHit ? colActive : colBase}"/>
                        <text x="${(nd.x + (nd.depth === maxDepth ? 10 : 0)).toFixed(1)}" y="${(nd.y - (nd.depth === maxDepth ? -3 : 8)).toFixed(1)}" text-anchor="${nd.depth === maxDepth ? 'start' : 'middle'}" fill="var(--text-main)" font-size="9.5" class="mono">${nd.label}</text>
                      </g>
                    `;
    })
    .join('')}
              </svg>
            </div>

            <div>
              <div class="tuple-corridor" id="tuple-corridor">
                ${tuples
    .map((tp, idx) => {
      const label = cb.mode === 'gray'
        ? `${tp.join('')} (${gray2bin(parseInt(tp.join(''), 2))})`
        : tp.length === 0
          ? '∅'
          : tp.join(' ');
      return `
                      <button type="button" class="tuple-pill ${idx === cb.selectedIdx ? 'is-selected' : ''}" data-tuple-idx="${idx}">
                        <span style="color:var(--text-muted)">#${idx}</span>
                        <span>${label}</span>
                      </button>
                    `;
    })
    .join('')}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    const syncTreeHighlight = (activeIdx) => {
      container.querySelectorAll('.tree-edge').forEach((edge) => {
        const leaves = edge.getAttribute('data-leaves').split(',').map(Number);
        const hit = leaves.includes(activeIdx);
        edge.setAttribute('stroke', hit ? colActive : 'var(--border-strong)');
        edge.setAttribute('stroke-width', hit ? '2.4' : '1.1');
      });
      container.querySelectorAll('.tree-node circle').forEach((circle) => {
        const leaves = circle.parentElement.getAttribute('data-leaves').split(',').map(Number);
        const hit = leaves.includes(activeIdx);
        circle.setAttribute('r', hit ? '7' : '5');
        circle.setAttribute('fill', hit ? colActive : colBase);
      });
    };

    container.querySelectorAll('[data-comb-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        cb.mode = btn.getAttribute('data-comb-mode');
        cb.selectedIdx = 0;
        cb.hoverIdx = -1;
        renderCombinatorics(container);
      });
    });

    container.querySelectorAll('[data-comb-n]').forEach((btn) => {
      btn.addEventListener('click', () => {
        cb.n = Math.max(2, Math.min(maxN, cb.n + Number(btn.getAttribute('data-comb-n'))));
        cb.k = Math.min(cb.k, cb.n);
        cb.selectedIdx = 0;
        renderCombinatorics(container);
      });
    });

    container.querySelectorAll('[data-comb-k]').forEach((btn) => {
      btn.addEventListener('click', () => {
        cb.k = Math.max(1, Math.min(cb.n, cb.k + Number(btn.getAttribute('data-comb-k'))));
        cb.selectedIdx = 0;
        renderCombinatorics(container);
      });
    });

    const corridor = container.querySelector('#tuple-corridor');
    container.querySelectorAll('[data-tuple-idx]').forEach((pill) => {
      const idx = Number(pill.getAttribute('data-tuple-idx'));
      pill.addEventListener('mouseenter', () => {
        cb.hoverIdx = idx;
        syncTreeHighlight(idx);
      });
      pill.addEventListener('click', () => {
        cb.selectedIdx = idx;
        renderCombinatorics(container);
      });
    });

    corridor?.addEventListener('mouseleave', () => {
      cb.hoverIdx = -1;
      syncTreeHighlight(cb.selectedIdx);
    });
  };

  /* ========================================================================
   * TAB 6: COLOR SPACE & SHORTEST-ARC INTERPOLATION
   * ====================================================================== */
  const renderColor = (container) => {
    const t = getDict();
    const cl = state.color;

    const stopsRgb = colorStops(cl.hexA, cl.hexB, cl.steps, 'rgb');
    const stopsLin = colorStops(cl.hexA, cl.hexB, cl.steps, 'linear');
    const stopsHsl = colorStops(cl.hexA, cl.hexB, cl.steps, 'hsl');

    const mixRgb = interpolateColor(cl.hexA, cl.hexB, cl.t, 'rgb');
    const mixLin = interpolateColor(cl.hexA, cl.hexB, cl.t, 'linear');
    const mixHsl = interpolateColor(cl.hexA, cl.hexB, cl.t, 'hsl');

    const hslA = rgbToHsl(hexToRgb(cl.hexA));
    const hslB = rgbToHsl(hexToRgb(cl.hexB));
    const hslMix = rgbToHsl(hexToRgb(mixHsl));
    const rgbMix = hexToRgb(mixLin);

    // Hue wheel geometry
    const cx = 130;
    const cy = 130;
    const R = 92;
    const ptOnWheel = (deg, rad = R) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return { x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad };
    };
    const pA = ptOnWheel(hslA.h);
    const pB = ptOnWheel(hslB.h);
    const pM = ptOnWheel(hslMix.h);

    const renderStrip = (label, arr, activeHex) => `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:5px">
          <span style="font-weight:700">${label}</span>
          <span class="mono" style="color:var(--accent)">t=${cl.t.toFixed(2)} → ${activeHex}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(${arr.length}, minmax(0, 1fr));height:38px;border-radius:8px;overflow:hidden;border:1px solid var(--border)">
          ${arr.map((hex) => `<div style="background:${hex}" data-tip="${hex}"></div>`).join('')}
        </div>
      </div>
    `;

    container.innerHTML = `
      <section class="section-card">
        <div class="card-header">
          <div class="card-title-group">
            <h1 class="card-title">${t.color.title}</h1>
            <p class="card-subtitle">${t.color.subtitle}</p>
          </div>
          <a class="action-btn" href="${baseHref('module-color.html')}">Color API →</a>
        </div>

        <div class="control-strip">
          <label class="stepper-field">
            <span>${t.color.colorA}:</span>
            <input type="color" id="col-input-a" value="${cl.hexA}" style="width:36px;height:30px;border:none;background:transparent;cursor:pointer">
            <span class="mono">${cl.hexA}</span>
          </label>
          <label class="stepper-field">
            <span>${t.color.colorB}:</span>
            <input type="color" id="col-input-b" value="${cl.hexB}" style="width:36px;height:30px;border:none;background:transparent;cursor:pointer">
            <span class="mono">${cl.hexB}</span>
          </label>
          <label class="slider-field">
            <span>${t.color.ratioT}:</span>
            <input type="range" id="col-ratio-t" min="0" max="1" step="0.02" value="${cl.t}">
            <span class="slider-val">${cl.t.toFixed(2)}</span>
          </label>
          <div class="stepper-field">
            <span>${t.color.stops}:</span>
            <div class="nano-stepper">
              <button type="button" data-col-stops="-1">−</button>
              <span class="stepper-val">${cl.steps}</span>
              <button type="button" data-col-stops="1">+</button>
            </div>
          </div>
          <div style="display:inline-flex;gap:6px">
            <button type="button" class="action-btn" data-col-preset="#ef4444,#06b6d4">Red ↔ Cyan</button>
            <button type="button" class="action-btn" data-col-preset="#2dd4bf,#fbbf24">Teal ↔ Amber</button>
            <button type="button" class="action-btn" data-col-preset="#a855f7,#22c55e">Violet ↔ Green</button>
          </div>
        </div>

        <div class="card-body">
          <div class="telemetry-bar">
            <div class="metric-box">
              <span class="metric-label">sRGB Mix</span>
              <span class="metric-value" style="display:inline-flex;align-items:center;gap:8px">
                <span style="width:16px;height:16px;border-radius:4px;background:${mixRgb};border:1px solid var(--border-strong)"></span>${mixRgb}
              </span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Linear RGB (γ=2.2)</span>
              <span class="metric-value accent" style="display:inline-flex;align-items:center;gap:8px">
                <span style="width:16px;height:16px;border-radius:4px;background:${mixLin};border:1px solid var(--border-strong)"></span>${mixLin}
              </span>
            </div>
            <div class="metric-box">
              <span class="metric-label">HSL Shortest Arc</span>
              <span class="metric-value amber" style="display:inline-flex;align-items:center;gap:8px">
                <span style="width:16px;height:16px;border-radius:4px;background:${mixHsl};border:1px solid var(--border-strong)"></span>${mixHsl}
              </span>
            </div>
            <div class="metric-box">
              <span class="metric-label">rgbToHsl(HSL mix)</span>
              <span class="metric-value">${hslMix.h.toFixed(0)}°, ${hslMix.s.toFixed(0)}%, ${hslMix.l.toFixed(0)}%</span>
            </div>
          </div>

          <div class="stage-grid-2">
            <div>
              ${renderStrip("colorStops(a, b, steps, 'rgb')", stopsRgb, mixRgb)}
              ${renderStrip("colorStops(a, b, steps, 'linear') — physical photon sum", stopsLin, mixLin)}
              ${renderStrip("colorStops(a, b, steps, 'hsl') — cylindrical shortest hue arc", stopsHsl, mixHsl)}
              <div class="code-panel">
                <pre>hexToRgb('${mixLin}') // → { r: ${rgbMix.r}, g: ${rgbMix.g}, b: ${rgbMix.b} }
rgbToHex(${rgbMix.r}, ${rgbMix.g}, ${rgbMix.b}) // → '${rgbToHex(rgbMix)}'</pre>
              </div>
            </div>

            <div class="canvas-frame" style="display:flex;flex-direction:column;align-items:center">
              <div class="hud-top-bar" style="width:100%">
                <span>HSL Hue Geodesic (${hslA.h.toFixed(0)}° → ${hslB.h.toFixed(0)}°)</span>
                <span class="mono">H(t) = ${hslMix.h.toFixed(1)}°</span>
              </div>
              <svg viewBox="0 0 260 260" style="width:250px;height:250px">
                ${Array.from({ length: 36 }, (_, idx) => {
    const deg0 = idx * 10;
    const deg1 = deg0 + 11;
    const q0 = ptOnWheel(deg0, R);
    const q1 = ptOnWheel(deg1, R);
    return `<line x1="${q0.x.toFixed(1)}" y1="${q0.y.toFixed(1)}" x2="${q1.x.toFixed(1)}" y2="${q1.y.toFixed(1)}" stroke="hsl(${deg0}, 85%, 55%)" stroke-width="14" stroke-linecap="butt"/>`;
  }).join('')}
                <line x1="${pA.x.toFixed(1)}" y1="${pA.y.toFixed(1)}" x2="${pB.x.toFixed(1)}" y2="${pB.y.toFixed(1)}" stroke="var(--border-strong)" stroke-dasharray="4 3" stroke-width="1.5"/>
                <circle cx="${pA.x.toFixed(1)}" cy="${pA.y.toFixed(1)}" r="8" fill="${cl.hexA}" stroke="#ffffff" stroke-width="2"/>
                <circle cx="${pB.x.toFixed(1)}" cy="${pB.y.toFixed(1)}" r="8" fill="${cl.hexB}" stroke="#ffffff" stroke-width="2"/>
                <circle cx="${pM.x.toFixed(1)}" cy="${pM.y.toFixed(1)}" r="9.5" fill="${mixHsl}" stroke="var(--amber)" stroke-width="2.5"/>
                <circle cx="${cx}" cy="${cy}" r="28" fill="${mixLin}" stroke="var(--border-strong)" stroke-width="1.5"/>
              </svg>
            </div>
          </div>
        </div>
      </section>
    `;

    container.querySelector('#col-input-a')?.addEventListener('input', (e) => {
      cl.hexA = e.target.value;
      renderColor(container);
    });
    container.querySelector('#col-input-b')?.addEventListener('input', (e) => {
      cl.hexB = e.target.value;
      renderColor(container);
    });
    container.querySelector('#col-ratio-t')?.addEventListener('input', (e) => {
      cl.t = Number(e.target.value);
      renderColor(container);
    });
    container.querySelectorAll('[data-col-stops]').forEach((btn) => {
      btn.addEventListener('click', () => {
        cl.steps = Math.max(3, Math.min(14, cl.steps + Number(btn.getAttribute('data-col-stops'))));
        renderColor(container);
      });
    });
    container.querySelectorAll('[data-col-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [a, b] = btn.getAttribute('data-col-preset').split(',');
        cl.hexA = a;
        cl.hexB = b;
        renderColor(container);
      });
    });
  };

  /* ========================================================================
   * TAB 7: MATRIX ALGEBRA (transpose, rotate, mul, matrixAsArray)
   * ====================================================================== */
  const renderMatrix = (container) => {
    const t = getDict();
    const mx = state.matrix;
    const isDark = state.theme === 'dark';
    const size = mx.size;

    const A = mx.size === 2 ? mx.a2 : mx.a3;
    const B = mx.size === 2 ? mx.b2 : mx.b3;
    const C = mul(A, B);
    const flatProxy = matrixAsArray(A);

    const [hr, hc] = mx.highlight;
    const safeR = Math.min(size - 1, hr);
    const safeC = Math.min(size - 1, hc);
    const dotTerms = A[safeR].map((av, k) => `(${fmt(av, 2)} · ${fmt(B[k][safeC], 2)})`).join(' + ');
    const det2 = A[0][0] * A[1][1] - A[0][1] * A[1][0];

    const drawBasisCanvas = () => {
      const canvas = container.querySelector('#matrix-canvas');
      if (!canvas) return;
      const W = 440;
      const H = 300;
      const ctx = setupCanvas(canvas, W, H);
      ctx.clearRect(0, 0, W, H);

      const ox = W / 2;
      const oy = H / 2;
      const sc = 42;
      const toScreen = (x, y) => ({ x: ox + x * sc, y: oy - y * sc });
      const applyA = (x, y) => ({
        x: A[0][0] * x + A[0][1] * y,
        y: A[1][0] * x + A[1][1] * y,
      });

      // Reference Cartesian grid
      ctx.strokeStyle = isDark ? '#222930' : '#e5e2d8';
      ctx.lineWidth = 1;
      for (let g = -4; g <= 4; g += 1) {
        const p1 = toScreen(g, -4);
        const p2 = toScreen(g, 4);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const q1 = toScreen(-5, g);
        const q2 = toScreen(5, g);
        ctx.beginPath();
        ctx.moveTo(q1.x, q1.y);
        ctx.lineTo(q2.x, q2.y);
        ctx.stroke();
      }

      // Transformed unit parallelogram
      const p00 = toScreen(0, 0);
      const p10 = toScreen(...Object.values(applyA(1, 0)));
      const p11 = toScreen(...Object.values(applyA(1, 1)));
      const p01 = toScreen(...Object.values(applyA(0, 1)));

      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.fillStyle = det2 >= 0
        ? (isDark ? 'rgba(45, 212, 191, 0.22)' : 'rgba(15, 118, 110, 0.18)')
        : (isDark ? 'rgba(251, 113, 133, 0.24)' : 'rgba(190, 18, 60, 0.18)');
      ctx.fill();
      ctx.strokeStyle = det2 >= 0 ? (isDark ? '#2dd4bf' : '#0f766e') : (isDark ? '#fb7185' : '#be123c');
      ctx.lineWidth = 1.6;
      ctx.stroke();

      const drawVec = (to, col, lbl) => {
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(to.x, to.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillText(lbl, to.x + 7, to.y - 6);
      };

      drawVec(p10, isDark ? '#2dd4bf' : '#0f766e', 'A·î');
      drawVec(p01, isDark ? '#fbbf24' : '#b45309', 'A·ĵ');
    };

    container.innerHTML = `
      <section class="section-card">
        <div class="card-header">
          <div class="card-title-group">
            <h1 class="card-title">${t.matrix.title}</h1>
            <p class="card-subtitle">${t.matrix.subtitle}</p>
          </div>
          <a class="action-btn" href="${baseHref('module-geometry.html')}">Matrix API →</a>
        </div>

        <div class="control-strip">
          <div class="seg-group">
            <button type="button" class="seg-btn ${size === 2 ? 'is-active' : ''}" data-mat-size="2">2 × 2</button>
            <button type="button" class="seg-btn ${size === 3 ? 'is-active' : ''}" data-mat-size="3">3 × 3</button>
          </div>
          <button type="button" class="action-btn" id="mat-rot-btn">${t.matrix.rotBtn}</button>
          <button type="button" class="action-btn" id="mat-trans-btn">${t.matrix.transposeBtn}</button>
          <button type="button" class="action-btn" id="mat-reset-btn">${t.matrix.resetBtn}</button>
        </div>

        <div class="card-body">
          <div class="telemetry-bar">
            <div class="metric-box">
              <span class="metric-label">det(A₂ₓ₂) Area Scale</span>
              <span class="metric-value ${det2 >= 0 ? 'accent' : 'rose'}">${fmt(det2, 3)} (${det2 >= 0 ? '+orient' : 'flipped'})</span>
            </div>
            <div class="metric-box" style="grid-column: span 2">
              <span class="metric-label">(A · B)[${safeR}, ${safeC}] Dot Product</span>
              <span class="metric-value amber">${dotTerms} = ${fmt(C[safeR][safeC], 3)}</span>
            </div>
          </div>

          <div class="stage-grid-2">
            <div class="canvas-frame">
              <div class="hud-top-bar">
                <span>2D Basis Vector Deformation (A · î, A · ĵ)</span>
                <span class="mono">det = ${fmt(det2, 2)}</span>
              </div>
              <canvas id="matrix-canvas" class="interactive-canvas" style="height:300px"></canvas>
            </div>

            <div>
              <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:10px">${t.matrix.hoverHint}</div>
              <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px">
                <div>
                  <div class="mono" style="font-size:0.74rem;color:var(--text-muted);margin-bottom:4px">Matrix A</div>
                  <div class="matrix-bracket" style="grid-template-columns:repeat(${size}, auto)">
                    ${A.map((row, r) => row
    .map(
      (val, c) => `<input type="text" inputmode="decimal" class="matrix-cell-input" style="${r === safeR ? 'border-color:var(--amber);background:var(--amber-soft)' : ''}" data-mat="A" data-r="${r}" data-c="${c}" value="${val}">`
    )
    .join('')).join('')}
                  </div>
                </div>

                <span class="mono" style="font-weight:700">×</span>

                <div>
                  <div class="mono" style="font-size:0.74rem;color:var(--text-muted);margin-bottom:4px">Matrix B</div>
                  <div class="matrix-bracket" style="grid-template-columns:repeat(${size}, auto)">
                    ${B.map((row, r) => row
    .map(
      (val, c) => `<input type="text" inputmode="decimal" class="matrix-cell-input" style="${c === safeC ? 'border-color:var(--amber);background:var(--amber-soft)' : ''}" data-mat="B" data-r="${r}" data-c="${c}" value="${val}">`
    )
    .join('')).join('')}
                  </div>
                </div>

                <span class="mono" style="font-weight:700">=</span>

                <div>
                  <div class="mono" style="font-size:0.74rem;color:var(--text-muted);margin-bottom:4px">mul(A, B)</div>
                  <div class="matrix-bracket" style="grid-template-columns:repeat(${size}, auto)">
                    ${C.map((row, r) => row
    .map(
      (val, c) => `<button type="button" class="matrix-out-cell ${r === safeR && c === safeC ? 'is-highlighted' : ''}" data-out-r="${r}" data-out-c="${c}">${fmt(val, 2)}</button>`
    )
    .join('')).join('')}
                  </div>
                </div>
              </div>

              <div style="margin-top:16px">
                <div class="mono" style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px">
                  matrixAsArray(A) — 1D Proxy over 2D Matrix (click slot to +1 in-place):
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:6px">
                  ${Array.from({ length: flatProxy.length }, (_, idx) => `
                    <button type="button" class="action-btn mono" data-proxy-idx="${idx}">[${idx}] = ${fmt(flatProxy[idx], 2)}</button>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    drawBasisCanvas();

    container.querySelectorAll('[data-mat-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        mx.size = Number(btn.getAttribute('data-mat-size'));
        mx.highlight = [0, 0];
        renderMatrix(container);
      });
    });

    container.querySelector('#mat-rot-btn')?.addEventListener('click', () => {
      if (mx.size === 2) mx.a2 = rotate(mx.a2, 1);
      else mx.a3 = rotate(mx.a3, 1);
      renderMatrix(container);
    });

    container.querySelector('#mat-trans-btn')?.addEventListener('click', () => {
      if (mx.size === 2) mx.a2 = transpose(mx.a2);
      else mx.a3 = transpose(mx.a3);
      renderMatrix(container);
    });

    container.querySelector('#mat-reset-btn')?.addEventListener('click', () => {
      mx.a2 = [[1.5, 0.5], [-0.5, 1.2]];
      mx.b2 = [[1, 2], [0, 1]];
      mx.a3 = [[1, 0.5, 0], [-0.5, 1, 0], [0, 0, 1]];
      mx.b3 = [[2, 0, 1], [0, 1, -1], [1, 1, 1]];
      renderMatrix(container);
    });

    container.querySelectorAll('[data-mat]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const which = inp.getAttribute('data-mat');
        const r = Number(inp.getAttribute('data-r'));
        const c = Number(inp.getAttribute('data-c'));
        const num = Number(inp.value);
        if (!Number.isFinite(num)) return;
        const target = which === 'A' ? A : B;
        target[r][c] = num;
        renderMatrix(container);
      });
    });

    container.querySelectorAll('[data-out-r]').forEach((btn) => {
      const selectCell = () => {
        mx.highlight = [Number(btn.getAttribute('data-out-r')), Number(btn.getAttribute('data-out-c'))];
        renderMatrix(container);
      };
      btn.addEventListener('click', selectCell);
    });

    container.querySelectorAll('[data-proxy-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-proxy-idx'));
        flatProxy[idx] = Number((flatProxy[idx] + 1).toFixed(3));
        renderMatrix(container);
      });
    });
  };

  return {
    renderCompendium,
    renderGridNav,
    stepGridByArrow,
    renderStatistics,
    renderCombinatorics,
    renderColor,
    renderMatrix,
  };
};
