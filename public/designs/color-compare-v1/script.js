/* ---------------- 数据 ---------------- */
const GROUPS = [
  {
    id: 'A',
    title: '第一组 · 陶溪川色系',
    desc: '16 色 · 原始仅提供 HEX',
    items: [
      { cn: '陶溪川红', hex: '#823725' },
      { cn: '柔雾玫瑰', hex: '#955250' },
      { cn: '白桃粉', hex: '#fecbd0' },
      { cn: '鹅黄', hex: '#fde6a3' },
      { cn: '酸柠黄', hex: '#fded25' },
      { cn: '芒果黄', hex: '#fca138' },
      { cn: '甜橙红', hex: '#fb632f' },
      { cn: '炭火红', hex: '#dc4243' },
      { cn: '煤玉黑', hex: '#010101' },
      { cn: '城墙灰', hex: '#4e4d50' },
      { cn: '松柏绿', hex: '#27443a' },
      { cn: '葡萄紫', hex: '#7d6578' },
      { cn: '海峡蓝', hex: '#385975' },
      { cn: '理想蓝', hex: '#3162d3' },
      { cn: '阿那亚蓝', hex: '#608ec9' },
      { cn: '时风蓝', hex: '#7ecdee' },
    ],
  },
  {
    id: 'B',
    title: '第二组 · 品牌专色',
    desc: '8 色 · 含 CMYK 与 PMS 标注',
    items: [
      { cn: '薄雾灰', en: 'Mist gray', hex: '#EDF1F3', cmyk: [5, 2, 2, 0], pms: 'PMS 656' },
      { cn: '玛瑙黑', en: 'Onyx black', hex: '#000000', cmyk: [0, 0, 0, 100], pms: null },
      { cn: '火烈鸟粉', en: 'Flamingo pink', hex: '#F2617A', cmyk: [0, 77, 35, 0], pms: 'PMS 709' },
      {
        cn: '海波兰主色',
        en: 'Wave blue',
        hex: '#003D4F',
        cmyk: [100, 60, 45, 25],
        pms: 'PMS 2182',
      },
      {
        cn: '姜黄色',
        en: 'Turmeric yellow',
        hex: '#CC850A',
        cmyk: [19, 51, 100, 3],
        pms: 'PMS 2014',
      },
      { cn: '翡翠绿', en: 'Jade green', hex: '#6B9E78', cmyk: [62, 21, 63, 2], pms: 'PMS 556' },
      { cn: '宝石蓝', en: 'Sapphire blue', hex: '#47A1AD', cmyk: [71, 20, 31, 0], pms: 'PMS 2219' },
      {
        cn: '紫水晶紫',
        en: 'Amethyst purple',
        hex: '#634F7D',
        cmyk: [70, 76, 26, 9],
        pms: 'PMS 7447',
      },
    ],
  },
];

/* ---------------- 色彩工具 ---------------- */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function relLum({ r, g, b }) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const la = relLum(a),
    lb = relLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function rgbToCmyk({ r, g, b }) {
  const R = r / 255,
    G = g / 255,
    B = b / 255;
  const k = 1 - Math.max(R, G, B);
  if (k >= 0.9999) return [0, 0, 0, 100];
  return [
    Math.round(((1 - R - k) / (1 - k)) * 100),
    Math.round(((1 - G - k) / (1 - k)) * 100),
    Math.round(((1 - B - k) / (1 - k)) * 100),
    Math.round(k * 100),
  ];
}
function rgbToLab({ r, g, b }) {
  const f = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = f(r),
    G = f(g),
    B = f(b);
  let X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  let Y = (R * 0.2126729 + G * 0.7151522 + B * 0.072175) / 1.0;
  let Z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883;
  const gm = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  X = gm(X);
  Y = gm(Y);
  Z = gm(Z);
  return { L: 116 * Y - 16, a: 500 * (X - Y), b: 200 * (Y - Z) };
}
function deltaE(c1, c2) {
  const A = rgbToLab(c1),
    B = rgbToLab(c2);
  return Math.hypot(A.L - B.L, A.a - B.a, A.b - B.b);
}
function pickText(rgb) {
  return contrast(rgb, { r: 255, g: 255, b: 255 }) >= contrast(rgb, { r: 17, g: 17, b: 17 })
    ? '#FFFFFF'
    : '#141414';
}
function hueKey(rgb) {
  const r = rgb.r / 255,
    g = rgb.g / 255,
    b = rgb.b / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  if (d < 0.06) return -1;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}
