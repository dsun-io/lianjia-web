/**
 * Trust Strip Counter Animation — 全局单例，兼容 Swup 页面切换。
 *
 * 使用 IntersectionObserver 监听 [data-target] 元素；
 * 每次页面切换后重置计数状态，确保动画可重复触发。
 */
(function () {
  'use strict';

  if (window.__ljCounterInit) return;
  window.__ljCounterInit = true;

  var observer = null;

  function animateCountUp(el, target, duration) {
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - (1 - progress) * (1 - progress);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  function init() {
    // 重置所有计数器，允许新页面重新触发动画
    document.querySelectorAll('[data-target]').forEach(function (el) {
      delete el.dataset.counted;
      var target = parseInt(el.getAttribute('data-target'), 10);
      if (!isNaN(target)) el.textContent = '0';
    });

    if (observer) {
      observer.disconnect();
    }

    var counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10);
          if (!isNaN(target) && !el.dataset.counted) {
            el.dataset.counted = 'true';
            animateCountUp(el, target, 2000);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  window.LJCounter = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
