import { I18N } from './i18n.js';
import { createOrthotopeController } from './orthotope-views.js';
import { createSandboxControllers } from './sandbox-views.js';

const BASE_PATH = new URL('./', import.meta.url).pathname;
const STORAGE_THEME_KEY = 'utils-visual-theme';
const STORAGE_LANG_KEY = 'utils-visual-lang';

const TAB_ROUTES = [
  { id: 'orthotope', slug: '', aliases: ['orthotope', 'index.html'], badge: '1D–12D' },
  { id: 'compendium', slug: 'compendium', aliases: ['compendium'], badge: '3ⁿ · Vₙ' },
  { id: 'gridNav', slug: 'grid-nav', aliases: ['grid-nav', 'grid'], badge: '2D' },
  { id: 'statistics', slug: 'statistics', aliases: ['statistics', 'stats'], badge: 'μ · σ' },
  { id: 'combinatorics', slug: 'combinatorics', aliases: ['combinatorics'], badge: 'nCk' },
  { id: 'color', slug: 'color', aliases: ['color'], badge: 'HSL' },
  { id: 'matrix', slug: 'matrix', aliases: ['matrix'], badge: 'A·B' },
];

const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

const getSystemTheme = () => (systemDarkQuery.matches ? 'dark' : 'light');

const readInitialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignore storage block in restricted sandboxes
  }
  return getSystemTheme();
};

const readInitialLang = () => {
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    if (saved === 'pl' || saved === 'en') return saved;
  } catch {
    // Ignore storage block
  }
  return (navigator.language || '').toLowerCase().startsWith('pl') ? 'pl' : 'en';
};

const state = {
  basePath: BASE_PATH,
  theme: readInitialTheme(),
  lang: readInitialLang(),
  activeTab: 'orthotope',
  orthoStage: 'd3',
  op: 'SUB',
  notationStyle: 'bracket',
  explode2d: 0.14,
  explode3d: 0.28,
  cam3d: { azimuth: -0.64, elevation: 0.46 },
  w4d: 5.0,
  xwAngle4d: 0.42,
  d1: { a: [1.5, 7.5], aLc: true, aRc: true, b: [4.0, 6.0], bLc: false, bRc: true },
  d2: {
    a: [[1.5, 7.5], [1.5, 8.0]],
    aClosed: true,
    b: [[4.0, 8.5], [3.5, 6.5]],
    bClosed: true,
  },
  d3: {
    a: [[1.5, 8.0], [1.5, 8.0], [1.5, 8.0]],
    b: [[4.0, 8.5], [3.5, 7.0], [3.5, 7.0]],
  },
  d4: {
    a: [[1.5, 8.0], [1.5, 8.0], [1.5, 8.0], [1.5, 8.5]],
    b: [[3.5, 6.5], [3.5, 6.5], [3.5, 6.5], [3.5, 6.5]],
  },
  dn: {
    dim: 7,
    a: Array.from({ length: 12 }, (_, i) => [1.5, i % 2 === 0 ? 8.0 : 7.5]),
    b: Array.from({ length: 12 }, (_, i) => [3.5, i % 3 === 0 ? 8.5 : 6.5]),
  },
  compendium: { dim: 5 },
  grid: {
    totalItems: 14,
    columns: 4,
    current: 5,
    wrapH: false,
    wrapV: false,
    rowStrict: false,
    spanLast: false,
    tolerance: 5,
  },
  stats: {
    mu: 3.0,
    sigma: 1.5,
    samples: [1.2, 2.1, 2.6, 3.0, 3.3, 3.8, 4.4, 5.1],
    dragIdx: -1,
  },
  comb: { mode: 'variation', n: 4, k: 2, selectedIdx: 0, hoverIdx: -1 },
  color: { hexA: '#2dd4bf', hexB: '#fbbf24', t: 0.5, steps: 9 },
  matrix: {
    size: 2,
    a2: [[1.5, 0.5], [-0.5, 1.2]],
    b2: [[1, 2], [0, 1]],
    a3: [[1, 0.5, 0], [-0.5, 1, 0], [0, 0, 1]],
    b3: [[2, 0, 1], [0, 1, -1], [1, 1, 1]],
    highlight: [0, 0],
  },
};

