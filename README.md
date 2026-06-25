# 🏭 联佳外贸官网 — Wire Fence Manufacturer Website

> 工厂直供外贸展示站，面向澳大利亚/新西兰围栏批发商、工程商和进口商。

## 📋 项目概述

| 项目               | 说明                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **目标客户** | 澳大利亚 / 新西兰围栏批发商、工程商、进口商                                     |
| **核心产品** | 牛栏网 (Field Fence)、勾花网 (Chain Link Fence)、Y型立柱 (Y Post / Star Picket) |
| **技术栈**   | 纯静态 HTML + Tailwind CSS v3 (standalone CLI) + AOS 动画                       |
| **表单方案** | Google Apps Script（Sheet 兜底 + 邮件通知）                                     |
| **部署平台** | GitHub Pages / Netlify                                                          |

## 📁 文件结构

```
├── index.html                          # 首页（产品总览 + Why Us + Factory + FAQ + 询盘表单）
├── products/                           # 产品详情页
│   ├── field-fence.html                # 牛栏网产品详情页
│   ├── chain-link-fence.html           # 勾花网产品详情页
│   └── y-post.html                     # Y型立柱产品详情页
├── blog/                               # 博客 / 选型指南（独立板块，Blog 为顶栏一级入口）
│   ├── index.html                      # 博客列表页（卡片网格）
│   ├── hinge-joint-vs-ring-lock-field-fence.html   # 选型：铰接 vs 环锁
│   ├── as-nzs-4534-zinc-coating-guide.html         # 标准解读：AS/NZS 4534 镀锌量
│   ├── best-field-fence-cattle-sheep-deer.html     # 场景：牛/羊/鹿围栏选择
│   └── import-wire-fence-from-china.html           # 采购指南：从中国进口围栏
├── privacy.html                        # 隐私政策（依据站点真实数据行为）
├── assets/                             # 静态资源
│   ├── css/                            # 编译后的 Tailwind CSS（standalone CLI 输出）
│   ├── img/                            # 图片素材（JPG + WebP 双格式）
│   ├── gif/                            # 工艺动图
│   └── js/                             # 前端脚本
│       ├── tracker.js                  # 产品页停留时长追踪器（LJTracker）
│       ├── cookie-consent.js           # Cookie / 数据使用说明横幅
│       ├── cursor.js                   # 自定义光标 + 视差 + 磁力按钮
│       ├── lightbox.js                 # 图片灯箱（备用，当前 DOM 已内联）
│       ├── faq.js                      # FAQ 手风琴
│       ├── form-handler.js             # 询盘表单提交与验证
│       ├── mobile-menu.js              # 移动端导航
│       ├── counter.js                  # 信任条数字滚动
│       ├── back-to-top.js              # 返回顶部按钮
│       ├── product-cards.js            # 产品卡片交互
│       └── swup-init.js                # 页面过渡与预渲染初始化
├── server.js                           # Node.js 本地开发服务器（推荐）
├── server.py                           # Python 3 本地开发服务器
├── tailwind.config.js                  # Tailwind 配置
├── tailwind-input.css                  # Tailwind 入口 CSS
├── check-assets.js                     # 素材引用检查脚本
├── fix-paths.js                        # 路径修复脚本
├── form-handler.gs                     # Google Apps Script 表单后端
├── favicon.ico                         # 网站图标
├── robots.txt                          # 搜索引擎爬虫配置
├── sitemap.xml                         # 站点地图
├── thank-you.html                      # 表单提交成功页
├── 开发规范.md                          # ⭐ 新增/修改页面必读：工程约定与同步清单
├── 建站技术方案.md                      # 建站技术方案文档
├── 素材清单.md                          # 素材准备清单
├── 待确认数据清单.md                    # 待客户确认的真实数据清单
└── README.md                           # 本文件
```

## 🧭 开发规范（新增 / 修改页面必读）

站点是 **纯静态 + Swup 内联跳转 + Tailwind(purge 编译产物)** 的组合，新增页面或改导航前**必须**先读 **[开发规范.md](开发规范.md)**，避免以下高频坑：

