/**
 * Product Type / Spec Card Switching — 全局单例，兼容 Swup 页面切换。
 *
 * 处理的卡片类型：
 *   - .y-post-card          （data-img / data-alt）切换 #y-post-hero
 *   - .ff-card              （data-img / data-alt）切换 #ff-hero
 *   - .cl-card              （data-img / data-alt）切换 #cl-hero
 *   - .ff-variant-card      （data-variant）切换 Field Fence 画廊 + 规格面板
 *   - .ff-spec-tab          （data-tab）切换规格标签页
 *
 * 使用事件委托监听 #swup 或 document 上的点击。
 */
(function () {
  'use strict';

  if (window.__ljProductCardsInit) return;
  window.__ljProductCardsInit = true;

  var heroImageTimeout = null;

  function switchHeroImage(heroSelector, card) {
    var hero = document.querySelector(heroSelector);
    if (!hero) return;

    var newSrc = card.getAttribute('data-img');
    var newAlt = card.getAttribute('data-alt');
    if (!newSrc) return;

    hero.style.opacity = '0';
    clearTimeout(heroImageTimeout);
    heroImageTimeout = setTimeout(function () {
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
    var next = document.getElementById('gallery-' + variant);
    var current = document.querySelector('.ff-gallery-visible');
    if (!next || next === current) return;
    var goRight = variant === 'rl'; // RL 在右侧

    // 旧画廊朝点击的反方向离场
    if (current) {
      current.classList.remove('ff-gallery-visible');
      current.classList.add(goRight ? 'ff-gallery-hidden-left' : 'ff-gallery-hidden-right');
    }
    // 新画廊从对侧进场
    next.classList.remove('ff-gallery-hidden-left', 'ff-gallery-hidden-right');
    next.classList.add('ff-gallery-visible');

    // 卡片高亮
    var cardEl = document.getElementById('variant-' + variant);
    if (!cardEl) return;
    setActiveCard(document.querySelectorAll('.ff-variant-card'), cardEl, { addShadow: true, iconColorToggle: true });

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

  function preloadCardImages() {
    // 预加载所有选项卡/卡片对应的大图，避免首次切换时出现加载延迟
    ['.ff-card', '.cl-card', '.y-post-card'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (card) {
        var src = card.getAttribute('data-img');
        if (src) {
          var img = new Image();
          img.src = src;
        }
      });
    });
  }

  function init() {
    // 页面初始化时预加载卡片大图
    preloadCardImages();

    var container = document.getElementById('swup') || document.body;

    if (container.__ljProductCardsClickHandler) {
      container.removeEventListener('click', container.__ljProductCardsClickHandler);
    }

    container.__ljProductCardsClickHandler = function (e) {
      var card = e.target.closest('.y-post-card, .ff-card, .cl-card, .ff-variant-card, .ff-spec-tab');
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

      // Chain Link Fence view cards (home page)
      if (card.classList.contains('cl-card')) {
        e.preventDefault();
        switchHeroImage('#cl-hero', card);
        setActiveCard(document.querySelectorAll('.cl-card'), card, { labelSelector: '.text-xs' });
        return;
      }

      // Field Fence variant chooser cards
      if (card.classList.contains('ff-variant-card')) {
        e.preventDefault();
        var variant = card.getAttribute('data-variant');
        if (!variant) return;
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
