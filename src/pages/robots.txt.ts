import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/site';

// 随部署域名生成，避免硬编码的 sitemap 地址与 SITE_URL、DEPLOY_BASE 不一致。
export const GET: APIRoute = () => {
  // 作品快照放在前缀下的 works/ 里，跟站点自身页面区分开。
  const works = `${import.meta.env.BASE_URL}works/`;
  const body = [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${works}`,
    '',
    `Sitemap: ${absoluteUrl('sitemap-index.xml')}`,
    '',
  ].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
