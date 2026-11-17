import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// 校验 dist 内所有内部链接与资源引用都能落到真实文件，可选传入部署子目录。
const root = resolve('dist');
const base = (process.argv[2] || '').replace(/\/$/, '');
const origin = 'https://archive.test';
const attribute = /(?:href|src)="([^"]+)"/g;
const cssUrl = /url\(['"]?([^)'"\s]+)['"]?\)/g;

const files = await readdir(root, { recursive: true });
const pages = files.filter((file) => /\.(html|css)$/.test(file));
let checked = 0;

// data: URI 会自带 `url(%23id)` 这类内部引用，它们不是链接，先算出它们的区间并跳过。
const dataRanges = (content) => {
  const ranges = [];
  for (const hit of content.matchAll(/data:/g)) {
    const close = content.indexOf(')', hit.index);
    ranges.push([hit.index, close === -1 ? content.length : close]);
  }
  return ranges;
};

for (const file of pages) {
  const content = await readFile(join(root, file), 'utf8');
  const page = new URL(`${base}/${file.replaceAll('\\', '/')}`, origin);
  const ranges = dataRanges(content);
  const inDataUri = (index) => ranges.some(([from, to]) => index >= from && index < to);
  const references = [...content.matchAll(file.endsWith('.html') ? attribute : cssUrl)].filter(
    (match) => !inDataUri(match.index),
  );

  for (const reference of references.map((match) => match[1])) {
    if (/^(?:[a-z]+:)?\/\//i.test(reference) || reference.startsWith('#')) continue;
    const url = new URL(reference, page);
    if (url.origin !== page.origin) continue;
    assert.ok(url.pathname.startsWith(`${base}/`), `越出部署根目录：${reference}（${file}）`);
    const target = decodeURIComponent(url.pathname.slice(base.length + 1)) || 'index.html';
    const resolved = target.endsWith('/') ? join(root, target, 'index.html') : join(root, target);
    const exists = await stat(resolved).then(
      () => true,
      () => false,
    );
    assert.ok(exists, `链接失效：${reference}（${file}）`);
    checked += 1;
  }
}

console.log(`PASS: ${checked} 条内部链接与资源（${base || '根目录'}）`);