- **导航全站同步**：`<header>` 在 Swup 容器外、跨页持久；改导航必须同步所有"标准骨架"页面（`index` + `products/*` + `blog/*` + `privacy`），否则跳转后顶栏不一致。`thank-you.html` 豁免。
- **博客是独立一级入口**：顶栏 `Blog` 与 `Products▾` 平级，**不放进 Products 下拉**。
- **每页需 `#inquiry` 锚点**：`swup-init.js` 会把非首页的 "Get a Quote" 指向它。
- **链接带 `.html`、canonical 用干净 URL**：GitHub Pages 无无扩展名回退。
- **Tailwind purge**：新页只用既有 class；新增目录要进 `tailwind.config.js` 的 `content` 并重编译。
- **登记工具脚本**：新页加入 `check-assets.js` 的 `PAGES`、`fix-paths.js` 的 `files`。
- **文档同步**：任何改动必须同步更新 README / sitemap / 相关说明文件（元规范见开发规范.md §0）。

## 🎨 图片交互规范

全站图片统一使用 `.img-wrap` 容器实现悬停放大效果：

- 容器必须带 `overflow: hidden`，防止放大时图片溢出圆角/边框。
- 图片默认 `transform: scale(1)`，悬停时 `transform: scale(1.04)`，过渡 0.4s。
- 缓动曲线：`cubic-bezier(0.16, 1, 0.3, 1)`（out-expo），与勾花/链网区块保持一致。
- 已覆盖首页 4 个产品图组、About 工厂图、3 个产品详情页所有图片。
- 减少动画偏好（`prefers-reduced-motion: reduce`）下自动禁用过渡。

## 🛍️ 产品详情页功能

每个产品独立页面（`/products/xxx.html`）包含：

| 功能模块               | 说明                                                        |
| ---------------------- | ----------------------------------------------------------- |
| **Hero Banner**  | 产品大图 + 简介                                             |
| **变体切换画廊** | 点击变体卡片切换对应产品图片组（带方向滑动动画）            |
| **规格表**       | 完整技术参数（Material / Wire Diameter / Zinc Coating 等）  |
| **检测数据**     | 镀锌量、丝径公差、拉力强度、标准合规                        |
| **应用场景**     | 3 个典型使用场景卡片，卡片图片统一 `.img-wrap` 悬停放大                      |
| **使用方法**     | 分步安装指南 + Pro Tip                                                         |
| **配套推荐**     | 关联产品交叉导流                                            |
| **参考价格**     | 出厂裸价（明确标注不含运费/关税/末端配送）                  |
| **询盘表单**     | 项目/使用场景、围栏长度、是否需要立柱/配件（可留空/不确定） |
| **停留时长埋点** | 仅页面可见时计时，存 localStorage，提交时一并传给后端       |

## 📊 停留时长追踪（改动 2）

- **模块文件**：`assets/js/tracker.js`（主用）/ `assets/js/time-tracker.js`（备用）
- **原理**：`visibilitychange` API，仅页面可见时每秒累加，切后台/最小化不计
- **存储**：`localStorage` key: `lj_product_dwell`
- **自动回显**：询盘表单的「意向产品」默认取停留时长最长的产品，客户可手动修改
- **数据传递**：表单提交时，`dwell_times` 隐藏字段携带各产品停留秒数
- **合规**：面向澳新市场，仅做匿名行为统计，cookie-consent 横幅告知用户

## 💰 价格口径（改动 3）

- 产品页只展示**出厂参考价（Ex Works）**，不公开到港/到仓价
- 明确标注：不含海运费、目的港杂费、关税、末端配送
- FAQ 新增：「网站价格是最终价吗？」→ 引导留资料咨询
- 不在前端实现任何到仓价自动计算，计算交由业务人工完成

## 📝 询盘表单设计（改动 4）

表单新增字段（均可为空或"不确定"）：

| 字段                      | 类型     | 说明                            |
| ------------------------- | -------- | ------------------------------- |
| Project / Usage Scenario  | textarea | 围栏长度、用途、是否需立柱+配件 |
| Fence Length (approx.)    | input    | 如 500m / 2km / Not sure        |
| Need Posts / Accessories? | select   | Not sure yet / Yes / No         |
| Product of Interest       | select   | 自动回显停留最长的产品          |
| source_page               | hidden   | 来源页 slug                     |
| dwell_times               | hidden   | 各产品停留秒数 JSON             |

## 🔧 待替换占位符

上线前需全局替换以下占位符：

