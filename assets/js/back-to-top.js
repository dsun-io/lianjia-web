/**
 * Back-to-top button — 全局单例，兼容 Swup 页面切换。
 * 只在窗口滚动超过 400px 且屏幕 >= sm 时显示。
 */
(function () {
  'use strict';

  // 防止 Swup 替换容器后脚本被重新执行导致重复监听。
  if (window.__ljBackToTopInit) return;
  window.__ljBackToTopInit = true;

  function init() {
    if (window.__ljBackToTopReady) return;
    window.__ljBackToTopReady = true;

    var ticking = false;

    function update() {
      ticking = false;
      var btn = document.getElementById('back-to-top');
      if (!btn) return;

      var show = window.scrollY > 400 && window.matchMedia('(min-width: 640px)').matches;

      if (show) {
        btn.classList.remove('hidden');
        requestAnimationFrame(function () {
          btn.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
        });
      } else {
        btn.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
        requestAnimationFrame(function () {
          btn.classList.add('hidden');
        });
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    // 动态代理点击事件，Swup 替换按钮后无需重新初始化。
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('#back-to-top');
      if (!btn) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.LJBackToTop = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
