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

  /* ── 根据当前 URL 高亮顶部导航（header 在 Swup 容器外持久保留，必须手动同步） ── */
  function normalizePath(p) {
    return p.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
  }

  function updateActiveNav() {
    var path = normalizePath(location.pathname);
    var hash = location.hash || '';
    var isHome = path === '/';
    var isBlog = path === '/blog' || path.indexOf('/blog/') === 0;
    var isProduct = path.indexOf('/products/') === 0;

    function isActiveLink(href) {
      var hashIdx = href.indexOf('#');
      var hrefPath = hashIdx === -1 ? href : href.substring(0, hashIdx);
      var hrefHash = hashIdx === -1 ? '' : href.substring(hashIdx);
      hrefPath = normalizePath(hrefPath);

      // 产品页：高亮 Products 下拉触发器
      if (isProduct && hrefPath === '/' && hrefHash === '#products') return true;

      // Blog 页：高亮 Blog
      if (isBlog && hrefPath === '/blog') return true;

      // 首页且带 hash：高亮对应章节（#about / #why-us 等）
      if (isHome && hash && hrefPath === '/' && hrefHash === hash) return true;

      // 首页无 hash：高亮 Home
      if (isHome && !hash && hrefPath === '/' && !hrefHash) return true;

      // 其他页面（如 privacy）：高亮 Home
      if (!isHome && !isProduct && !isBlog && hrefPath === '/' && !hrefHash) return true;

      return false;
    }

    // Desktop nav
    var desktopLinks = document.querySelectorAll('header nav > ul > li > a');
    desktopLinks.forEach(function (a) {
      var active = isActiveLink(a.getAttribute('href') || '');
      if (active) {
        a.classList.remove('text-heading', 'hover:text-accent-bright', 'border-transparent', 'hover:border-accent-bright');
        a.classList.add('text-accent-bright', 'border-accent-bright');
      } else {
        a.classList.remove('text-accent-bright', 'border-accent-bright');
        a.classList.add('text-heading', 'hover:text-accent-bright', 'border-transparent', 'hover:border-accent-bright');
      }
    });

    // Mobile nav
    var mobileLinks = document.querySelectorAll('#mobile-menu > ul > li > a.mobile-nav-link');
    mobileLinks.forEach(function (a) {
      var active = isActiveLink(a.getAttribute('href') || '');
      if (active) {
        a.classList.remove('text-heading', 'hover:text-accent-bright', 'hover:bg-orange-50');
        a.classList.add('text-accent-bright', 'bg-orange-50');
      } else {
        a.classList.remove('text-accent-bright', 'bg-orange-50');
        a.classList.add('text-heading', 'hover:text-accent-bright', 'hover:bg-orange-50');
      }
    });
  }

  function scheduleUpdateActiveNav() {
    updateActiveNav();
    // URL/hash 在 Swup 动画或浏览器 history 操作后可能还没落稳，延迟再同步一次
    requestAnimationFrame(function () {
      setTimeout(updateActiveNav, 50);
    });
  }

  /* ── 页面切换后刷新光标 hero 引用与追踪器计时 ── */
  window._swup.hooks.on('page:view', function () {
    scheduleUpdateActiveNav();

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
       回到首页时再恢复为相对 #xxx，让浏览器/ScrollPlugin 正常滚动。
       但 "Get a Quote" CTA 按钮除外 —— 它始终指向当前页的表单，不能改。 */
    // 注意：选择器必须同时匹配 "#xxx" 与 "/#xxx" 两种状态。
    // 产品页/博客页的静态 HTML 本就携带绝对锚点 /#xxx，若只匹配 ^="#"
    // 会导致切回首页时无法还原成相对锚点，链接停留在 /#xxx 被 swup 用
    // pushState 接管（不触发 hashchange/page:view），高亮便无法更新。
    var headerHashLinks = document.querySelectorAll('header a[href*="#"]');
    headerHashLinks.forEach(function (a) {
      // 跳过 "Get a Quote" CTA（含 nav / mobile-menu / floating / bottom-bar 四个入口）
      if (a === headerCta || a === mobileMenuCta || a === floatingCta || a === bottomBarCta) return;
      var href = a.getAttribute('href') || '';
      var hashIdx = href.indexOf('#');
      if (hashIdx === -1) return;
      var beforeHash = href.substring(0, hashIdx);
      // 仅处理纯锚点（"#xxx"）与首页锚点（"/#xxx"），跳过指向其他页面的带 hash 链接
      if (beforeHash !== '' && beforeHash !== '/') return;
      var bareHash = href.substring(hashIdx); // 归一化出纯 "#xxx"
      a.setAttribute('href', isHome ? bareHash : '/' + bareHash);
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

  /* ── 初始页面加载时同步一次导航高亮 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleUpdateActiveNav);
  } else {
    scheduleUpdateActiveNav();
  }

  /* ── 首页内锚点跳转、浏览器前进/后退时同步高亮 ── */
  window.addEventListener('hashchange', scheduleUpdateActiveNav);
  window.addEventListener('popstate', scheduleUpdateActiveNav);
})();