const fmt = (n) => Math.round(n * 10) / 10;
const hexUp = (h) => '#' + h.replace('#', '').toUpperCase();

/* ---------------- 预处理 ---------------- */
GROUPS.forEach((g) =>
  g.items.forEach((it) => {
    it.key = g.id + '|' + it.cn;
    it.gid = g.id;
    it.rgb = hexToRgb(it.hex);
    it.hexUp = hexUp(it.hex);
    it.cmykAuto = rgbToCmyk(it.rgb);
    it.lum = relLum(it.rgb);
    it.hue = hueKey(it.rgb);
  }),
);
const ALL = GROUPS.flatMap((g) => g.items);

/* ---------------- 状态 ---------------- */
let chosen = [];
let sortMode = 'default';
const metaOn = { rgb: true, cmyk: false, pms: false };

/* ---------------- 顶部色带 ---------------- */
document.getElementById('topStrip').innerHTML = ALL.map(
  (it) => `<span style="background:${it.hexUp}"></span>`,
).join('');

/* ---------------- 渲染色卡 ---------------- */
function sortByHue(items) {
  return items.slice().sort((a, b) => {
    if (a.hue < 0 && b.hue < 0) return a.lum - b.lum;
    if (a.hue < 0) return -1;
    if (b.hue < 0) return 1;
    return a.hue - b.hue;
  });
}

function sortItems(items) {
  const arr = items.slice();
  if (sortMode === 'hue') return sortByHue(arr);
  if (sortMode === 'light') return arr.sort((a, b) => b.lum - a.lum);
  if (sortMode === 'name') return arr.sort((a, b) => a.cn.localeCompare(b.cn, 'zh-Hans-CN'));
  return arr;
}

function cardHTML(it) {
  const on = chosen.some((c) => c.key === it.key);
  const txt = pickText(it.rgb);
  const lines = [];
  if (metaOn.rgb) lines.push(`RGB ${it.rgb.r} ${it.rgb.g} ${it.rgb.b}`);
  if (metaOn.cmyk) {
    const c = it.cmyk || it.cmykAuto;
    lines.push(`${it.cmyk ? '' : '≈ '}C${c[0]} M${c[1]} Y${c[2]} K${c[3]}`);
  }
  if (metaOn.pms) lines.push(it.pms || '无 PMS 标注');

  return `
  <div class="card${on ? ' on' : ''}" data-key="${it.key}" tabindex="0" role="button"
       aria-pressed="${on}" aria-label="${it.cn} ${it.hexUp}">
    <div class="sw" style="background:${it.hexUp};color:${txt}">
      <button class="copy" data-copy="${it.hexUp}" title="复制 ${it.hexUp}" aria-label="复制色值">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>
        </svg>
      </button>
      <span class="hx mono">${it.hexUp}</span>
      <span class="tick"></span>
    </div>
    <div class="cb">
      <div class="nm">${it.cn}</div>
      ${it.en ? `<div class="en">${it.en}</div>` : ''}
      <div class="meta">${lines.join('<br>')}</div>
    </div>
  </div>`;
}

function renderGroups() {
  GROUPS.forEach((g) => {
    const host = document.getElementById('group' + g.id);
    const items = sortItems(g.items);
    host.innerHTML = `
      <div class="sec-head" style="margin-bottom:14px;">
        <h2 style="font-size:14px;">${g.title}</h2>
        <span class="desc">${g.desc}</span>
      </div>
      <div class="grid">${items.map(cardHTML).join('')}</div>`;
  });
}