const getDict = () => I18N[state.lang] || I18N.en;

const orthoController = createOrthotopeController(state, getDict, () => {});
const sandboxControllers = createSandboxControllers(state, getDict);

const appEl = document.getElementById('app');
const helpDialog = document.getElementById('help-dialog');
const tipEl = document.getElementById('global-tip');
let activeTipTarget = null;

/* ==========================================================================
 * URL ROUTING & LEGACY HASH NORMALIZATION
 * ======================================================================== */
const buildTabPath = (tabId) => {
  const entry = TAB_ROUTES.find((r) => r.id === tabId) || TAB_ROUTES[0];
  return entry.slug ? `${BASE_PATH}${entry.slug}/` : BASE_PATH;
};

const resolveRouteFromLocation = () => {
  const rawHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (rawHash && rawHash !== 'help') {
    const hashMatch = TAB_ROUTES.find((r) => r.aliases.includes(rawHash));
    if (hashMatch) {
      window.history.replaceState(null, '', buildTabPath(hashMatch.id));
      return hashMatch.id;
    }
  }

  let rel = window.location.pathname;
  if (rel.startsWith(BASE_PATH)) {
    rel = rel.slice(BASE_PATH.length);
  }
  rel = rel.replace(/^\/+|\/+$/g, '').replace(/\/index\.html$/i, '').toLowerCase();
  if (!rel || rel === 'index.html') return 'orthotope';

  const found = TAB_ROUTES.find((r) => r.slug === rel || r.aliases.includes(rel));
  return found ? found.id : 'orthotope';
};

/* ==========================================================================
 * ZERO-FOUC / 0ms THEME & REACTIVE FAVICON SYNC
 * ======================================================================== */
const syncThemeDomAttributes = () => {
  const root = document.documentElement;
  const isDark = state.theme === 'dark';
  root.setAttribute('data-theme', state.theme);
  root.setAttribute('lang', state.lang);

  const metaScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaScheme) metaScheme.setAttribute('content', state.theme);

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) metaThemeColor.setAttribute('content', isDark ? '#111316' : '#f5f4ef');

  const iconHref = `${BASE_PATH}${isDark ? 'utils-dark.svg' : 'utils-light.svg'}`;
  document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((lnk) => {
    lnk.setAttribute('href', iconHref);
  });
};

const refreshActiveTipText = () => {
  if (!activeTipTarget || tipEl.hidden) return;
  const msg = activeTipTarget.getAttribute('data-tip');
  if (!msg) {
    tipEl.hidden = true;
    return;
  }
  tipEl.textContent = msg;
};

/* ==========================================================================
 * SHORTCUTS MODAL (<dialog closedby="any"> + #help URL hash)
 * ======================================================================== */
const renderHelpModalContent = () => {
  const s = getDict().shortcuts;
  helpDialog.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title" id="help-dialog-title">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>
        </svg>
        <span>${s.modalTitle}</span>
      </h2>
      <button type="button" class="modal-close-btn" id="help-close-btn" aria-label="Close">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="shortcut-group">
        <h3 class="group-title">${s.explorerGroup}</h3>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd class="nano-kbd">1</kbd><span style="color:var(--text-subtle)">–</span><kbd class="nano-kbd">7</kbd></div>
          <span class="shortcut-desc">${s.tabs17}</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd class="nano-kbd">←</kbd><kbd class="nano-kbd">↑</kbd><kbd class="nano-kbd">↓</kbd><kbd class="nano-kbd">→</kbd></div>
          <span class="shortcut-desc">${s.arrows}</span>
        </div>
      </div>
      <div class="shortcut-group">
        <h3 class="group-title">${s.viewGroup}</h3>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd class="nano-kbd">T</kbd></div>
          <span class="shortcut-desc">${s.toggleTheme}</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd class="nano-kbd">L</kbd></div>
          <span class="shortcut-desc">${s.toggleLang}</span>
        </div>
      </div>
      <div class="shortcut-group">
        <h3 class="group-title">${s.generalGroup}</h3>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd class="nano-kbd">?</kbd></div>
          <span class="shortcut-desc">${s.openHelp}</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd class="nano-kbd">Esc</kbd></div>
          <span class="shortcut-desc">${s.closeModal}</span>
        </div>
      </div>
    </div>
  `;

  helpDialog.querySelector('#help-close-btn')?.addEventListener('click', () => {
    closeHelpModal();
  });
};

const openHelpModal = () => {
  renderHelpModalContent();
  if (!helpDialog.open) {
    helpDialog.showModal();
  }
  if (window.location.hash !== '#help') {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#help`);
  }
};

