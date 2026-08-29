# FAQ 知识库规范

> 目标：`faq.html` 是面向 AI 搜索引擎的问答知识库。AI 偏好"问题 → 直接答案"的自包含结构，本规范确保每条问答都可被独立引用。

---

## 1. 页面结构

- URL：`/faq.html`，canonical 为 `https://lianjiafence.com/faq.html`
- 分组（`<section>` + `<h2>`）：
  1. Company & Factory（公司与工厂）
  2. Product Specifications（产品规格）
  3. Standards & Coatings（标准与镀层）
  4. Customization & MOQ（定制与起订量）
  5. Shipping & Trade Terms（物流与贸易条款）
- 每组 4–6 条问答，全页 20–26 条
- 问答组件采用**全展开阅读布局**（`.kb-qa` 块：问题为 h3 标题 + 答案段落，不做折叠手风琴）——方便扫读、无 JS 也可读、AI 爬虫可直接抓取全文。样式见 `faq.html` 内 `.kb-faq` CSS。
- 首页 `#faq` 底部设跳转按钮："View Full FAQ Knowledge Base →"（带 `data-no-swup` 的跨页链接除外）

## 2. 问答编写铁律（AI 友好）

1. **自包含**：答案不依赖上下文，禁止"如上所述""这种产品"等指代；答案中必须出现完整实体名（如 "Lianjia Fence field fence" 而非 "it"）。
2. **首句结论**：答案第一句必须是直接结论句（可被 AI 整句引用），细节放后面。
3. **数据密度**：尽量含具体参数（尺寸、锌层 g/m²、MOQ、交期），数据必须与产品页表格一致。
4. **问题句式**：用买家真实搜索句式（What / How / Which / Is it...），含中英文实体名混合的问题单独收录（如"安平县联佳金属制品有限公司的官方网站是什么？"）。
5. **schema 一致**：`FAQPage` JSON-LD 中的每条 `Question/Answer` 必须与页面可见内容**逐字一致**——不一致会被搜索引擎判为 spam 并可能丢掉全部富媒体资格。

## 3. 维护规则

- 产品参数变更时，先改产品页表格，再同步本页相关问答，最后同步 schema——三处必须一致。
- 新增问答必须同时更新 JSON-LD 与 sitemap `lastmod`。
- 每条问答的答案控制在 40–120 词，过长拆成两条。