/* ---------------- 色相带 ---------------- */
function renderStrip() {
  const items = sortByHue(ALL);
  document.getElementById('strip').innerHTML = items
    .map((it) => {
      const on = chosen.some((c) => c.key === it.key);
      return `<div class="strip-seg${on ? ' on' : ''}" data-key="${it.key}"
      style="background:${it.hexUp}" title="${it.cn} ${it.hexUp}"></div>`;
    })
    .join('');
}

/* ---------------- 底部对比台 ---------------- */
function renderDock() {
  const chips = document.getElementById('chips');
  if (chosen.length === 0) {
    chips.innerHTML = '<span class="hint">点击色块加入对比（最多 4 个）</span>';
  } else {
    chips.innerHTML = chosen
      .map(
        (it) => `
      <button class="chip" data-remove="${it.key}" title="移出对比">
        <span class="dot" style="background:${it.hexUp}"></span>
        <span>${it.cn}</span>
        <span class="x">×</span>
      </button>`,
      )
      .join('');
  }
  const btn = document.getElementById('cmpBtn');
  btn.disabled = chosen.length < 2;
  btn.textContent = chosen.length < 2 ? '选择至少 2 色' : `对比这 ${chosen.length} 色`;

  if (!document.getElementById('panel').classList.contains('open')) return;
  if (chosen.length < 2) {
    closePanel();
    return;
  }
  renderPanel();
}

function badgeFor(ratio) {
  if (ratio >= 7) return `<span class="badge ok">AAA</span>`;
  if (ratio >= 4.5) return `<span class="badge ok">AA</span>`;
  if (ratio >= 3) return `<span class="badge warn">仅大字号</span>`;
  return `<span class="badge bad">不达标</span>`;
}

function renderPanel() {
  const white = { r: 255, g: 255, b: 255 },
    black = { r: 0, g: 0, b: 0 };

  const cards = chosen
    .map((it) => {
      const txt = pickText(it.rgb);
      const cw = contrast(it.rgb, white),
        cb = contrast(it.rgb, black);
      const best = Math.max(cw, cb);
      const cmyk = it.cmyk || it.cmykAuto;
      return `
    <div class="cmp-card">
      <div class="cmp-sw" style="background:${it.hexUp};color:${txt}">
        <div class="sample">Aa 汉字</div>
        <div class="h mono">${it.hexUp}</div>
      </div>
      <div class="cmp-info">
        <div class="cmp-name">${it.cn} ${badgeFor(best)}</div>
        <div class="row"><span>RGB</span><b>${it.rgb.r} ${it.rgb.g} ${it.rgb.b}</b></div>
        <div class="row"><span>CMYK${it.cmyk ? '' : ' ≈'}</span><b>${cmyk.join(' ')}</b></div>
        <div class="row"><span>PMS</span><b>${it.pms ? it.pms.replace('PMS ', '') : '—'}</b></div>
        <div class="row"><span>白字对比</span><b>${fmt(cw)} : 1</b></div>
        <div class="row"><span>黑字对比</span><b>${fmt(cb)} : 1</b></div>
      </div>
    </div>`;
    })
    .join('');

  const head = `<tr><th></th>${chosen
    .map((it) => `<th><span class="thdot" style="background:${it.hexUp}"></span>${it.cn}</th>`)
    .join('')}</tr>`;

  const rows = chosen
    .map((a, i) => {
      const tds = chosen
        .map((b, j) => {
          if (i === j) return `<td class="self">—</td>`;
          const cr = contrast(a.rgb, b.rgb);
          const de = deltaE(a.rgb, b.rgb);
          const cls = cr >= 4.5 ? 'c-ok' : cr >= 3 ? 'c-warn' : 'c-bad';
          return `<td><div class="v ${cls}">${cr.toFixed(1)}</div><div class="d">ΔE ${Math.round(de)}</div></td>`;
        })
        .join('');
      return `<tr><th>${a.cn}</th>${tds}</tr>`;
    })
    .join('');

  document.getElementById('panelInner').innerHTML = `
    <div class="panel-head">
      <b>对比结果 · ${chosen.length} 色</b>
      <span>对比度按 WCAG 2.1 相对亮度计算 · ΔE 为 CIE76 色差</span>
    </div>
    <div class="cmp-grid">${cards}</div>
    <div class="mx-title"><b>两两对比矩阵</b><span>主值 = 对比度（越大越易分辨）· 次值 = 色差 ΔE（越大差异越明显）</span></div>
    <div class="mx-wrap">
      <table class="mx"><thead>${head}</thead><tbody>${rows}</tbody></table>
    </div>`;
}

