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
    animationSelector: false,
    animateHistoryBrowsing: false,
    linkSelector: 'a[href]:not([data-no-swup]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"])',
    plugins: [
      new SwupScrollPlugin({
        doScrollingRightAway: false,
        animateScroll: {
          betweenPages: !prefersReducedMotion,
          samePageWithHash: false,
          samePage: false
        }
      })
    ]
  });

  /* ── 页面切换后刷新光标 hero 引用与追踪器计时 ── */
  window._swup.hooks.on('page:view', function () {
    // Header 在 Swup 容器外，需要把 Get a Quote 按钮的 hash 修正为当前页对应表单的 id
    var isHome = !location.pathname || location.pathname === '/' || location.pathname === '/index.html';
    var targetHash = isHome ? '#contact' : '#inquiry';
    var headerCta = document.querySelector('header nav a.bg-accent');
    var mobileMenuCta = document.querySelector('header #mobile-menu a.bg-orange-500');
    var floatingCta = document.querySelector('a[aria-label="Get a Quote"][href^="#"]');
    var bottomBarCta = document.querySelector('#mobile-bottom-bar a[href^="#"]');
    if (headerCta) headerCta.setAttribute('href', targetHash);
    if (mobileMenuCta) mobileMenuCta.setAttribute('href', targetHash);
    if (floatingCta) floatingCta.setAttribute('href', targetHash);
    if (bottomBarCta) bottomBarCta.setAttribute('href', targetHash);

    /* Header 在 Swup 容器外持久保留；从首页切到产品页后，
       原来带 # 的锚点链接会指向产品页不存在的 id，导致点击无反应。
       因此非首页时把 header 内所有 hash 链接补成绝对路径 /#xxx，
       回到首页时再恢复为相对 #xxx，让浏览器/ScrollPlugin 正常滚动。 */
    var headerHashLinks = document.querySelectorAll('header a[href^="#"]');
    headerHashLinks.forEach(function (a) {
      var hash = a.getAttribute('href');
      if (hash.charAt(0) !== '#') return;
      a.setAttribute('href', isHome ? hash : '/' + hash);
    });

    if (typeof window._cursorRefreshHero === 'function') window._cursorRefreshHero();
    if (window.LJTracker && typeof window.LJTracker._reportPageview === 'function') window.LJTracker._reportPageview();
    if (window.LJTracker && typeof window.LJTracker._resetTimer === 'function') window.LJTracker._resetTimer();
    if (window.LJFAQ && typeof window.LJFAQ.init === 'function') window.LJFAQ.init();
    if (window.LJProductCards && typeof window.LJProductCards.init === 'function') window.LJProductCards.init();
    if (window.LJLightbox && typeof window.LJLightbox.init === 'function') window.LJLightbox.init();
    if (window.LJCounter && typeof window.LJCounter.init === 'function') window.LJCounter.init();
    if (window.LJFormHandler && typeof window.LJFormHandler.init === 'function') window.LJFormHandler.init();
    if (window.LJBackToTop && typeof window.LJBackToTop.init === 'function') window.LJBackToTop.init();
    if (window.LJMobileMenu && typeof window.LJMobileMenu.init === 'function') window.LJMobileMenu.init();
  });

  /* ── 离开页面前结算当前页停留时长 ── */
  window._swup.hooks.on('visit:start', function () {
    if (window.LJTracker && typeof window.LJTracker._settleDwell === 'function') window.LJTracker._settleDwell();
  });
})();
