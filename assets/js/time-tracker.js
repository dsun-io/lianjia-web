/**
 * 产品页停留时长埋点模块
 * 
 * 核心逻辑：
 * - 仅在页面可见(visibilitychange=visible)时计时，切后台/最小化不计
 * - 结果存 localStorage，按产品 key 累计
 * - 供询盘表单读取"意向产品"默认值
 * 
 * 用法：在产品页 <script> 中调用 TimeTracker.init('field-fence');
 */
var TimeTracker = (function () {
  'use strict';

  var STORAGE_KEY = 'lj_product_dwell_time';
  var SOURCE_KEY  = 'lj_inquiry_source';
  var INTERVAL_MS = 1000; // 每秒累计

  var _productKey = null;
  var _intervalId = null;
  var _isVisible  = true;

  /**
   * 从 localStorage 读取所有产品的停留时长
   * @returns {Object} { 'field-fence': 120, 'chain-link-fence': 45, ... }
   */
  function _load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * 将停留时长数据写回 localStorage
   */
  function _save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage 不可用时静默失败
    }
  }

  /**
   * 每秒调用一次，仅在页面可见时累加
   */
  function _tick() {
    if (!_isVisible || !_productKey) return;
    var data = _load();
    if (!data[_productKey]) data[_productKey] = 0;
    data[_productKey] += 1;
    _save(data);
  }

  /**
   * 页面可见性变化回调
   */
  function _onVisibilityChange() {
    _isVisible = !document.hidden;
  }

  /**
   * 初始化：绑定产品 key，开始计时
   * @param {string} productKey - 产品标识，如 'field-fence'
   */
  function init(productKey) {
    if (!productKey) return;
    _productKey = productKey;

    // 记录来源页
    try {
      localStorage.setItem(SOURCE_KEY, productKey);
    } catch (e) {}

    // 监听可见性
    _isVisible = !document.hidden;
    document.addEventListener('visibilitychange', _onVisibilityChange);

    // 预渲染兼容：prerender 状态下不计时，激活后才开始
    if (document.prerendering) {
      document.addEventListener('prerenderingchange', function () {
        if (!document.prerendering) _startTicking();
      }, { once: true });
    } else {
      _startTicking();
    }

    // 页面卸载时停止
    window.addEventListener('beforeunload', function () {
      if (_intervalId) clearInterval(_intervalId);
    });
  }

  /** 内部方法：启动每秒计时 */
  function _startTicking() {
    _intervalId = setInterval(_tick, INTERVAL_MS);
  }

  /**
   * 获取停留时长最长的产品 key
   * @returns {string|null}
   */
  function getTopProduct() {
    var data = _load();
    var maxKey = null, maxTime = 0;
    for (var key in data) {
      if (data.hasOwnProperty(key) && data[key] > maxTime) {
        maxTime = data[key];
        maxKey = key;
      }
    }
    return maxKey;
  }

  /**
   * 获取所有产品停留时长数据
   * @returns {Object}
   */
  function getAllDwellTimes() {
    return _load();
  }

  /**
   * 获取当前来源页（最近访问的产品页）
   * @returns {string|null}
   */
  function getSourcePage() {
    try {
      return localStorage.getItem(SOURCE_KEY);
    } catch (e) {
      return null;
    }
  }

  /**
   * 格式化停留时长为可读字符串
   * @param {number} seconds
   * @returns {string} 如 "2m 15s"
   */
  function formatTime(seconds) {
    if (!seconds || seconds <= 0) return '0s';
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m > 0 ? m + 'm ' + s + 's' : s + 's';
  }

  return {
    init: init,
    getTopProduct: getTopProduct,
    getAllDwellTimes: getAllDwellTimes,
    getSourcePage: getSourcePage,
    formatTime: formatTime
  };
})();
