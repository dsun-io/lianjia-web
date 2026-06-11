# 🏭 联佳外贸官网 — Wire Fence Manufacturer Website

> 工厂直供外贸展示站，面向澳大利亚/新西兰围栏批发商、工程商和进口商。

## 📋 项目概述

| 项目 | 说明 |
|------|------|
| **目标客户** | 澳大利亚 / 新西兰围栏批发商、工程商、进口商 |
| **核心产品** | 牛栏网 (Field Fence)、勾花网 (Chain Link Fence)、Y型立柱 (Y Post / Star Picket) |
| **技术栈** | 纯静态 HTML + Tailwind CSS (Play CDN) + AOS 动画 |
| **表单方案** | Formspree（零后端） |
| **部署平台** | GitHub Pages / Netlify |

## 📁 文件结构

```
├── index.html                          # 首页（产品总览 + Why Us + Factory + FAQ + 询盘表单）
├── products/
│   ├── field-fence.html                # 牛栏网产品详情页
│   ├── chain-link-fence.html           # 勾花网产品详情页
│   └── y-post.html                     # Y型立柱产品详情页
├── assets/
│   ├── img/                            # 图片素材
│   ├── video/                          # 视频素材
│   ├── gif/                            # 工艺动图
│   └── js/
│       ├── tracker.js                  # 产品页停留时长追踪器（LJTracker）
│       ├── time-tracker.js             # 备用停留时长模块（TimeTracker）
│       └── cookie-consent.js           # Cookie/数据使用说明横幅
├── favicon.svg                         # 网站图标
├── robots.txt                          # 搜索引擎爬虫配置
├── sitemap.xml                         # 站点地图
├── 建站技术方案.md                      # 建站技术方案文档
├── 素材清单-发给老板.md                 # 素材准备清单
└── README.md                           # 本文件
```

## 🛍️ 产品详情页功能

每个产品独立页面（`/products/xxx.html`）包含：

| 功能模块 | 说明 |
|---------|------|
| **Hero Banner** | 产品大图 + 简介 |
| **规格表** | 完整技术参数（Material / Wire Diameter / Zinc Coating 等） |
| **检测数据** | 镀锌量、丝径公差、拉力强度、标准合规 |
| **应用场景** | 3 个典型使用场景卡片 |
| **使用方法** | 分步安装指南 + Pro Tip |
| **配套推荐** | 关联产品交叉导流 |
| **参考价格** | 出厂裸价（明确标注不含运费/关税/末端配送） |
| **询盘表单** | 项目/使用场景、围栏长度、是否需要立柱/配件（可留空/不确定） |
| **停留时长埋点** | 仅页面可见时计时，存 localStorage，提交时一并传给后端 |

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

| 字段 | 类型 | 说明 |
|------|------|------|
| Project / Usage Scenario | textarea | 围栏长度、用途、是否需立柱+配件 |
| Fence Length (approx.) | input | 如 500m / 2km / Not sure |
| Need Posts / Accessories? | select | Not sure yet / Yes / No |
| Product of Interest | select | 自动回显停留最长的产品 |
| source_page | hidden | 来源页 slug |
| dwell_times | hidden | 各产品停留秒数 JSON |

## 🔧 待替换占位符

上线前需全局替换以下占位符：

| 占位符 | 说明 |
|--------|------|
| `[COMPANY_NAME]` | 公司英文名 |
| `[DOMAIN]` | 域名（如 lianjia-fence.com） |
| `[YEAR_FOUNDED]` | 成立年份 |
| `[YEARS]` | 经营年数 |
| `[CAPACITY]` | 月产能（柜数） |
| `[PHONE]` | 联系电话 |
| `[EMAIL]` | 销售邮箱 |
| `[WHATSAPP]` | WhatsApp 号码 |
| `[WHATSAPP_LINK]` | WhatsApp wa.me 链接 |
| `[YEAR]` | 当前年份 |
| `FORM_ID` | Formspree 表单 ID |

## 🚀 部署

1. 替换所有占位符
2. 替换 `assets/` 下的素材文件（参见「素材清单-发给老板.md」）
3. 推送到 GitHub 仓库
4. 启用 GitHub Pages（或连接 Netlify）
5. 配置自定义域名 + SSL

---

*更多技术细节参见 [建站技术方案.md](建站技术方案.md)*
