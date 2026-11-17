import { withBase } from './paths';

const site = import.meta.env.SITE.replace(/\/$/, '');

// 展示站内所有页面共用的绝对地址前缀（含 base）。
export const baseUrl = `${site}${import.meta.env.BASE_URL.replace(/\/$/, '')}`;

export function absoluteUrl(path = '') {
  return `${baseUrl}/${path.replace(/^\//, '')}`;
}

export const siteName = '知简设计集';
export const siteDescription = '博客、网站与工具的界面存档。';

export { withBase };
