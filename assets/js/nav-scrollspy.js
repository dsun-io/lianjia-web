/**
 * nav-scrollspy —— 页面内滚动导航高亮（GEO/UX 共享组件）
 * ─────────────────────────────────────────────────────────────
 * 职责：页面滚动经过某个 section 时，高亮 header 导航中对应的锚点链接。
 * 与 swup-init.js 的 updateActiveNav() 分工：
 *   - updateActiveNav() 负责「页面级」高亮（当前在哪个页面）；
 *   - 本组件负责「页面内」高亮（当前在页面的哪个 section）。
 * 协作方式：
 *   - 本组件只在首页（存在 header 锚点对应 section 的页面）生效；
 *   - 判定线在视口 40% 处：section 覆盖该线即视为当前区块；
 *   - 页面顶部/底部无 section 覆盖判定线时，派发 lj:nav-restore 事件，
 *     由 swup-init 恢复页面级高亮。
 * 实现说明：滚动事件 + rAF 节流 + getBoundingClientRect 判定，而非 IntersectionObserver
 *   —— observer 的 entries 只包含状态变化的元素，相邻 section 交界时会误判
 *   「无活动区块」，导致高亮错误回落（用户反馈不跟随的根因）。
 * 使用约定（docs/前端组件规范.md）：在 swup-init.js 之前引入。
 */
(function () {
  'use strict';

  var navLinks = [];   // header 中指向本页 section 的导航链接（桌面 + 移动）
  var allNavLinks = []; // 全部桌面导航链接（含 Home 等非锚点项，用于清除残留高亮）
  var sections = [];   // 与 navLinks 一一对应的目标 section
  var lastActive = null; // 当前高亮的导航链接（null = 未接管）
  var ticking = false; // rAF 节流标记

  var isHome = function () {
    var p = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    return p === '';
  };

  /* 收集 header 导航中带锚点的链接及其目标 section（排除 Get a Quote CTA） */
  function collect() {
    navLinks = [];
    allNavLinks = [];
    sections = [];
    var candidates = document.querySelectorAll(
      'header nav > ul > li > a[href*="#"]:not(.bg-accent), ' +
      'header #mobile-menu a.mobile-nav-link[href*="#"]'
    );
    candidates.forEach(function (a) {
      var href = (a.getAttribute('href') || '').trim();
      var m = href.match(/#([\w-]+)$/);
      if (!m) return;
      var sec = document.getElementById(m[1]);
      if (!sec) return;
      navLinks.push(a);
      sections.push(sec);
    });
    // 全部桌面导航项：scrollspy 高亮 section 时需同步清除 Home 等非锚点项的高亮
    document.querySelectorAll('header nav > ul > li > a').forEach(function (a) {
      allNavLinks.push(a);
    });
  }

  /* 与 swup-init.updateActiveNav 完全一致的 class 操作，不另造样式 */
  function styleLink(a, active) {
    if (a.classList.contains('mobile-nav-link')) {
      // 移动导航样式（与 updateActiveNav 移动分支一致）
      if (active) {
        a.classList.remove('text-heading', 'hover:text-accent-bright', 'hover:bg-orange-50');
        a.classList.add('text-accent-bright', 'bg-orange-50');
      } else {
        a.classList.remove('text-accent-bright', 'bg-orange-50');
        a.classList.add('text-heading', 'hover:text-accent-bright', 'hover:bg-orange-50');
      }
    } else {
      // 桌面导航样式（与 updateActiveNav 桌面分支一致）
      if (active) {
        a.classList.remove('text-heading', 'hover:text-accent-bright', 'border-transparent', 'hover:border-accent-bright');
        a.classList.add('text-accent-bright', 'border-accent-bright');
      } else {
        a.classList.remove('text-accent-bright', 'border-accent-bright');
        a.classList.add('text-heading', 'hover:text-accent-bright', 'border-transparent', 'hover:border-accent-bright');
      }
    }
  }

  function applyHighlight(activeEl) {
    // 锚点导航项（桌面 + 移动）按 active 判定
    navLinks.forEach(function (a) {
      styleLink(a, a === activeEl);
    });
    // 非锚点导航项（如 Home）：scrollspy 接管期间一律清除，避免双高亮残留
    allNavLinks.forEach(function (a) {
      if (navLinks.indexOf(a) !== -1) return;
      styleLink(a, false);
    });
  }

  /* 判定线在视口 40% 处：自上而下第一个覆盖判定线的 section 即当前区块。
     相邻 section 交界时只有前一段完全越过判定线才切换高亮，不会误判空白。 */
  function computeAndApply() {
    if (navLinks.length === 0) return;
    var line = window.innerHeight * 0.4;
    var active = null;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= line && r.bottom >= line) { active = navLinks[i]; break; }
    }
    if (active === lastActive) return; // 状态无变化，避免事件风暴
    lastActive = active;
    if (active) {
      applyHighlight(active);
    } else {
      // 页面顶部 hero / 极底部：交还高亮权给 swup-init（hash 高亮）
      window.dispatchEvent(new CustomEvent('lj:nav-restore'));
    }
  }

  /* 滚动事件 → rAF 节流，一帧内只计算一次 */
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      computeAndApply();
      ticking = false;
    });
  }

  function init() {
    lastActive = null;
    ticking = false;
    collect();

    // 非首页或没有可跟踪的 section：本组件不接管，保持页面级高亮
    if (!isHome() || navLinks.length === 0) {
      window.removeEventListener('scroll', onScroll);
      return;
    }
    // 同一函数引用重复 add 会被浏览器去重，无副作用
    window.addEventListener('scroll', onScroll, { passive: true });
    computeAndApply();
  }

  // 页面加载即初始化（swup 容器内容就绪后 swup-init 也会再次调用 init）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.LJScrollspy = { init: init };
})();
