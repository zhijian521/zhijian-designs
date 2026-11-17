/* 色彩档案 · 数据、色彩度量与交互 */
const GROUPS = [
  {
    id: 'A',
    title: '陶溪川色系',
    desc: '16 色 · 仅提供 HEX',
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
    title: '品牌专色',
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

/* ---------------- 色彩度量 ---------------- */
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};

const relLum = ({ r, g, b }) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contrast = (a, b) => {
  const la = relLum(a);
  const lb = relLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const rgbToCmyk = ({ r, g, b }) => {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const k = 1 - Math.max(R, G, B);
  if (k >= 0.9999) return [0, 0, 0, 100];
  return [
    Math.round(((1 - R - k) / (1 - k)) * 100),
    Math.round(((1 - G - k) / (1 - k)) * 100),
    Math.round(((1 - B - k) / (1 - k)) * 100),
    Math.round(k * 100),
  ];
};

const rgbToLab = ({ r, g, b }) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = f(r);
  const G = f(g);
  const B = f(b);
  let X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  let Y = (R * 0.2126729 + G * 0.7151522 + B * 0.072175) / 1;
  let Z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883;
  const gm = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  X = gm(X);
  Y = gm(Y);
  Z = gm(Z);
  return { L: 116 * Y - 16, a: 500 * (X - Y), b: 200 * (Y - Z) };
};

const deltaE = (c1, c2) => {
  const A = rgbToLab(c1);
  const B = rgbToLab(c2);
  return Math.hypot(A.L - B.L, A.a - B.a, A.b - B.b);
};

const pickText = (rgb) =>
  contrast(rgb, { r: 255, g: 255, b: 255 }) >= contrast(rgb, { r: 17, g: 17, b: 17 })
    ? '#FFFFFF'
    : '#14120F';

const hueKey = (rgb) => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d < 0.06) return -1;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
};

const fmt = (n) => Math.round(n * 10) / 10;
const hexUp = (h) => '#' + h.replace('#', '').toUpperCase();

/* ---------------- 预处理 ---------------- */
for (const group of GROUPS) {
  for (const item of group.items) {
    item.key = group.id + '|' + item.cn;
    item.rgb = hexToRgb(item.hex);
    item.hexUp = hexUp(item.hex);
    item.cmykAuto = rgbToCmyk(item.rgb);
    item.lum = relLum(item.rgb);
    item.hue = hueKey(item.rgb);
  }
}
const ALL = GROUPS.flatMap((g) => g.items);

/* ---------------- 状态 ---------------- */
let chosen = [];
let sortMode = 'default';
const metaOn = { rgb: true, cmyk: false, pms: false };

const el = (id) => document.getElementById(id);

/* ---------------- 顶部色带 ---------------- */
el('skyline').innerHTML = ALL.map((it) => `<span style="background:${it.hexUp}"></span>`).join('');

/* ---------------- 色卡 ---------------- */
const sortByHue = (items) =>
  items.slice().sort((a, b) => {
    if (a.hue < 0 && b.hue < 0) return a.lum - b.lum;
    if (a.hue < 0) return -1;
    if (b.hue < 0) return 1;
    return a.hue - b.hue;
  });

function sortItems(items) {
  const arr = items.slice();
  if (sortMode === 'hue') return sortByHue(arr);
  if (sortMode === 'light') return arr.sort((a, b) => b.lum - a.lum);
  if (sortMode === 'name') return arr.sort((a, b) => a.cn.localeCompare(b.cn, 'zh-Hans-CN'));
  return arr;
}

