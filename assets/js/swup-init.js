/**
 * Swup 同文档导航最小初始化
 * ─────────────────────────────────────────────
 * 仅负责无刷新切换 #swup 容器内的内容。
 * 页面内的内联脚本由 Swup 在切换后自动重新执行，
 * 因此首页/产品页的卡片切换、计数器、FAQ、光标等交互保持原样。
 */
(function () {
  'use strict';

  if (typeof Swup === 'undefined') return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window._swup = new Swup({
    containers: ['#swup'],
    cache: true,
    animateHistoryBrowsing: !prefersReducedMotion,
    linkSelector: 'a[href]:not([data-no-swup]):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"])',
    plugins: [
      new SwupScrollPlugin({
        doScrollingRightAway: false,
        animateScroll: {
          betweenPages: !prefersReducedMotion,
          samePageWithHash: !prefersReducedMotion,
          samePage: !prefersReducedMotion
        }
      })
    ]
  });
})();
