# 🏭 联佳外贸官网 — Wire Fence Manufacturer Website

> 工厂直供外贸展示站，面向澳大利亚/新西兰围栏批发商、工程商和进口商。

## 📋 项目概述

| 项目               | 说明                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **目标客户** | 澳大利亚 / 新西兰围栏批发商、工程商、进口商                                     |
| **核心产品** | 牛栏网 (Field Fence)、勾花网 (Chain Link Fence)、Y型立柱 (Y Post / Star Picket) |
| **技术栈**   | 纯静态 HTML + Tailwind CSS (Play CDN) + AOS 动画                                |
| **表单方案** | Google Apps Script（Sheet 兜底 + 邮件通知）                                      |
| **部署平台** | GitHub Pages / Netlify                                                          |

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

| 功能模块               | 说明                                                        |
| ---------------------- | ----------------------------------------------------------- |
| **Hero Banner**  | 产品大图 + 简介                                             |
| **规格表**       | 完整技术参数（Material / Wire Diameter / Zinc Coating 等）  |
| **检测数据**     | 镀锌量、丝径公差、拉力强度、标准合规                        |
| **应用场景**     | 3 个典型使用场景卡片                                        |
| **使用方法**     | 分步安装指南 + Pro Tip                                      |
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
| `[DOMAIN]`                      | 域名（如 lianjia-fence.com）                                                     |
| `[FACTORY_ADDRESS]`             | 工厂详细地址（如 No.88, West Industrial Zone, Anping）                           |
| `[FACTORY_ADDRESS_URL_ENCODED]` | 同上，空格用+替换（如 No.88+West+Industrial+Zone+Anping），用于 Google Maps 嵌入 |
| `FORM_SCRIPT_URL`               | Google Apps Script Web App URL（表单提交后端），详见下方说明                     |
| `[YEAR_FOUNDED]`                | 成立年份                                                                         |
| `[YEARS]`                       | 经营年数                                                                         |
| `[CAPACITY]`                    | 月产能（柜数）                                                                   |
| `[PHONE]`                       | 联系电话                                                                         |
| `[EMAIL]`                       | 销售邮箱                                                                         |
| `[WHATSAPP]`                    | WhatsApp 号码                                                                    |
| `[WHATSAPP_LINK]`               | WhatsApp wa.me 链接                                                              |
| `[YEAR]`                        | 当前年份                                                                         |
| `FORM_ID`                       | Formspree 表单 ID                                                                |

## �️ 本地开发

### 启动项目

```bash
# 方式一：Python（推荐，Windows/macOS/Linux 通用）
cd "外贸独立站设计(未来接入kaas做自动化)"
python -m http.server 8080

# 方式二：Node.js（需先安装 Node.js）
npx serve .

# 方式三：PHP
php -S localhost:8080
```

启动后访问 **http://localhost:8080** 即可预览网站。

> 如果 8080 端口被占用，可换成其他端口（如 3000、9000）。

## �🚀 部署

1. 替换所有占位符
2. 替换 `assets/` 下的素材文件（参见「素材清单-发给老板.md」）
3. 推送到 GitHub 仓库
4. 启用 GitHub Pages（或连接 Netlify）
5. 配置自定义域名 + SSL

## 后续

后续可以接入客户自动化开发平台, 实现客户提交表单自动发送打招呼邮件的功能, 目前客户提交表单以后, 需要人工介入维护, 因为该渠道客户精准度高, 所以当前方式尚可, 自动化邮件开发后续作为锦上添花的补充能力.

且客户自动化开发未来会融入kaas, 作为其中的部分能力.

---

## ✅ 待办事项

### 已完成

- [x] Sheet 兜底存储（先写 Sheet 再发邮件，配额耗尽不丢客户）
- [x] 蜜罐检测（`_gotcha` 字段拦截机器人）
- [x] Turnstile 代码预埋（配置 site_key + secret 后自动生效）
- [x] 配额预警代码预埋（配置企业微信 webhook 后自动生效）
- [x] 仓库安全扫描（git 历史无密钥泄露）

### 待完成

- [ ] **自定义域名邮箱 + 邮件认证**：确定域名和邮箱服务商后，配置 SPF / DKIM / DMARC 记录（防止邮件进垃圾箱）
- [ ] **启用 Cloudflare Turnstile**：注册 https://dash.cloudflare.com/turnstile ，获取 site_key + secret_key 填入代码
- [ ] **配置配额预警**：企业微信群添加机器人，获取 webhook URL 填入 Apps Script `WECHAT_WEBHOOK`
- [ ] **配置 UptimeRobot**：注册 https://uptimerobot.com ，监控网站 URL，通知接企业微信
- [ ] **开启 GitHub Secret Scanning**：仓库 Settings → Security → 开启自动密钥扫描
- [ ] **素材性能优化**：
  - 图片：JPG/PNG → WebP + `loading="lazy"` + `srcset` 响应式
  - GIF：GIF → MP4（`<video autoplay loop muted playsinline>`），体积减少 80%+
  - 长视频：上传 YouTube（Unlisted）→ `youtube-nocookie.com` 嵌入 + facade 懒加载
  - ⚠️ 不要直接上传到 GitHub Pages（无 CDN、无自适应码率、占仓库空间）

---

*更多技术细节参见 [建站技术方案.md](建站技术方案.md)*
