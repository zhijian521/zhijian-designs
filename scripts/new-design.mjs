import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const id = process.argv[2];
if (process.argv.length !== 3 || !id || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*-v[1-9]\d*$/.test(id)) {
  console.error(
    '用法：npm run new:design -- my-blog-v1\n编号使用小写字母、数字和短横线，并以 -v1 等版本号结尾。',
  );
  process.exit(1);
}

const contentPath = join(root, 'src/content/designs', `${id}.md`);
const designPath = join(root, 'public/works', id);
for (const target of [contentPath, designPath]) {
  try {
    await access(target);
    console.error(`已存在，未覆盖：${target}`);
    process.exit(1);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
const version = id.match(/v\d+$/)[0];
const metadata = `---
title: ${id}
description: 在这里写下这套设计的介绍。
category: 网站
tags: [浅色]
date: '${date}'
version: ${version}
cover: works/${id}/assets/cover.svg
preview: works/${id}/index.html
colors: ['#F6F3EC', '#292D28', '#AD4A35']
# source: https://github.com/your-name/your-project
# commit: 原始提交的完整哈希
---

## 设计想法

记录配色、字体、布局和你想保留的细节。

## 还原范围

说明已经实现的页面、交互和使用的模拟数据。

## 资源说明

记录图片、字体的来源与使用许可，并用真实界面替换封面。
`;

await mkdir(dirname(designPath), { recursive: true });
await mkdir(designPath);
await mkdir(join(designPath, 'assets'));
for (const name of ['index.html', 'styles.css', 'assets/cover.svg']) {
  const template = await readFile(join(root, 'templates/design', name), 'utf8');
  await writeFile(join(designPath, name), template.replaceAll('__DESIGN_ID__', id), { flag: 'wx' });
}
await mkdir(dirname(contentPath), { recursive: true });
await writeFile(contentPath, metadata, { flag: 'wx' });
console.log(
  `已创建 ${id}\n作品说明：src/content/designs/${id}.md\n独立页面：public/works/${id}/index.html\n下一步：替换内容与封面，运行 npm run dev 查看。`,
);
