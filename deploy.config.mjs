// 部署地址集中在这里，构建与链接校验共用同一份，避免两处各写一个前缀。
// 站点挂在 yuwb.dev/designs/ 下；换域名或改回根目录只动这里或对应环境变量。
const site = process.env.SITE_URL || 'https://yuwb.dev';
const base = process.env.DEPLOY_BASE || '/designs/';

export default { site, base };
