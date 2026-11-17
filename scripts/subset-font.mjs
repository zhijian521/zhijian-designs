import subsetFont from 'subset-font';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// 展示站 UI、作品档案与新建模板里出现的字形，全部打进子集；
// 子集外的字符由 rounded.css 的字族回退兜底。
const root = resolve(import.meta.dirname, '..');
const source = join(root, 'assets/fonts/MHRounded.full.woff2');
const target = join(root, 'public/fonts/MHRounded.woff2');
const scanRoots = ['src', 'templates'];

// 作品页也会用到共享圆体，但只有显式引用了 rounded.css 的那几份才扫；
// 其余作品用自己的字族，不该把它们的文案也算进子集。
const designRoot = 'public/designs';
for (const entry of await readdir(join(root, designRoot), { withFileTypes: true }).catch(
  () => [],
)) {
  if (!entry.isDirectory()) continue;
  const relative = `${designRoot}/${entry.name}`;
  const page = await readFile(join(root, relative, 'index.html'), 'utf8').catch(() => '');
  if (page.includes('fonts/rounded.css')) scanRoots.push(relative);
}
const scanExtension = /\.(astro|ts|mjs|css|md|html|js)$/;

// 常用标点与符号始终保留，避免正文临时出现的符号掉字体。
const baseline = Array.from({ length: 95 }, (_, index) => String.fromCharCode(32 + index)).join('');

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (scanExtension.test(entry.name)) yield path;
  }
}

const characters = new Set(baseline + '·—–…“”‘’《》〈〉【】「」『』、。，！？：；（）％–—°');
for (const directory of scanRoots) {
  for await (const file of walk(join(root, directory))) {
    for (const character of await readFile(file, 'utf8')) characters.add(character);
  }
}

const buffer = await subsetFont(await readFile(source), [...characters].join(''), {
  targetFormat: 'woff2',
});
await writeFile(target, buffer);
const [before, after] = await Promise.all([stat(source), stat(target)]);
console.log(
  `字体子集：${(before.size / 1024).toFixed(0)}KB → ${(after.size / 1024).toFixed(0)}KB（${characters.size} 个字符）`,
);
