/**
 * 自定义光标系统 — 全局单例
 * 只初始化一次，跨 Swup 页面切换不销毁。
 * 通过 window._cursorRefreshHero() 刷新每页 #hero 与 [data-parallax] 引用。
 */
(function () {
  'use strict';

  var initialized = false;

  function initCursor() {
  /* ── 跳过触摸设备 ── */
  if ('ontouchstart' in window && matchMedia('(hover: none)').matches) return;

  /* ── 避免重复绑定全局事件；Swup page:view 再次调用时只刷新 hero 引用 ── */
  if (initialized) {
    refreshHero();
    return;
  }
  initialized = true;

  var cursorDot  = document.getElementById('cursor-dot');
  var cursorGlow = document.getElementById('cursor-glow');
  if (!cursorDot) return;

  /* ── 状态 ── */
  var raw    = { x: -100, y: -100 };   // 实际鼠标位置（viewport 坐标）
  var smooth = { x: -100, y: -100 };   // 光标平滑位置
  var glowSmooth = { x: 0, y: 0 };     // glow 平滑位置（viewport 坐标）
  var heroRect   = { t: 0, b: 0, l: 0, r: 0, w: 0, h: 0 };
  var isHero     = false;
  var ticking    = false;
  var heroDirty  = true;
  var hero       = null;
  var parallaxEls = [];
  var glowRadius = 175;                // 与 CSS #cursor-glow width/2 一致

  /* ── 缓存 hero 矩形 ── */
  function cacheHeroRect() {
    if (!hero) return;
    var r = hero.getBoundingClientRect();
    heroRect = { t: r.top, b: r.bottom, l: r.left, r: r.right, w: r.width, h: r.height };
  }

  /* ── 刷新 hero 与视差元素引用（Swup 每次 page:view 调用） ── */
  function refreshHero() {
    hero = document.getElementById('hero');
    parallaxEls = hero ? hero.querySelectorAll('[data-parallax]') : [];
    for (var j = 0; j < parallaxEls.length; j++) {
      parallaxEls[j].pFactor = parallaxEls[j].getAttribute('data-parallax');
      parallaxEls[j].style.transition = 'transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)';
    }
    if (hero) {
      // 先移除旧的 mouseleave，再绑定新的，避免重复
      hero.removeEventListener('mouseleave', resetParallax);
      hero.addEventListener('mouseleave', resetParallax);
    }
    cacheHeroRect();
    heroDirty = false;
  }

  function resetParallax() {
    for (var k = 0; k < parallaxEls.length; k++) {
      parallaxEls[k].style.transform = 'translate(0, 0)';
    }
  }

  // 暴露给 Swup
  window._cursorRefreshHero = refreshHero;

  /* ── 初始缓存 ── */
  refreshHero();

  window.addEventListener('resize', cacheHeroRect, { passive: true });
  window.addEventListener('scroll', function () { heroDirty = true; }, { passive: true });

  /* ── 鼠标跟踪 ── */
  document.addEventListener('mousemove', function (e) {
    raw.x = e.clientX;
    raw.y = e.clientY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateFrame);
    }
  }, { passive: true });

  /* ── 每帧更新 ── */
  function updateFrame() {
    ticking = false;

    if (heroDirty) { cacheHeroRect(); heroDirty = false; }

    isHero = hero
      ? (raw.y >= heroRect.t && raw.y <= heroRect.b && raw.x >= heroRect.l && raw.x <= heroRect.r)
      : false;

    /* Glow 可见性 */
    if (cursorGlow) {
      if (isHero) {
        if (!cursorGlow.classList.contains('visible')) cursorGlow.classList.add('visible');
      } else {
        if (cursorGlow.classList.contains('visible')) cursorGlow.classList.remove('visible');
      }

      /* Glow 位置 — fixed 定位下直接跟随 viewport 坐标 */
      if (isHero) {
        var gx = raw.x;
        var gy = raw.y;
        var glx = (gx - glowSmooth.x) * 0.55;
        var gly = (gy - glowSmooth.y) * 0.55;
        glowSmooth.x += Math.abs(glx) < 0.5 ? (gx - glowSmooth.x) : glx;
        glowSmooth.y += Math.abs(gly) < 0.5 ? (gy - glowSmooth.y) : gly;
        cursorGlow.style.transform = 'translate(' + (glowSmooth.x - glowRadius) + 'px, ' + (glowSmooth.y - glowRadius) + 'px)';
      }
    }

    /* Dot 位置 — 左上角对齐实际鼠标位置，再用 CSS 偏移居中 */
    var lerpX = (raw.x - smooth.x) * 0.55;
    var lerpY = (raw.y - smooth.y) * 0.55;
    smooth.x += Math.abs(lerpX) < 0.5 ? (raw.x - smooth.x) : lerpX;
    smooth.y += Math.abs(lerpY) < 0.5 ? (raw.y - smooth.y) : lerpY;
    cursorDot.style.transform = 'translate(' + smooth.x + 'px, ' + smooth.y + 'px) translate(-50%, -50%)';

    /* 视差 */
    if (isHero && parallaxEls.length) {
      var cx = (raw.x - heroRect.l - heroRect.w / 2) / heroRect.w;
      var cy = (raw.y - heroRect.t - heroRect.h / 2) / heroRect.h;
      for (var i = 0; i < parallaxEls.length; i++) {
        var f = parseFloat(parallaxEls[i].pFactor) || 0.02;
        parallaxEls[i].style.transform = 'translate(' + (-cx * f * 100) + 'px, ' + (-cy * f * 100) + 'px)';
      }
    }
  }

  /* ── Hover 检测（事件委托） ── */
  var interactiveSel = 'a, button, input, textarea, select, [role="button"], .magnetic-btn';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(interactiveSel)) cursorDot.classList.add('hovering');
  }, { passive: true });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(interactiveSel)) cursorDot.classList.remove('hovering');
  }, { passive: true });

  /* ── 磁力按钮（事件委托，跨页天然生效） ── */
  document.addEventListener('mousemove', function (e) {
    var btn = e.target.closest('.magnetic-btn');
    if (!btn) return;
    var rect = btn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top  + rect.height / 2;
    var dx = e.clientX - cx;
    var dy = e.clientY - cy;
    var maxDim = Math.max(rect.width, rect.height);
    var dist = Math.sqrt(dx * dx + dy * dy);
    var strength = Math.min(dist / maxDim, 1) * 8;
    btn.style.transform = 'translate(' + (dx / maxDim * strength) + 'px, ' + (dy / maxDim * strength) + 'px)';
  }, { passive: true });

  document.addEventListener('mouseout', function (e) {
    var btn = e.target.closest('.magnetic-btn');
    if (!btn) return;
    btn.style.transform = '';
  }, { passive: true });

  /* ── 点击波纹 ── */
  document.addEventListener('click', function (e) {
    var ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top  = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 700);
  });

  /* ── 光标可见性 ── */
  document.addEventListener('mouseleave', function () { cursorDot.style.opacity = '0'; });
  document.addEventListener('mouseenter', function () { cursorDot.style.opacity = '1'; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursor);
  } else {
    initCursor();
  }
})();
