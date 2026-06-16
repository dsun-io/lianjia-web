/**
 * Image Lightbox — 全局单例，兼容 Swup 页面切换。
 *
 * 使用事件委托监听 [data-lightbox] 链接。
 * 优先复用页面内 #lightbox-overlay；若不存在则动态创建。
 */
(function () {
  'use strict';

  if (window.__ljLightboxInit) return;
  window.__ljLightboxInit = true;

  var overlay, imgEl, counterEl, closeBtn, prevBtn, nextBtn;
  var currentGroup = [];
  var currentIndex = 0;
  var bodyOverflow = '';

  function ensureOverlay() {
    overlay = document.getElementById('lightbox-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lightbox-overlay';
      overlay.className = 'fixed inset-0 z-[9999] bg-black/90 hidden items-center justify-center p-4 cursor-pointer';
      overlay.innerHTML =
        '<button id="lightbox-close" class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white text-3xl font-light hover:text-orange-400 transition-colors cursor-pointer" aria-label="Close lightbox">&times;</button>' +
        '<button id="lightbox-prev" class="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-white text-2xl hover:text-orange-400 transition-colors cursor-pointer bg-white/10 rounded-full" aria-label="Previous image">&lsaquo;</button>' +
        '<img id="lightbox-img" src="" alt="" class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl select-none" onclick="event.stopPropagation()">' +
        '<button id="lightbox-next" class="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-white text-2xl hover:text-orange-400 transition-colors cursor-pointer bg-white/10 rounded-full" aria-label="Next image">&rsaquo;</button>' +
        '<p id="lightbox-counter" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm"></p>';
      document.body.appendChild(overlay);
    }

    imgEl = overlay.querySelector('#lightbox-img');
    counterEl = overlay.querySelector('#lightbox-counter');
    closeBtn = overlay.querySelector('#lightbox-close');
    prevBtn = overlay.querySelector('#lightbox-prev');
    nextBtn = overlay.querySelector('#lightbox-next');

    // 移除旧的内联 onclick（如果存在）并绑定事件
    overlay.removeAttribute('onclick');
    if (closeBtn) closeBtn.removeAttribute('onclick');
    if (prevBtn) prevBtn.removeAttribute('onclick');
    if (nextBtn) nextBtn.removeAttribute('onclick');

    if (overlay.__ljLightboxBound) return;
    overlay.__ljLightboxBound = true;

    overlay.addEventListener('click', closeLightbox);
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', function (e) { navigate(e, -1); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { navigate(e, 1); });
  }

  function buildGroups() {
    var groups = {};
    document.querySelectorAll('[data-lightbox]').forEach(function (link) {
      var g = link.getAttribute('data-lightbox');
      if (!g) return;
      if (!groups[g]) groups[g] = [];
      groups[g].push(link);
    });
    return groups;
  }

  function openLightbox(link) {
    ensureOverlay();
    var groups = buildGroups();
    var groupName = link.getAttribute('data-lightbox');
    currentGroup = groups[groupName] || [link];
    currentIndex = currentGroup.indexOf(link);
    if (currentIndex < 0) currentIndex = 0;

    showImage();
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function showImage() {
    if (!currentGroup.length || !imgEl) return;
    var link = currentGroup[currentIndex];
    imgEl.src = link.getAttribute('href') || link.getAttribute('data-href') || '';
    var thumb = link.querySelector('img');
    imgEl.alt = (thumb && thumb.getAttribute('alt')) || 'Product image ' + (currentIndex + 1);
    if (counterEl) {
      counterEl.textContent = (currentIndex + 1) + ' / ' + currentGroup.length;
    }
  }

  function closeLightbox(e) {
    if (e) e.stopPropagation();
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    document.body.style.overflow = bodyOverflow;
  }

  function navigate(e, dir) {
    if (e) e.stopPropagation();
    if (!currentGroup.length) return;
    currentIndex = (currentIndex + dir + currentGroup.length) % currentGroup.length;
    showImage();
  }

  function onKeyDown(e) {
    if (!overlay || overlay.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(null, -1);
    if (e.key === 'ArrowRight') navigate(null, 1);
  }

  function init() {
    var container = document.getElementById('swup') || document.body;

    if (container.__ljLightboxClickHandler) {
      container.removeEventListener('click', container.__ljLightboxClickHandler);
    }

    // 防止 Swup 把灯箱链接当作普通页面链接拦截
    container.querySelectorAll('[data-lightbox]').forEach(function (link) {
      if (!link.hasAttribute('data-no-swup')) {
        link.setAttribute('data-no-swup', '');
      }
    });

    container.__ljLightboxClickHandler = function (e) {
      var link = e.target.closest('[data-lightbox]');
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      openLightbox(link);
    };

    container.addEventListener('click', container.__ljLightboxClickHandler);

    if (!document.__ljLightboxKeyHandler) {
      document.__ljLightboxKeyHandler = true;
      document.addEventListener('keydown', onKeyDown);
    }
  }

  window.LJLightbox = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
