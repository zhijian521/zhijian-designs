import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import deploy from './deploy.config.mjs';

// 站点部署在 https://yuwb.dev/designs/。域名与前缀见 deploy.config.mjs，
// 也可用 SITE_URL、DEPLOY_BASE 覆盖（例如本地想跑在根目录就设 DEPLOY_BASE=/）。
export default defineConfig({
  site: deploy.site,
  base: deploy.base,
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      // 存档作品是独立快照，不参与展示站索引。
      filter: (page) => !page.includes('/works/'),
    }),
  ],
});
