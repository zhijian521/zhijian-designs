/*
 * 主题切换、调色板读数与字号缩放。
 * 界面本身是静态的；这里只做三件事：改 <html> 上的 data 属性、按当前主题把
 * 变量算成色值填进调色板、把六套主题各自的配色渲染成卡片预览。
 */

const STYLES = [
  { key: 'ledger', name: '账簿', note: '宣纸米白 · 朱红作印' },
  { key: 'celadon', name: '青瓷', note: '冷绿灰白 · 苔色作主' },
  { key: 'azure', name: '霁蓝', note: '雨后青蓝 · 沉静克制' },
  { key: 'crystal', name: '水晶', note: '清透水光 · 冷冽明亮' },
  { key: 'dunhuang', name: '敦煌岩彩', note: '矿物暖褐 · 三重描边' },
  { key: 'rosewood', name: '紫檀书斋', note: '木纹暖红 · 书斋气息' },
];

const SCHEMES = [
  { key: 'light', name: '纸面' },
  { key: 'dark', name: '墨夜' },
];

const SCALES = [
  { key: '0.9', name: '较小' },
  { key: '1', name: '默认' },
  { key: '1.15', name: '较大' },
];

const SWATCHES = [
  { token: '--bg', name: '桌面', use: '页面底色，退在纸后面' },
  { token: '--paper-2', name: '纸二', use: '内容卡的纸面' },
  { token: '--paper', name: '纸白', use: '浮层与正文底' },
  { token: '--well', name: '凹槽', use: '输入格与数字格的底' },
  { token: '--ink', name: '墨', use: '正文与标题' },
  { token: '--ink-2', name: '淡墨', use: '名目与说明' },
  { token: '--rule-2', name: '分割线', use: '说得清边界的那根线' },
  { token: '--ochre', name: '赭', use: '所有读数与金额' },
  { token: '--accent', name: '朱红', use: '区块标、选中、支出' },
  { token: '--moss', name: '苔', use: '正收益与已达成' },
  { token: '--muted', name: '灰褐', use: '元信息与小字' },
  { token: '--indigo', name: '靛', use: '悬停说明的底' },
];

const root = document.documentElement;
const el = (id) => document.getElementById(id);

/* ---------------- 控制坞 ---------------- */
function pill(text, pressed, onPick, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'bevel-pill' + (pressed ? ' on' : '');
  button.textContent = text;
  button.setAttribute('aria-pressed', String(pressed));
  if (label) button.setAttribute('aria-label', label);
  button.addEventListener('click', onPick);
  return button;
}

function renderControls() {
  const styleHost = el('styleGroup');
  const schemeHost = el('schemeGroup');
  const scaleHost = el('scaleGroup');

  for (const item of STYLES) {
    styleHost.append(
      pill(
        item.name,
        root.dataset.style === item.key,
        () => setStyle(item.key),
        '切换到' + item.name + '主题',
      ),
    );
  }
  for (const item of SCHEMES) {
    schemeHost.append(pill(item.name, root.dataset.scheme === item.key, () => setScheme(item.key)));
  }
  for (const item of SCALES) {
    scaleHost.append(
      pill(item.key === '1' ? item.name : item.name, root.dataset.scale === item.key, () =>
        setScale(item.key),
      ),
    );
  }
}

function syncPressed(host, active) {
  for (const button of host.querySelectorAll('.bevel-pill')) {
    const on = button.textContent === active;
    button.classList.toggle('on', on);
    button.setAttribute('aria-pressed', String(on));
  }
}

let activeStyle = 'ledger';
function setStyle(key) {
  activeStyle = key;
  root.dataset.style = key;
  syncPressed(el('styleGroup'), STYLES.find((s) => s.key === key).name);
  paintSwatches();
  syncThemeCards();
}

function setScheme(key) {
  root.dataset.scheme = key;
  syncPressed(el('schemeGroup'), SCHEMES.find((s) => s.key === key).name);
  paintSwatches();
}

function setScale(key) {
  root.dataset.scale = key;
  root.style.setProperty('--fs-scale', key);
  syncPressed(el('scaleGroup'), SCALES.find((s) => s.key === key).name);
}

/* ---------------- 调色板 ---------------- */
function paintSwatches() {
  const host = el('swatches');
  host.textContent = '';
  // 读数要显示「当前主题当前明暗」下的真实色值，所以先读一遍计算值。
  const computed = getComputedStyle(root);
  for (const item of SWATCHES) {
    const raw = computed.getPropertyValue(item.token).trim();
    const probe = document.createElement('span');
    probe.style.color = 'var(' + item.token + ')';
    document.body.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();

    const li = document.createElement('li');
    li.className = 'swatch';

    const chip = document.createElement('span');
    chip.className = 'swatch-chip';
    chip.style.background = 'var(' + item.token + ')';
    chip.setAttribute('aria-hidden', 'true');

    const body = document.createElement('span');
    body.className = 'swatch-body';
    const title = document.createElement('b');
    title.textContent = item.name;
    const token = document.createElement('span');
    token.textContent = item.token.replace('--', '');
    const value = document.createElement('span');
    value.textContent = resolved;
    const use = document.createElement('span');
    use.textContent = item.use;

    body.append(title, token, value, use);
    li.append(chip, body);
    host.append(li);
  }
}

/* ---------------- 主题卡 ---------------- */
let themeCards = [];
function renderThemeCards() {
  const host = el('themeGrid');
  for (const item of STYLES) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'theme-card';
    card.dataset.theme = item.key;
    card.setAttribute('aria-pressed', String(item.key === activeStyle));
    card.setAttribute('aria-label', '切换到' + item.name + '主题：' + item.note);

    const preview = document.createElement('span');
    preview.className = 'theme-preview';
    preview.dataset.style = item.key;
    preview.innerHTML =
      '<span class="tp-bar"><span class="tp-dot"></span><span class="tp-line w60"></span></span>' +
      '<span class="tp-panel">' +
      '<span class="tp-row"><span class="tp-name"></span><span class="tp-slot"></span></span>' +
      '<span class="tp-row"><span class="tp-name"></span><span class="tp-slot"></span></span>' +
      '<span class="tp-row"><span class="tp-name"></span><span class="tp-seal"></span></span>' +
      '</span>';

    const body = document.createElement('span');
    body.className = 'theme-body';
    const name = document.createElement('b');
    name.textContent = item.name;
    const note = document.createElement('span');
    note.textContent = item.note;
    body.append(name, note);

    const strips = document.createElement('span');
    strips.className = 'theme-swatches';
    for (const token of ['--accent', '--ochre', '--moss', '--well', '--paper-2', '--ink']) {
      const strip = document.createElement('span');
      strip.style.flex = '1';
      strip.style.background = 'var(' + token + ')';
      // 让每个色条读的是预览块自己的主题，而不是整页的主题。
      strip.dataset.style = item.key;
      strips.append(strip);
    }

    card.append(preview, body, strips);
    card.addEventListener('click', () => {
      setStyle(item.key);
      document.querySelector('.control-dock')?.scrollIntoView({ block: 'nearest' });
    });
    host.append(card);
    themeCards.push(card);
  }
}

function syncThemeCards() {
  for (const card of themeCards) {
    card.setAttribute('aria-pressed', String(card.dataset.theme === activeStyle));
  }
}

/* ---------------- 启动 ---------------- */
const prefersDark =
  typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
root.dataset.scheme = prefersDark ? 'dark' : 'light';
root.dataset.scale = '1';

renderControls();
paintSwatches();
renderThemeCards();
