# GEO 品牌实体规范

> 目标：让 AI 搜索引擎明确建立 **"安平县联佳金属制品有限公司 ↔ Lianjia Fence ↔ lianjiafence.com"** 的实体映射。
> 任何页面改动涉及公司名、品牌名时，必须遵循本规范。

---

## 1. 实体定义（唯一事实源）

| 字段 | 值 | 说明 |
|------|-----|------|
| 法定英文名 (legalName) | Anping Lianjia Metal Products Co., Ltd. | schema `legalName` 专用 |
| 法定中文名 | 安平县联佳金属制品有限公司 | 页脚 / schema `alternateName` 必备 |
| 品牌名 | Lianjia Fence | 站点品牌、logo 文字 |
| 域名 | https://lianjiafence.com | 全站 canonical 根 |
| 地址 | Anping County, Hengshui, Hebei, China | 保持现有写法 |

## 2. Organization JSON-LD 标准模板

全站所有 `Organization` schema 必须包含以下字段（可复制此模板）：

```json
{
  "@type": "Organization",
  "@id": "https://lianjiafence.com/#organization",
  "name": "Anping Lianjia Metal Products Co., Ltd.",
  "legalName": "Anping Lianjia Metal Products Co., Ltd.",
  "alternateName": ["Lianjia Fence", "安平县联佳金属制品有限公司", "联佳金属", "Lianjia Metal"],
  "url": "https://lianjiafence.com/",
  "logo": "https://lianjiafence.com/assets/img/lianjia-fence-logo.jpg",
  "email": "sales@lianjiafence.com",
  "telephone": "+86-136-0318-1774",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Anping County",
    "addressRegion": "Hebei",
    "addressCountry": "CN"
  }
}
```

**关键规则**：
- `@id` 统一为 `https://lianjiafence.com/#organization`，全站所有 schema 引用同一实体（作者 publisher、产品 brand 均用此 `@id` 引用）。
- 新增页面时从本模板复制，禁止只写 `name` 就交差。

## 3. 可见文本中的双语绑定规则

| 位置 | 规则 |
|------|------|
| 页脚版权行 | 必须含中文法定名：`© 2026 Anping Lianjia Metal Products Co., Ltd.（安平县联佳金属制品有限公司）` |
| About 区块首次出现公司名 | 双语并列：`Anping Lianjia Metal Products Co., Ltd.（安平县联佳金属制品有限公司）` |
| FAQ 知识库 | 必须收录问答："安平县联佳金属制品有限公司的官方网站是什么？"，答案直接给 URL |
| llms.txt `## Company` | 必须含 `中文名: 安平县联佳金属制品有限公司` |

## 4. 禁止事项

- 禁止出现与公司无关的其他中文名写法（如"联佳护栏网厂"等历史叫法），避免实体分裂。
- 禁止在不同页面使用不同的 `@id` 指向同一公司。
- 图片 alt 中的公司名与上述实体保持一致。