function cardMarkup(it) {
  const on = chosen.some((c) => c.key === it.key);
  const txt = pickText(it.rgb);
  const lines = [];
  if (metaOn.rgb) lines.push(`RGB ${it.rgb.r} ${it.rgb.g} ${it.rgb.b}`);
  if (metaOn.cmyk) {
    const c = it.cmyk || it.cmykAuto;
    lines.push(`${it.cmyk ? '' : '约 '}C${c[0]} M${c[1]} Y${c[2]} K${c[3]}`);
  }
  if (metaOn.pms) lines.push(it.pms ? it.pms : '无 PMS 标注');

  return `
  <div class="card${on ? ' on' : ''}" data-key="${it.key}">
    <button type="button" class="card-hit" aria-pressed="${on}"
            aria-label="${it.cn} ${it.hexUp}，加入或移出对比">
      <span class="card-chip" style="background:${it.hexUp};color:${txt}">
        <span class="hx mono">${it.hexUp}</span>
        <span class="card-mark" aria-hidden="true"></span>
      </span>
      <span class="card-body">
        <span class="card-name">${it.cn}</span>
        ${it.en ? `<span class="card-en">${it.en}</span>` : ''}
        <span class="card-meta mono">${lines.join('<br>')}</span>
      </span>
    </button>
    <button type="button" class="card-copy" data-copy="${it.hexUp}"
            title="复制 ${it.hexUp}" aria-label="复制色值 ${it.hexUp}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>
      </svg>
    </button>
  </div>`;
}

function renderGroups() {
  for (const group of GROUPS) {
    const host = el('group' + group.id);
    host.innerHTML = sortItems(group.items).map(cardMarkup).join('');
  }
}

/* ---------------- 色相带 ---------------- */
function renderStrip() {
  el('strip').innerHTML = sortByHue(ALL)
    .map((it) => {
      const on = chosen.some((c) => c.key === it.key);
      return `<button type="button" class="strip-seg" data-key="${it.key}"
        aria-pressed="${on}" title="${it.cn} ${it.hexUp}"
        aria-label="${it.cn} ${it.hexUp}" style="background:${it.hexUp}"></button>`;
    })
    .join('');
}

/* ---------------- 对比栏 ---------------- */
function renderTray() {
  const chips = el('chips');
  chips.innerHTML =
    chosen.length === 0
      ? '<span class="tray-hint">点击色块加入对比（最多 4 个）</span>'
      : chosen
          .map(
            (it) => `
      <button type="button" class="chip" data-remove="${it.key}" title="移出对比">
        <span class="chip-dot" style="background:${it.hexUp}"></span>
        <span>${it.cn}</span>
        <span class="chip-x" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg></span>
      </button>`,
          )
          .join('');

  const btn = el('cmpBtn');
  const open = el('panel').classList.contains('open');
  btn.disabled = chosen.length < 2;
  if (open) {
    btn.textContent = chosen.length < 2 ? '选择至少 2 色' : '收起对比';
  } else {
    btn.textContent = chosen.length < 2 ? '选择至少 2 色' : `对比这 ${chosen.length} 色`;
  }

  if (!open) return;
  if (chosen.length < 2) {
    closePanel();
    return;
  }
  renderPanel();
}

/* ---------------- 对比面板 ---------------- */
function gradeOf(ratio) {
  if (ratio >= 7) return { label: 'AAA', cls: 'ok' };
  if (ratio >= 4.5) return { label: 'AA', cls: 'ok' };
  if (ratio >= 3) return { label: '大字号', cls: 'warn' };
  return { label: '不可用', cls: 'bad' };
}