const closeHelpModal = () => {
  if (helpDialog.open) {
    helpDialog.close();
  }
  if (window.location.hash === '#help') {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
};

helpDialog.addEventListener('close', () => {
  if (window.location.hash === '#help') {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
});

// Fallback backdrop click handler for browsers without <dialog closedby="any">
helpDialog.addEventListener('click', (event) => {
  if (event.target === helpDialog) {
    const rect = helpDialog.getBoundingClientRect();
    const clickedInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!clickedInDialog) {
      closeHelpModal();
    }
  }
});

/* ==========================================================================
 * SHELL & ACTIVE PANEL RENDERING
 * ======================================================================== */
const renderActiveTabPanel = () => {
  const panel = document.getElementById('active-tab-panel');
  if (!panel) return;

  if (state.activeTab === 'orthotope') orthoController.render(panel);
  else if (state.activeTab === 'compendium') sandboxControllers.renderCompendium(panel);
  else if (state.activeTab === 'gridNav') sandboxControllers.renderGridNav(panel);
  else if (state.activeTab === 'statistics') sandboxControllers.renderStatistics(panel);
  else if (state.activeTab === 'combinatorics') sandboxControllers.renderCombinatorics(panel);
  else if (state.activeTab === 'color') sandboxControllers.renderColor(panel);
  else if (state.activeTab === 'matrix') sandboxControllers.renderMatrix(panel);
};

const renderShell = () => {
  const t = getDict();
  const isDark = state.theme === 'dark';
  const brandSvg = `${BASE_PATH}${isDark ? 'utils-dark.svg' : 'utils-light.svg'}`;
  const themeTip = isDark ? t.themeTipDark : t.themeTipLight;

  const themeIconSvg = isDark
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

  appEl.innerHTML = `
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand-link" href="${BASE_PATH}" id="brand-home-link">
          <img class="brand-icon" src="${brandSvg}" width="34" height="34" alt="@gkucmierz/utils">
          <div class="brand-text">
            <span class="brand-title">@gkucmierz/utils</span>
            <span class="brand-subtitle">${t.brandSubtitle}</span>
          </div>
        </a>
        <div class="header-actions">
          <a class="top-btn" href="${BASE_PATH}api.html" data-tip="${t.apiTip}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
            <span>${t.apiBtn}</span>
          </a>
          <button type="button" class="top-btn" id="btn-lang" data-tip="${t.langTip}" aria-label="${t.langTip}">
            <span class="mono">${state.lang.toUpperCase()}</span>
          </button>
          <button type="button" class="top-btn top-btn-icon" id="btn-theme" data-tip="${themeTip}" aria-label="${themeTip}">
            ${themeIconSvg}
          </button>
          <button type="button" class="top-btn top-btn-icon" id="btn-help" data-tip="${t.helpTip}" aria-label="${t.helpTip}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <nav class="nav-tabs-bar" aria-label="Visual Sandbox Modules">
      <div class="nav-tabs-inner" role="tablist">
        ${TAB_ROUTES.map((r, idx) => `
          <button type="button"
            role="tab"
            aria-selected="${state.activeTab === r.id ? 'true' : 'false'}"
            class="seg-tab ${state.activeTab === r.id ? 'is-active' : ''}"
            data-route-tab="${r.id}">
            <span class="desktop-kbd-hint mono" style="font-size:0.7rem;opacity:0.65">${idx + 1}</span>
            <span>${t.tabs[r.id]}</span>
            <span class="seg-badge">${r.badge}</span>
          </button>
        `).join('')}
      </div>
    </nav>

    <main class="main-container">
      <div id="active-tab-panel"></div>
    </main>
  `;

  document.getElementById('brand-home-link')?.addEventListener('click', (ev) => {
    ev.preventDefault();
    navigateToTab('orthotope', true);
  });

  document.getElementById('btn-lang')?.addEventListener('click', () => {
    toggleLanguage();
  });

  document.getElementById('btn-theme')?.addEventListener('click', () => {
    toggleTheme();
  });

  document.getElementById('btn-help')?.addEventListener('click', () => {
    if (helpDialog.open) closeHelpModal();
    else openHelpModal();
  });

  appEl.querySelectorAll('[data-route-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigateToTab(btn.getAttribute('data-route-tab'), true);
    });
  });

  renderActiveTabPanel();
  if (helpDialog.open) renderHelpModalContent();
};

