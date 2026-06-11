/**
 * 产品页停留时长追踪器
 * ─────────────────────────────────────────────
 * - 仅在页面可见时计时（visibilitychange API）
 * - 结果存 localStorage，按产品累计
 * - 供询盘表单读取"意向产品"默认值
 * - 面向澳新市场：仅做匿名行为统计，不采集 PII
 */

(function () {
  'use strict';

  /* ── 配置 ── */
  var STORAGE_KEY = 'lj_product_dwell';   // localStorage key
  var PRODUCTS = {
    'field-fence':  'Field Fence',
    'chain-link':   'Chain Link Fence',
    'y-post':       'Y Post / Star Picket'
  };

  /* ── 从当前 URL 推断产品 slug ── */
  var path = window.location.pathname.toLowerCase();
  var currentProduct = null;
  for (var slug in PRODUCTS) {
    if (path.indexOf(slug) !== -1) { currentProduct = slug; break; }
  }
  if (!currentProduct) return;   // 非产品页，不追踪

  /* ── 读取已有数据 ── */
  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function saveData(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  /* ── 计时逻辑 ── */
  var data = loadData();
  if (!data[currentProduct]) data[currentProduct] = 0;

  var startTime = null;     // 本次可见开始时间
  var pageTotal = 0;        // 本页本次会话累计（毫秒）

  function startTimer() {
    if (startTime === null) startTime = Date.now();
  }
  function stopTimer() {
    if (startTime !== null) {
      var elapsed = Date.now() - startTime;
      pageTotal += elapsed;
      data[currentProduct] += elapsed;
      saveData(data);
      startTime = null;
    }
  }

  /* ── visibilitychange 监听 ── */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopTimer(); else startTimer();
  });

  /* ── 页面加载时判断初始可见状态 ── */
  if (!document.hidden) startTimer();

  /* ── 页面离开时保存 ── */
  window.addEventListener('beforeunload', stopTimer);
  window.addEventListener('pagehide', stopTimer);

  /* ── 暴露全局接口，供询盘表单调用 ── */
  window.LJTracker = {
    /** 返回停留最长的产品 slug（null 表示无数据） */
    getTopProduct: function () {
      var d = loadData();
      var topSlug = null, topTime = 0;
      for (var k in d) {
        if (d.hasOwnProperty(k) && d[k] > topTime) { topTime = d[k]; topSlug = k; }
      }
      return topSlug;
    },
    /** 返回当前产品 slug */
    getCurrentProduct: function () {
      return currentProduct;
    },
    /** 返回所有产品停留时长（秒） */
    getAllDwell: function () {
      var d = loadData();
      var out = {};
      for (var k in d) {
        if (d.hasOwnProperty(k)) out[k] = Math.round(d[k] / 1000);
      }
      return out;
    },
    /** 返回产品显示名 */
    getProductName: function (slug) {
      return PRODUCTS[slug] || slug;
    }
  };
})();
