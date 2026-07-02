/**
 * 产品页停留时长追踪器
 * ─────────────────────────────────────────────
 * - 仅在页面可见时计时（visibilitychange API）
 * - 结果存 localStorage，按产品累计
 * - 供询盘表单读取"意向产品"默认值
 * - 面向国际市场：仅做匿名行为统计，不采集 PII
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
  function detectProduct() {
    var path = window.location.pathname.toLowerCase();
    for (var slug in PRODUCTS) {
      if (path.indexOf(slug) !== -1) { return slug; }
    }
    return null;
  }

  var currentProduct = detectProduct();
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

  /* ── 预渲染兼容：prerender 状态下不计时，激活后才开始 ── */
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', function () {
      if (!document.prerendering && !document.hidden) startTimer();
    }, { once: true });
  } else if (!document.hidden) {
    startTimer();
  }

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
    },
    /** 结算当前页停留时长（Swup visit:start 调用） */
    _settleDwell: function () {
      stopTimer();
    },
    /** 上报一次 PV（Swup page:view 调用） */
    _reportPageview: function () {
      currentProduct = detectProduct();
      // 若后续接入真实分析服务，可在此发送 PV
      // 目前仅确保 currentProduct 与当前 URL 一致
    },
    /** 重置新页计时器（Swup page:view 调用） */
    _resetTimer: function () {
      stopTimer();
      currentProduct = detectProduct();
      data = loadData();
      if (currentProduct && !data[currentProduct]) data[currentProduct] = 0;
      startTime = null;
      pageTotal = 0;
      if (!document.hidden) startTimer();
    }
  };
})();
