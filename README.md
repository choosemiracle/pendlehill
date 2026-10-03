# 彭德尔山研究｜Pendle Hill Studies

一个面向中文读者的独立研究型静态网站，用于梳理美国宾夕法尼亚州 Pendle Hill 的历史、思想、人物、实践与出版传统。

## 页面

- `index.html` — 首页与研究入口
- `history.html` — 历史与时间线
- `ideas.html` — 内在之光、Meeting、辨识、教育、心理学
- `people.html` — 关键人物与思想网络
- `practice.html` — work / worship / study / community、澄心会、学习聚会
- `library.html` — 可搜索、筛选的研究文献导览
- `sources.html` — 官方资料、核心文本与研究方法

## 技术

纯静态 HTML + CSS + JavaScript，无构建步骤、无框架依赖，适合直接部署到 GitHub Pages、Cloudflare Pages、Netlify 或任意静态服务器。

本地预览：

```bash
cd pendle-hill-studies
python3 -m http.server 8080
```

浏览器打开 `http://localhost:8080/`。

## 设计

- 中文优先，关键 Quaker 术语保留英文
- 纸张色、森林绿、赭金色，克制而偏研究档案气质
- 响应式布局，移动端可用
- 仅使用系统字体，不打包任何字体文件

## 研究与版权

本站为独立中文研究项目，非 Pendle Hill 官方网站。事实性资料优先依据 Pendle Hill 官方网站与原始出版物；中文释义、主题归纳与研究导读由本站整理。受版权保护的书籍与 pamphlets 仅做摘要、短引和书目导读。

## 部署到 GitHub Pages

将本目录推送到一个 GitHub 仓库，在 Settings → Pages 中选择从 `main` 分支根目录发布即可。若部署到子路径，本项目使用相对路径，不需要额外修改。
