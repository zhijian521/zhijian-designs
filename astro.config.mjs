import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// GitHub Pages 子目录部署：SITE_URL=https://<user>.github.io DEPLOY_BASE=/zhijian-designs/
const site = process.env.SITE_URL || 'https://zhijian521.github.io';

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
