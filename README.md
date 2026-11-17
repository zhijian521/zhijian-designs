# 知简设计集

博客、网站与工具的界面存档。Astro + TypeScript 静态站，每份作品是独立 HTML/CSS/JS，用 iframe 隔离预览。

首页每批 12 份，滚到底部自动加载，失败可重试；无脚本时「加载更多」链接照常翻页。详情预览支持设备宽度、50%–150% 缩放与全屏。

## 开始

Node.js 22.23.4+。

```sh
npm install
npm run dev
```

| 命令              | 作用                                 |
| ----------------- | ------------------------------------ |
| `npm run build`   | 重建字体子集、检查类型，输出 `dist/` |
| `npm run verify`  | 格式 → 构建 → 链接校验，提交前跑这个 |
| `npm test`        | 新增脚本的生成与防覆盖行为           |
| `npm run preview` | 预览构建结果                         |

CI 在推送与 PR 时执行同一套检查。

## 新增设计

```sh
npm run new:design -- my-blog-v1
```

编号小写字母开头，只用小写字母、数字、短横线，以 `-v1`、`-v2` 结尾，不覆盖已有作品。然后编辑 `src/content/designs/my-blog-v1.md`、在 `public/designs/my-blog-v1/` 实现页面、把真实界面存为 `assets/cover.*`、登记来源仓库与 commit。重新设计新增版本，保留旧版。

档案字段见 `src/content.config.ts`（`title`、`description`、`category`、`tags`、`date`、`version`、`cover`、`preview`、`colors`，可选 `source`、`commit`）。路径从 `public/` 开始不加前导 `/`，作品内部资源用 `./assets/...` 等相对路径。

```yaml
---
title: 我的博客
description: 一句话介绍。
category: 博客 # 博客 / 网站 / 工具
tags: [浅色, 极简]
date: '2026-11-17'
version: v1
cover: designs/my-blog-v1/assets/cover.svg
preview: designs/my-blog-v1/index.html
colors: ['#F6F3EC', '#292D28']
---
```

当前收录三份：语无边 · 个人博客（`simple-blog-v1`，来自 [simple-blog](https://github.com/zhijian521/simple-blog) 的固定提交）、色彩对比工作台（`color-compare-v1`）与梦幻助手 · 设计语言（`mh-toolbox-v1`，来自 [mh-toolbox-rs](https://github.com/zhijian521/mh-toolbox-rs) 的固定提交）。

## 结构

```text
src/content/designs/   作品信息与说明
src/pages/             首页、详情、404、robots
src/components/        卡片与预览容器
src/styles/            展示站样式
public/designs/<id>/   独立作品页面与资源
public/brand/          书法标识与分享卡
assets/                不进构建的源资源（全量字体、备用标识）
templates/design/      新作品模板
scripts/               新增脚本、字体子集、链接校验
```

作品样式与交互独立，iframe 保证隔离，代码以可信自有代码为前提。复杂 React / Vue 作品可独立构建后放入对应目录；归档保留公开内容，私有数据用模拟数据替换，并带上图片、字体、代码的授权说明。

## 字体

展示站与模板使用资源圆体子集 `MHRounded.woff2`（SIL OFL 1.1，许可见 `public/fonts/`），经 `--font-ui` 应用。`npm run subset:font` 扫描 `src/`、`templates/` 与显式引用 `rounded.css` 的作品页，从 `assets/fonts/MHRounded.full.woff2` 裁出子集；改文案后重跑即可，缺字回退系统字体。真实案例保留原设计字体，随作品保存；自带字体的作品由 `scripts/subset-design-font.mjs` 单独裁剪，不进站点共享子集。

## 部署

默认 `https://designs.yuwb.dev`，根域名部署无需环境变量，产物在 `dist/`。`SITE_URL` 决定 canonical、分享卡片、`sitemap-index.xml` 与 `robots.txt` 的绝对地址；子目录部署同时设 `DEPLOY_BASE`：

```powershell
$env:DEPLOY_BASE='/zhijian-designs/'
$env:SITE_URL='https://zhijian521.github.io'
npm run build
npm run check:links -- /zhijian-designs/
```

存档作品（`/designs/`）不进入索引，各自保留独立页面。分享卡 `public/brand/og.png` 是静态图，改动站点标识或描述后需重新生成。
