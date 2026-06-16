/**
 * Mobile menu toggle — 全局单例，兼容 Swup 页面切换。
 */
(function () {
  'use strict';

  // 防止 Swup 替换容器后脚本被重新执行导致重复监听。
  if (window.__ljMobileMenuInit) return;
  window.__ljMobileMenuInit = true;

  function init() {
    var btn = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    var iconHamburger = document.getElementById('icon-hamburger');
    var iconClose = document.getElementById('icon-close');

    // Swup 切换后菜单 DOM 在容器外保留，强制重置为关闭状态
    menu.style.maxHeight = '0px';
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    if (iconHamburger) iconHamburger.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');

    if (window.__ljMobileMenuReady) return;
    window.__ljMobileMenuReady = true;

    function toggleMenu() {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        menu.style.maxHeight = '0px';
        btn.setAttribute('aria-expanded', 'false');
        if (iconHamburger) iconHamburger.classList.remove('hidden');
        if (iconClose) iconClose.classList.add('hidden');
        setTimeout(function () {
          if (btn.getAttribute('aria-expanded') === 'false') menu.classList.add('hidden');
        }, 300);
      } else {
        menu.classList.remove('hidden');
        menu.offsetHeight;
        menu.style.maxHeight = menu.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
        if (iconHamburger) iconHamburger.classList.add('hidden');
        if (iconClose) iconClose.classList.remove('hidden');
      }
    }

    btn.addEventListener('click', toggleMenu);

    var navLinks = menu.querySelectorAll('.mobile-nav-link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (btn.getAttribute('aria-expanded') === 'true') toggleMenu();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        toggleMenu();
        btn.focus();
      }
    });
  }

  window.LJMobileMenu = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