const navigateToTab = (tabId, pushHistory = true) => {
  const valid = TAB_ROUTES.some((r) => r.id === tabId) ? tabId : 'orthotope';
  state.activeTab = valid;
  if (pushHistory) {
    const hashSuffix = helpDialog.open ? '#help' : '';
    const targetUrl = `${buildTabPath(valid)}${hashSuffix}`;
    if (`${window.location.pathname}${window.location.hash}` !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
  }
  renderShell();
};

const applyTheme = (nextTheme, { persist = true } = {}) => {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  void root.offsetWidth;

  state.theme = nextTheme === 'light' ? 'light' : 'dark';
  if (persist) {
    try {
      if (state.theme === getSystemTheme()) {
        localStorage.removeItem(STORAGE_THEME_KEY);
      } else {
        localStorage.setItem(STORAGE_THEME_KEY, state.theme);
      }
    } catch {
      // Ignore storage block
    }
  }

  syncThemeDomAttributes();
  renderShell();
  refreshActiveTipText();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('theme-switching');
    });
  });
};

const toggleTheme = () => {
  const hoveredId = activeTipTarget?.id || null;
  applyTheme(state.theme === 'dark' ? 'light' : 'dark', { persist: true });
  if (hoveredId) {
    activeTipTarget = document.getElementById(hoveredId);
    refreshActiveTipText();
  }
};

const toggleLanguage = () => {
  const hoveredId = activeTipTarget?.id || null;
  state.lang = state.lang === 'en' ? 'pl' : 'en';
  try {
    localStorage.setItem(STORAGE_LANG_KEY, state.lang);
  } catch {
    // Ignore storage block
  }
  syncThemeDomAttributes();
  renderShell();
  if (hoveredId) {
    activeTipTarget = document.getElementById(hoveredId);
    refreshActiveTipText();
  }
};

/* ==========================================================================
 * CUSTOM STATIONARY TOOLTIP CONTROLLER (WCAG 1.4.13)
 * ======================================================================== */
const positionTip = (anchor) => {
  const msg = anchor.getAttribute('data-tip');
  if (!msg) return;
  tipEl.textContent = msg;
  tipEl.hidden = false;
  const rect = anchor.getBoundingClientRect();
  const tipRect = tipEl.getBoundingClientRect();
  const left = Math.max(8, Math.min(window.innerWidth - tipRect.width - 8, rect.left + rect.width / 2 - tipRect.width / 2));
  const top = rect.bottom + 8 + tipRect.height > window.innerHeight
    ? Math.max(8, rect.top - tipRect.height - 8)
    : rect.bottom + 8;
  tipEl.style.left = `${Math.round(left)}px`;
  tipEl.style.top = `${Math.round(top)}px`;
};

