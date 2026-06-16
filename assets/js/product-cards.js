/**
 * Product Type / Spec Card Switching — 全局单例，兼容 Swup 页面切换。
 *
 * 处理的卡片类型：
 *   - .y-post-card          （data-img / data-alt）切换 #y-post-hero
 *   - .ff-card              （data-img / data-alt）切换 #ff-hero
 *   - .ff-variant-card      （data-variant）切换 Field Fence 画廊 + 规格面板
 *   - .ff-spec-tab          （data-tab）切换规格标签页
 *
 * 使用事件委托监听 #swup 或 document 上的点击。
 */
(function () {
  'use strict';

  if (window.__ljProductCardsInit) return;
  window.__ljProductCardsInit = true;

  function switchHeroImage(heroSelector, card) {
    var hero = document.querySelector(heroSelector);
    if (!hero) return;

    var newSrc = card.getAttribute('data-img');
    var newAlt = card.getAttribute('data-alt');
    if (!newSrc) return;

    hero.style.opacity = '0';
    setTimeout(function () {
      hero.src = newSrc;
      if (newAlt) hero.alt = newAlt;
      hero.style.opacity = '1';
    }, 200);
  }

  function setActiveCard(cards, activeCard, options) {
    options = options || {};
    cards.forEach(function (c) {
      c.classList.remove('border-orange-500', 'bg-orange-50/50', 'shadow-md');
      c.classList.add('border-gray-200');

      if (options.labelSelector) {
        var lbl = c.querySelector(options.labelSelector);
        if (lbl) {
          lbl.classList.remove('text-orange-600');
          lbl.classList.add('text-gray-700');
        }
      }

      if (options.iconColorToggle) {
        c.querySelectorAll('svg').forEach(function (svg) {
          svg.classList.remove('text-orange-500');
          svg.classList.add('text-gray-400');
        });
      }
    });

    activeCard.classList.remove('border-gray-200');
    activeCard.classList.add('border-orange-500', 'bg-orange-50/50');
    if (options.addShadow) activeCard.classList.add('shadow-md');

    if (options.labelSelector) {
      var activeLbl = activeCard.querySelector(options.labelSelector);
      if (activeLbl) {
        activeLbl.classList.remove('text-gray-700');
        activeLbl.classList.add('text-orange-600');
      }
    }

    if (options.iconColorToggle) {
      activeCard.querySelectorAll('svg').forEach(function (svg) {
        svg.classList.remove('text-gray-400');
        svg.classList.add('text-orange-500');
      });
    }
  }

  function switchFieldFenceVariant(variant) {
    var active = document.querySelector('.ff-variant-card.border-orange-500');
    var previousVariant = active ? active.getAttribute('data-variant') : null;

    // 根据点击卡片相对于当前激活卡片的位置决定进出方向：
    // 点右侧卡片 → 新画廊从右往左进入；点左侧卡片 → 新画廊从左往右进入
    var goRight = false;
    if (previousVariant && previousVariant !== variant) {
      var cards = Array.from(document.querySelectorAll('.ff-variant-card'));
      var prevIdx = cards.findIndex(function (c) { return c.getAttribute('data-variant') === previousVariant; });
      var nextIdx = cards.findIndex(function (c) { return c.getAttribute('data-variant') === variant; });
      goRight = nextIdx > prevIdx;
    }

    var currentGallery = document.querySelector('.ff-gallery-visible');
    var nextGallery = document.getElementById('gallery-' + variant);
    if (!nextGallery || nextGallery === currentGallery) return;

    // 旧、新画廊初始位置放在同侧，运动时才会相向而过、方向相反
    // 点右侧卡片 → 两者初始都在右侧，旧内容向右离开，新内容从右往左进入
    // 点左侧卡片 → 两者初始都在左侧，旧内容向左离开，新内容从左往右进入
    var hiddenClass = goRight ? 'ff-gallery-hidden-right' : 'ff-gallery-hidden-left';

    if (currentGallery) {
      currentGallery.classList.remove('ff-gallery-visible');
      currentGallery.classList.add(hiddenClass);
    }

    nextGallery.classList.remove('ff-gallery-visible', 'ff-gallery-hidden-left', 'ff-gallery-hidden-right');
    nextGallery.classList.add(hiddenClass);
    nextGallery.offsetHeight; // force reflow
    nextGallery.classList.remove(hiddenClass);
    nextGallery.classList.add('ff-gallery-visible');

    switchSpecTab(variant);
  }

  function switchSpecTab(which) {
    var tabs = document.querySelectorAll('.ff-spec-tab');
    if (!tabs.length) return;

    tabs.forEach(function (t) {
      if (t.getAttribute('data-tab') === which) {
        t.classList.remove('bg-gray-100', 'text-gray-600', 'hover:bg-gray-200');
        t.classList.add('bg-orange-500', 'text-white', 'shadow-md');
      } else {
        t.classList.remove('bg-orange-500', 'text-white', 'shadow-md');
        t.classList.add('bg-gray-100', 'text-gray-600', 'hover:bg-gray-200');
      }
    });

    document.querySelectorAll('.ff-spec-panel').forEach(function (p) {
      p.classList.add('hidden');
    });
    var panel = document.getElementById('spec-panel-' + which);
    if (panel) panel.classList.remove('hidden');

    var knotSel = document.getElementById('inq-knot-type');
    if (knotSel) {
      for (var i = 0; i < knotSel.options.length; i++) {
        if (which === 'hj' && knotSel.options[i].value === 'Hinge Joint') {
          knotSel.selectedIndex = i;
          break;
        }
        if (which === 'rl' && knotSel.options[i].value === 'Ring Lock') {
          knotSel.selectedIndex = i;
          break;
        }
      }
    }
  }

  function init() {
    var container = document.getElementById('swup') || document.body;

    if (container.__ljProductCardsClickHandler) {
      container.removeEventListener('click', container.__ljProductCardsClickHandler);
    }

    container.__ljProductCardsClickHandler = function (e) {
      var card = e.target.closest('.y-post-card, .ff-card, .ff-variant-card, .ff-spec-tab');
      if (!card) return;

      // Y Post cards
      if (card.classList.contains('y-post-card')) {
        e.preventDefault();
        switchHeroImage('#y-post-hero', card);
        setActiveCard(document.querySelectorAll('.y-post-card'), card);
        return;
      }

      // Field Fence knot-type cards (home page)
      if (card.classList.contains('ff-card')) {
        e.preventDefault();
        switchHeroImage('#ff-hero', card);
        setActiveCard(document.querySelectorAll('.ff-card'), card, { labelSelector: '.text-xs' });
        return;
      }

      // Field Fence variant chooser cards
      if (card.classList.contains('ff-variant-card')) {
        e.preventDefault();
        var variant = card.getAttribute('data-variant');
        if (!variant) return;
        setActiveCard(document.querySelectorAll('.ff-variant-card'), card, { addShadow: true, iconColorToggle: true });
        switchFieldFenceVariant(variant);
        return;
      }

      // Field Fence spec tabs
      if (card.classList.contains('ff-spec-tab')) {
        e.preventDefault();
        var tab = card.getAttribute('data-tab');
        if (tab) switchSpecTab(tab);
      }
    };

    container.addEventListener('click', container.__ljProductCardsClickHandler);
  }

  window.LJProductCards = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