| 占位符                            | 说明                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `[COMPANY_NAME]`                | 公司英文名                                                                       |
| `[DOMAIN]`                      | 域名（如 lianjiafence.com）                                                      |
| `[FACTORY_ADDRESS]`             | 工厂详细地址（堤涡村村北100米处, Anping County）                                 |
| `[FACTORY_ADDRESS_URL_ENCODED]` | 同上，空格用+替换（如 No.88+West+Industrial+Zone+Anping），用于 Google Maps 嵌入 |
| `FORM_SCRIPT_URL`               | Google Apps Script Web App URL（表单提交后端），详见下方说明                     |
| `[YEAR_FOUNDED]`                | 成立年份                                                                         |
| `[YEARS]`                       | 经营年数                                                                         |
| `[CAPACITY]`                    | 月产能（柜数）                                                                   |
| `[PHONE]`                       | 联系电话                                                                         |
| `[EMAIL]`                       | 销售邮箱（已替换为 sales@lianjiafence.com）                                   |
| `[WHATSAPP]`                    | WhatsApp 号码                                                                    |
| `[WHATSAPP_LINK]`               | WhatsApp wa.me 链接                                                              |
| `[YEAR]`                        | 当前年份                                                                         |
| `FORM_ID`                       | Formspree 表单 ID                                                                |

## 🛠️ 本地开发

### 启动项目

项目已内置本地服务器，路由行为与 GitHub Pages 对齐：

- **目录索引**：`/blog/` → `blog/index.html`
- **无扩展名回退**（仅本地便利）：`/products/field-fence` → `/products/field-fence.html`

```bash
# 方式一：Node.js（推荐）
node server.js

# 方式二：Python 3
python server.py
# 或
python3 server.py
```

启动后访问 **http://localhost:8080** 即可预览网站。

> 若 8080 端口被占用，可编辑 `server.js` / `server.py` 中的 `PORT` 变量，或临时关闭占用端口的程序。

## 🚀 部署

1. 替换所有占位符
2. 替换 `assets/` 下的素材文件（参见「素材清单-发给老板.md」）
3. 推送到 GitHub 仓库
4. 启用 GitHub Pages（或连接 Netlify）
5. 配置自定义域名 + SSL

## 后续

- 当前图片已同时提供 JPG + WebP 双格式，并通过 `picture` 标签按需加载；性能优化（格式、懒加载、响应式）已基本完成。
- 后续可以接入客户自动化开发平台, 实现客户提交表单自动发送打招呼邮件的功能, 目前客户提交表单以后, 需要人工介入维护, 因为该渠道客户精准度高, 所以当前方式尚可, 自动化邮件开发后续作为锦上添花的补充能力.

且客户自动化开发未来会融入kaas, 作为其中的部分能力.

---

## ✅ 待办事项

### 已完成

- [X] Sheet 兜底存储（先写 Sheet 再发邮件，配额耗尽不丢客户）
- [X] 蜜罐检测（`_gotcha` 字段拦截机器人）
- [X] Turnstile 代码预埋（配置 site_key + secret 后自动生效）
- [X] 配额预警代码预埋（配置企业微信 webhook 后自动生效）
- [X] 仓库安全扫描（git 历史无密钥泄露）
- [X] 牛栏网和立柱产品详情页排版统一（GIF 工艺图、配套推荐、参考价格区块一致）
- [X] 自定义光标页面跳转优化（View Transitions + Speculation Rules 预渲染）
- [X] 配置配额预警（企业微信 webhook，阈值 10 封）
- [X] 图片性能优化：JPG + WebP 双格式、`loading="lazy"`、响应式 `srcset` 已落地
- [X] 全站图片悬停放大效果统一（`.img-wrap` 组件，scale 1.04 + out-expo 缓动）

### 待完成

- [ ] **自定义域名邮箱 + 邮件认证**：确定域名和邮箱服务商后，配置 SPF / DKIM / DMARC 记录（防止邮件进垃圾箱）
- [ ] 牛栏网 勾花规格按照澳新本地习惯修改
- [ ] 产品推荐部分是什么逻辑, 会推荐当前产品以及官网首页吗?
- [ ] **启用 Cloudflare Turnstile**：注册 https://dash.cloudflare.com/turnstile ，获取 site_key + secret_key 填入代码（用 GitHub Pages URL 即可，不需要自定义域名）
- [ ] **配置 UptimeRobot**：注册 https://uptimerobot.com ，用 GitHub Pages URL 监控，通知接企业微信
- [ ] **开启 GitHub Secret Scanning**：仓库 Settings → Security → 开启自动密钥扫描

### 性能优化（持续）

- 图片：JPG + WebP 双格式 + `loading="lazy"` + `srcset` 响应式 **已完成**
- GIF：后续可按需转 MP4（`<video autoplay loop muted playsinline>`），体积减少 80%+
- 长视频：当前使用 YouTube 嵌入（`youtube-nocookie.com`），零带宽消耗、自适应码率；不推荐直接上传到 GitHub Pages

---

*更多技术细节参见 [建站技术方案.md](建站技术方案.md)*