document.addEventListener('pointerover', (ev) => {
  const anchor = ev.target.closest?.('[data-tip]');
  if (!anchor) return;
  activeTipTarget = anchor;
  positionTip(anchor);
});

document.addEventListener('pointerout', (ev) => {
  if (!activeTipTarget) return;
  const nextRelated = ev.relatedTarget;
  if (nextRelated && activeTipTarget.contains(nextRelated)) return;
  activeTipTarget = null;
  tipEl.hidden = true;
});

window.addEventListener('scroll', () => {
  if (!tipEl.hidden) tipEl.hidden = true;
}, { passive: true });

/* ==========================================================================
 * GLOBAL KEYBOARD SHORTCUTS (MODAL-GLOBAL-SHORTCUTS-01)
 * ======================================================================== */
document.addEventListener('keydown', (ev) => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;

  const tag = ev.target?.tagName || '';
  const inEditable = tag === 'INPUT' || tag === 'TEXTAREA' || ev.target?.isContentEditable;

  if (ev.key === 'Escape') {
    if (!tipEl.hidden) {
      tipEl.hidden = true;
      activeTipTarget = null;
    }
    if (helpDialog.open) {
      ev.preventDefault();
      closeHelpModal();
    }
    return;
  }

  if (inEditable) return;

  // Global View Preferences execute BEFORE modal-open guard
  if (ev.key === 't' || ev.key === 'T') {
    ev.preventDefault();
    toggleTheme();
    return;
  }

  if (ev.key === 'l' || ev.key === 'L') {
    ev.preventDefault();
    toggleLanguage();
    return;
  }

  if (ev.key === '?') {
    ev.preventDefault();
    if (helpDialog.open) closeHelpModal();
    else openHelpModal();
    return;
  }

  if (helpDialog.open) return;

  if (ev.key >= '1' && ev.key <= '7') {
    const idx = Number(ev.key) - 1;
    if (TAB_ROUTES[idx]) {
      ev.preventDefault();
      navigateToTab(TAB_ROUTES[idx].id, true);
    }
    return;
  }

  if (state.activeTab === 'gridNav') {
    const arrowMap = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };
    if (arrowMap[ev.key]) {
      ev.preventDefault();
      const panel = document.getElementById('active-tab-panel');
      if (panel) sandboxControllers.stepGridByArrow(arrowMap[ev.key], panel);
    }
  }
});

/* ==========================================================================
 * SYSTEM PREFERENCE, CROSS-TAB SYNC & BOOT
 * ======================================================================== */
systemDarkQuery.addEventListener('change', (ev) => {
  try {
    if (!localStorage.getItem(STORAGE_THEME_KEY)) {
      applyTheme(ev.matches ? 'dark' : 'light', { persist: false });
    }
  } catch {
    applyTheme(ev.matches ? 'dark' : 'light', { persist: false });
  }
});

window.addEventListener('storage', (ev) => {
  if (ev.key === STORAGE_THEME_KEY) {
    const next = ev.newValue === 'light' || ev.newValue === 'dark' ? ev.newValue : getSystemTheme();
    applyTheme(next, { persist: false });
  } else if (ev.key === STORAGE_LANG_KEY && (ev.newValue === 'pl' || ev.newValue === 'en')) {
    state.lang = ev.newValue;
    syncThemeDomAttributes();
    renderShell();
  }
});

window.addEventListener('popstate', () => {
  state.activeTab = resolveRouteFromLocation();
  renderShell();
  if (window.location.hash === '#help') openHelpModal();
  else if (helpDialog.open) helpDialog.close();
});

// Boot sequence
state.activeTab = resolveRouteFromLocation();
syncThemeDomAttributes();
renderShell();
if (window.location.hash === '#help') {
  openHelpModal();
}
requestAnimationFrame(() => {
  document.documentElement.classList.remove('preload');
});
