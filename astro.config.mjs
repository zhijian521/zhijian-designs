import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// 正式部署在根域名 designs.yuwb.dev；改用仓库子目录时可设
// SITE_URL=https://zhijian521.github.io DEPLOY_BASE=/zhijian-designs/
const site = process.env.SITE_URL || 'https://designs.yuwb.dev';

export default defineConfig({
  site,
  output: 'static',
  base: process.env.DEPLOY_BASE || '/',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      // 存档作品是独立快照，不参与展示站索引。
      filter: (page) => !page.includes('/designs/'),
    }),
  ],
});
