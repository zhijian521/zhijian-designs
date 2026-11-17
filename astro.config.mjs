import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  // GitHub Pages 子目录部署时，设置 DEPLOY_BASE=/zhijian-designs/。
  base: process.env.DEPLOY_BASE || '/',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