function renderPanel() {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  const cards = chosen
    .map((it) => {
      const txt = pickText(it.rgb);
      const cw = contrast(it.rgb, white);
      const cb = contrast(it.rgb, black);
      const useWhite = cw >= cb;
      const g = gradeOf(useWhite ? cw : cb);
      const cmyk = it.cmyk || it.cmykAuto;
      return `
    <div class="cmp-card">
      <div class="cmp-sw" style="background:${it.hexUp};color:${txt}">
        <div class="cmp-sample">Aa 色彩</div>
        <div class="cmp-hex">${it.hexUp}</div>
      </div>
      <div class="cmp-info">
        <div class="cmp-name">
          ${it.cn}
          <span class="badge ${g.cls}">${useWhite ? '白字' : '黑字'} ${g.label}</span>
        </div>
        <div class="row"><span>RGB</span><b>${it.rgb.r} ${it.rgb.g} ${it.rgb.b}</b></div>
        <div class="row"><span>CMYK${it.cmyk ? '' : ' 约'}</span><b>${cmyk.join(' ')}</b></div>
        <div class="row"><span>PMS</span><b>${it.pms ? it.pms.replace('PMS ', '') : '无'}</b></div>
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
          if (i === j) return '<td class="self">—</td>';
          const cr = contrast(a.rgb, b.rgb);
          const de = deltaE(a.rgb, b.rgb);
          const cls = cr >= 4.5 ? 'c-ok' : cr >= 3 ? 'c-warn' : 'c-bad';
          return `<td><div class="v ${cls}">${cr.toFixed(1)}</div><div class="d">色差 ${Math.round(de)}</div></td>`;
        })
        .join('');
      return `<tr><th>${a.cn}</th>${tds}</tr>`;
    })
    .join('');

  el('panelInner').innerHTML = `
    <div class="panel-head">
      <b>对比结果 · ${chosen.length} 色</b>
      <span>对比度按 WCAG 2.1 相对亮度计算 · 色差为 CIE76 公式</span>
    </div>
    <div class="cmp-grid">${cards}</div>
    <div class="mx-title">
      <b>两两对比矩阵</b>
      <span>主值为对比度，次值为 CIE76 色差</span>
    </div>
    <div class="mx-wrap">
      <table class="mx"><thead>${head}</thead><tbody>${rows}</tbody></table>
    </div>`;
}

function openPanel() {
  el('panel').classList.add('open');
  renderPanel();
  el('cmpBtn').textContent = '收起对比';
}

function closePanel() {
  el('panel').classList.remove('open');
  const btn = el('cmpBtn');
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
  document.querySelectorAll('.card').forEach((node) => {
    const on = chosen.some((c) => c.key === node.dataset.key);
    node.classList.toggle('on', on);
    const hit = node.querySelector('.card-hit');
    if (hit) hit.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('.strip-seg').forEach((node) => {
    node.setAttribute('aria-pressed', String(chosen.some((c) => c.key === node.dataset.key)));
  });
  renderTray();
}

document.addEventListener('click', (event) => {
  const copyBtn = event.target.closest('[data-copy]');
  if (copyBtn) {
    event.stopPropagation();
    copyText(copyBtn.dataset.copy);
    return;
  }
  const hit = event.target.closest('.card-hit');
  if (hit) {
    toggle(hit.closest('.card').dataset.key);
    return;
  }
  const seg = event.target.closest('.strip-seg');
  if (seg) {
    toggle(seg.dataset.key);
    return;
  }
  const remove = event.target.closest('[data-remove]');
  if (remove) toggle(remove.dataset.remove);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closePanel();
    return;
  }
  // Enter / Space 由原生 button 触发 click，无需额外处理
});

el('sortSeg').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-sort]');
  if (!button) return;
  sortMode = button.dataset.sort;
  document.querySelectorAll('#sortSeg button').forEach((node) => {
    const active = node === button;
    node.classList.toggle('on', active);
    node.setAttribute('aria-pressed', String(active));
  });
  renderGroups();
  renderStrip();
  sync();
});

el('metaSeg').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-meta]');
  if (!button) return;
  const key = button.dataset.meta;
  metaOn[key] = !metaOn[key];
  button.classList.toggle('on', metaOn[key]);
  button.setAttribute('aria-pressed', String(metaOn[key]));
  renderGroups();
  sync();
});

el('clearBtn').addEventListener('click', () => {
  chosen = [];
  closePanel();
  sync();
});

el('cmpBtn').addEventListener('click', () => {
  if (el('panel').classList.contains('open')) closePanel();
  else openPanel();
});

/* ---------------- 复制与提示 ---------------- */
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

function fallbackCopy(text, done) {
  const area = document.createElement('textarea');
  area.value = text;
  area.style.cssText = 'position:fixed;top:-9999px;opacity:0;';
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand('copy');
    done();
  } catch (error) {
    toast('复制失败，请手动选择');
  }
  document.body.removeChild(area);
}

let toastTimer = null;
function toast(message) {
  const node = el('toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 1500);
}

/* ---------------- 初始化 ---------------- */
renderGroups();
renderStrip();
renderTray();
