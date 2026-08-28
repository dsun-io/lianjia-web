/**
 * Back Link — 统一返回上级按钮
 * ─────────────────────────────────────────────
 * 根据页面类型自动在内容区块左上角注入 sticky 返回按钮。
 * 新页面只需引入本脚本即可生效，无需复制 HTML。
 *
 * 使用方式：
 *   1. 在页面底部引入 <script src="/assets/js/back-link.js"></script>
 *   2. 如需自定义返回目标，在 #swup 内任意元素加 data-back-link/data-back-label
 *      例如：<article data-back-link="/blog/field-fence.html" data-back-label="Back to Field Fence">
 *   3. 文章页可在 <article data-category="field-fence"> 上标注分类，脚本会自动生成返回链接。
 */
(function () {
  'use strict';

  function capitalize(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function mountBackLink() {
    var swup = document.getElementById('swup');
    if (!swup) return;

    // 避免重复注入：先移除已注入的返回按钮
    var existing = swup.querySelectorAll('.back-link-sticky');
    existing.forEach(function (el) { el.remove(); });

    // 确定返回目标与文案
    var href = '';
    var label = '';
    var explicit = swup.querySelector('[data-back-link]');

    if (explicit) {
      href = explicit.getAttribute('data-back-link') || '';
      label = explicit.getAttribute('data-back-label') || 'Back';
    } else {
      var path = window.location.pathname;
      var file = path.split('/').pop().replace(/\.html$/, '');
      var categoryPages = { 'field-fence': true, 'chain-link-fence': true, 'y-post': true, 'barbed-wire': true };

      // blog 首页不需要返回按钮
      if (path === '/blog' || path === '/blog/' || path === '/blog/index' || path === '/blog/index.html') {
        return;
      }

      if (path.indexOf('/blog/') === 0) {
        if (categoryPages[file]) {
          href = '/blog/';
          label = 'Back to Blog';
        } else {
          // 文章页优先读取 <article data-category>
          var article = swup.querySelector('article[data-category]');
          if (article) {
            var cat = article.getAttribute('data-category');
            href = '/blog/' + cat + '.html';
            label = 'Back to ' + capitalize(cat);
          } else {
            href = '/blog/';
            label = 'Back to Blog';
          }
        }
      } else if (path.indexOf('/products/') === 0) {
        href = '/#products';
        label = 'Back to Products';
      } else {
        // 其它页面不需要返回按钮
        return;
      }
    }

    if (!href) return;

    // 寻找挂载点：显式指定 > 文章页（目录栏 / 正文栏）> 第二区块
    var mount = null;
    var explicitMount = swup.querySelector('[data-back-mount]');
    if (explicitMount) {
      mount = explicitMount;
    } else {
      var article = swup.querySelector('article');
      if (article) {
        // 文章页带左侧目录（aside.sticky）时：把按钮放进目录的 sticky 容器内、目录标题之前，
        // 按钮与目录同属一个 sticky 区块一起滚动，按钮永远位于目录上方，不会相互遮挡。
        var asideSticky = article.querySelector('aside .sticky');
        if (asideSticky) {
          // 桌面端：注入到目录容器顶部（aside 在移动端隐藏，按钮随之隐藏）
          var desktop = buildWrapper(href, label, false);
          asideSticky.insertBefore(desktop, asideSticky.firstChild);
          fadeIn(desktop);

          // 移动端：目录栏隐藏，需在正文栏顶部再注入一份（桌面端用 lg:hidden 隐藏）
          var bodyMount = article.querySelector('.article-body, .max-w-3xl, .max-w-4xl') ||
            article.querySelector('.max-w-7xl');
          if (bodyMount) {
            var mobile = buildWrapper(href, label, true);
            mobile.classList.add('lg:hidden');
            bodyMount.insertBefore(mobile, bodyMount.firstChild);
            fadeIn(mobile);
          }
          return; // 已注入完成
        }
        // 无目录栏的文章页：挂到正文栏，避免整宽 sticky 遮挡
        mount = article.querySelector('.article-body, .max-w-3xl, .max-w-4xl');
        if (!mount) mount = article.querySelector('.max-w-7xl');
      }
      if (!mount) {
        var sections = swup.querySelectorAll('section');
        // 跳过首屏 hero，取第二个内容区块
        if (sections.length > 1) {
          mount = sections[1].querySelector('.max-w-7xl, .max-w-3xl, .max-w-4xl');
        }
      }
    }
    if (!mount) return;

    var wrapper = buildWrapper(href, label, true);
    mount.insertBefore(wrapper, mount.firstChild);
    fadeIn(wrapper);
  }

  // 构建返回按钮；isSticky 决定是否启用按钮自身的 sticky 定位
  function buildWrapper(href, label, isSticky) {
    var wrapper = document.createElement('div');
    wrapper.className = 'back-link-sticky mb-4' + (isSticky ? ' sticky' : '');
    wrapper.style.cssText = (isSticky ? 'top:5rem;z-index:40;' : '') +
      'opacity:0;transition:opacity .2s ease';
    wrapper.innerHTML =
      '<a href="' + href + '" class="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-sm border border-gray-100 text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors">' +
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>' +
      label +
      '</a>';
    return wrapper;
  }

  // 在下一帧淡入，确保按钮在上方内容渲染后才出现，避免闪烁
  function fadeIn(el) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity = '1';
      });
    });
  }

  function init() {
    // 等上方内容先渲染，再注入按钮
    requestAnimationFrame(function () {
      requestAnimationFrame(mountBackLink);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Swup 无刷新切换后重新挂载
  function hookSwup() {
    if (window._swup && window._swup.hooks) {
      window._swup.hooks.on('page:view', init);
    } else {
      document.addEventListener('swup:page:view', init);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookSwup);
  } else {
    hookSwup();
  }
})();