function openPanel() {
  document.getElementById('panel').classList.add('open');
  renderPanel();
  document.getElementById('cmpBtn').textContent = '收起对比';
}
function closePanel() {
  document.getElementById('panel').classList.remove('open');
  const btn = document.getElementById('cmpBtn');
  btn.disabled = chosen.length < 2;
  btn.textContent = chosen.length < 2 ? '选择至少 2 色' : `对比这 ${chosen.length} 色`;
}

/* ---------------- 交互 ---------------- */
function toggle(key) {
  const i = chosen.findIndex((c) => c.key === key);
  if (i >= 0) {
    chosen.splice(i, 1);
  } else {
    if (chosen.length >= 4) {
      toast('最多同时对比 4 个颜色');
      return;
    }
    const it = ALL.find((c) => c.key === key);
    if (it) chosen.push(it);
  }
  sync();
}

function sync() {
  document.querySelectorAll('.card').forEach((el) => {
    const on = chosen.some((c) => c.key === el.dataset.key);
    el.classList.toggle('on', on);
    el.setAttribute('aria-pressed', on);
  });
  document.querySelectorAll('.strip-seg').forEach((el) => {
    el.classList.toggle(
      'on',
      chosen.some((c) => c.key === el.dataset.key),
    );
  });
  renderDock();
}

document.addEventListener('click', (e) => {
  const copyBtn = e.target.closest('[data-copy]');
  if (copyBtn) {
    e.stopPropagation();
    copyText(copyBtn.dataset.copy);
    return;
  }
  const card = e.target.closest('.card');
  if (card) {
    toggle(card.dataset.key);
    return;
  }
  const seg = e.target.closest('.strip-seg');
  if (seg) {
    toggle(seg.dataset.key);
    return;
  }
  const rm = e.target.closest('[data-remove]');
  if (rm) {
    toggle(rm.dataset.remove);
    return;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePanel();
    return;
  }
  if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.classList.contains('card')) {
    e.preventDefault();
    toggle(document.activeElement.dataset.key);
  }
});

document.getElementById('sortSeg').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-sort]');
  if (!b) return;
  sortMode = b.dataset.sort;
  document.querySelectorAll('#sortSeg button').forEach((x) => x.classList.toggle('on', x === b));
  renderGroups();
  renderStrip();
  sync();
});

document.getElementById('metaSeg').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-meta]');
  if (!b) return;
  const k = b.dataset.meta;
  metaOn[k] = !metaOn[k];
  b.classList.toggle('on', metaOn[k]);
  renderGroups();
  sync();
});

document.getElementById('clearBtn').addEventListener('click', () => {
  chosen = [];
  closePanel();
  sync();
});

document.getElementById('cmpBtn').addEventListener('click', () => {
  const panel = document.getElementById('panel');
  if (panel.classList.contains('open')) closePanel();
  else openPanel();
});

/* ---------------- 复制 / 提示 ---------------- */
function copyText(text) {
  const done = () => toast('已复制 ' + text);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(done)
      .catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    cb();
  } catch (err) {
    toast('复制失败，请手动选择');
  }
  document.body.removeChild(ta);
}
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1500);
}

/* ---------------- 初始化 ---------------- */
renderGroups();
renderStrip();
renderDock();
