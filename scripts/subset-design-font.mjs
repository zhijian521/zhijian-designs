import subsetFont from 'subset-font';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// 作品页可以自带字体。这类字体只服务它自己的目录，不进站点共享子集，
// 所以逐个作品声明：源文件在 assets/fonts/，产物留在作品目录里。
const root = resolve(import.meta.dirname, '..');
const targets = [
  {
    // 梦幻助手设计语言页用霞鹜文楷，站点圆体不参与。
    design: 'public/designs/mh-toolbox-v1',
    source: 'assets/fonts/LXGWWenKaiScreen.woff2',
    target: 'public/designs/mh-toolbox-v1/assets/wenkai.woff2',
    // 该字体已含 GB2312 全集，只按页面实际用字裁，避免整包 1.75MB 进 dist。
    baseline: '',
  },
];
const scanExtension = /\.(astro|ts|mjs|css|md|html|js|json)$/;

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (scanExtension.test(entry.name)) yield path;
  }
}

for (const target of targets) {
  const characters = new Set(
    Array.from({ length: 95 }, (_, index) => String.fromCharCode(32 + index)).join('') +
      '·—–…“”‘’《》〈〉【】「」『』、。，！？：；（）％' +
      target.baseline,
  );
  for await (const file of walk(join(root, target.design))) {
    for (const character of await readFile(file, 'utf8')) characters.add(character);
  }
  const buffer = await subsetFont(
    await readFile(join(root, target.source)),
    [...characters].join(''),
    {
      targetFormat: 'woff2',
    },
  );
  await writeFile(join(root, target.target), buffer);
  const [before, after] = await Promise.all([
    stat(join(root, target.source)),
    stat(join(root, target.target)),
  ]);
  console.log(
    `作品字体子集：${(before.size / 1024 / 1024).toFixed(2)}MB → ${(after.size / 1024).toFixed(0)}KB（${characters.size} 个字符 · ${target.design.split('/').pop()}）`,
  );
}
