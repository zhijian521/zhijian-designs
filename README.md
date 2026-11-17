# 知简设计集

博客、网站与工具的界面存档。Astro + TypeScript 展示站，作品使用独立 HTML/CSS/JS，静态部署。

首页每批展示 12 份设计，滚动接近列表底部时自动加载下一批；加载失败可点击重试。不支持脚本时，“加载更多”链接仍可进入下一页。

详情预览支持设备宽度切换、50%–150% 缩放与全屏，点击百分比恢复 100%，Esc 退出全屏。展示站和嵌入预览共用主题细滚动条，存档文件保持独立。

## 运行

Node.js 22.23.4+，推荐 24 LTS。

```sh
npm install
npm run dev
```

`npm run build` 检查类型并构建到 `dist/`；`npm run preview` 查看构建结果。

`npm test` 检查新增脚本的生成与防覆盖行为；`npm run format` 统一格式，`npm run format:check` 检查格式。

## 新增设计

```sh
npm run new:design -- my-blog-v1
```

编号以字母开头，只使用小写字母、数字和短横线，以 `-v1`、`-v2` 等版本号结尾。脚本不会覆盖已有作品。

1. 编辑 `src/content/designs/my-blog-v1.md`，填写信息与说明。
2. 在 `public/designs/my-blog-v1/` 中实现页面，替换封面；需要交互时再添加脚本。
3. 将真实界面作为封面保存到作品的 `assets/`，登记来源仓库与 commit。
4. 预览后提交 Git、推送保存。重新设计时新增版本，保留旧版。

### 档案格式

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
source: https://github.com/your-name/your-project # 可选
commit: abcdef123456 # 可选
---
## 设计说明

记录布局、交互范围与资源来源。
```

档案路径从 `public/` 开始，不加前导 `/`。作品内部的图片、脚本使用 `./assets/...` 等相对路径。

当前收录「语无边 · 个人博客」（`simple-blog-v1`），来自 [simple-blog](https://github.com/zhijian521/simple-blog) 的固定提交。保留首页、归档、8 篇正文与本地资源，来源和许可详见作品说明。

## 结构与字体

```text
src/content/designs/       作品信息与 Markdown 说明
src/pages/                 首页、详情、404
src/components/            卡片与预览容器
src/styles/                展示站样式
public/designs/<id>/       独立作品页面与资源
public/fonts/              资源圆体、声明与许可
public/brand/              书法标识 SVG、透明 PNG 与说明
templates/design/          新作品模板
scripts/new-design.mjs     新增脚本
```

展示站与新建作品模板使用梦幻助手项目中的资源圆体子集 `MHRounded.woff2`，通过 `--font-ui` 应用。字体来源与 SIL OFL 许可保存在 `public/fonts/`。模板通过相对路径 `../../fonts/rounded.css` 引用；单独导出时一并携带字体目录或调整路径。真实案例保留原设计字体，随作品保存资源与许可。

作品的 CSS 与交互独立，iframe 用于样式隔离；作品代码以可信的自有代码为前提。复杂 React / Vue 作品可独立构建后放入对应目录。归档时保留公开内容，私有数据使用模拟数据替换，保留图片、字体与代码所需的授权说明。

## 部署

静态托管平台构建命令为 `npm run build`，输出目录 `dist`。

GitHub Pages 仓库子目录设置环境变量 `DEPLOY_BASE=/zhijian-designs/`；根域名无需设置。PowerShell 示例：

```powershell
$env:DEPLOY_BASE='/zhijian-designs/'
npm run build
npm run preview
Remove-Item Env:DEPLOY_BASE
```

此时预览地址为 `/zhijian-designs/`。
