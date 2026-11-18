# 知简设计集

博客、网站与工具的界面存档。Astro + TypeScript 静态站，每份作品是独立 HTML/CSS/JS，用 iframe 隔离预览。

首页是一座沉浸式 3D 画廊：拱形背景、地面透视线、光线与悬浮画框构成空间，侧框保持适度倾斜并展示封面；中央独立嵌入真实 HTML 页面，停稳后没有透视、缩放或滤镜，以原生分辨率显示文字。支持拖动、滚轮、方向键、两侧画框与底部索引切换作品；点击中央画框或「走近作品」可展开全尺寸交互预览，Esc 返回展厅。默认墨夜，另有宣纸、青瓷、白盒外观，选择保存在本地。作品超过 12 份后，可「继续翻阅」进入列表页。详情页预览支持设备宽度、50%–150% 缩放与全屏。

画框共用连续的 3D 运动轨迹，连点、反向切换与拖动松手都会延续当前位置和速度。移动期间保留封面，停稳后只加载最终选中的真实页面并淡入；支持触控板小幅滚动与减少动态效果偏好。

## 开始

Node.js 22.23.4+。

```sh
npm install
npm run dev
```

本地地址是 `http://localhost:4321/designs/`，前缀来自 `deploy.config.mjs` 的 `base`，与线上一致。

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

编号小写字母开头，只用小写字母、数字、短横线，以 `-v1`、`-v2` 结尾，不覆盖已有作品。然后编辑 `src/content/designs/my-blog-v1.md`、在 `public/works/my-blog-v1/` 实现页面、把真实界面存为 `assets/cover.*`、登记来源仓库与 commit。重新设计新增版本，保留旧版。

档案字段见 `src/content.config.ts`（`title`、`description`、`category`、`tags`、`date`、`version`、`cover`、`preview`、`colors`，可选 `source`、`commit`）。路径从 `public/` 开始不加前导 `/`，作品内部资源用 `./assets/...` 等相对路径。

```yaml
---
title: 我的博客
description: 一句话介绍。
category: 博客 # 博客 / 网站 / 工具
tags: [浅色, 极简]
date: '2026-11-17'
version: v1
cover: works/my-blog-v1/assets/cover.svg
preview: works/my-blog-v1/index.html
colors: ['#F6F3EC', '#292D28']
---
```

当前收录五份：语无边 · 个人博客（`simple-blog-v1`，来自 [simple-blog](https://github.com/zhijian521/simple-blog) 的固定提交）、色彩对比工作台（`color-compare-v1`）、梦幻助手 · 设计语言（`mh-toolbox-v1`，来自 [mh-toolbox-rs](https://github.com/zhijian521/mh-toolbox-rs) 的固定提交）、知简 · 博客设计语言（`zhijian-home-v1`，来自 [zhijian](https://github.com/zhijian521/zhijian) 的固定提交）与耶温博客 · 设计语言（`yewen-blog-v1`，来自 [simple-blog](https://github.com/zhijian521/simple-blog) 的固定提交）。

## 结构

```text
src/content/designs/   作品信息与说明
src/pages/             首页、详情、404、robots
src/components/        Gallery 画廊、列表卡片与预览容器
src/styles/            展示站样式（global.css 与 gallery.css）
public/works/<id>/     独立作品页面与资源
public/brand/          书法标识与分享卡
assets/                不进构建的源资源（全量字体、备用标识）
templates/design/      新作品模板
scripts/               新增脚本、字体子集、链接校验
deploy.config.mjs      部署域名与路径前缀
```

作品样式与交互独立，iframe 保证隔离，代码以可信自有代码为前提。复杂 React / Vue 作品可独立构建后放入对应目录；归档保留公开内容，私有数据用模拟数据替换，并带上图片、字体、代码的授权说明。

## 字体

展示站与模板使用资源圆体子集 `MHRounded.woff2`（SIL OFL 1.1，许可见 `public/fonts/`），经 `--font-ui` 应用。`npm run subset:font` 扫描 `src/`、`templates/` 与显式引用 `rounded.css` 的作品页，从 `assets/fonts/MHRounded.full.woff2` 裁出子集；改文案后重跑即可，缺字回退系统字体。真实案例保留原设计字体，随作品保存；自带字体的作品由 `scripts/subset-design-font.mjs` 单独裁剪，不进站点共享子集。

## 部署

站点挂在 **https://yuwb.dev/designs/** 下，地址集中写在 `deploy.config.mjs`（`site` 与 `base`），构建与链接校验共用这一份，默认无需环境变量：

```sh
npm run verify
```

`site` 决定 canonical、分享卡片、`sitemap-index.xml` 与 `robots.txt` 的绝对地址，`base` 决定页面与资源的路径前缀。换域名或改回根目录只改这两个值，也可用 `SITE_URL`、`DEPLOY_BASE` 临时覆盖：

```powershell
$env:SITE_URL='https://example.com'
$env:DEPLOY_BASE='/designs/'
npm run build
```

存档作品在 `works/` 下，不进入索引，各自保留独立页面；`robots.txt` 会按 `base` 生成对应的 `Disallow`。分享卡 `public/brand/og.png` 是静态图，改动站点标识或描述后需重新生成。
