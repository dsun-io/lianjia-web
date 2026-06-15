/**
 * Swup 同文档导航初始化中心
 * ─────────────────────────────────────────────
 * - 首屏 DOMContentLoaded 执行一次 initPage()
 * - 后续 Swup page:view 再次执行 initPage()
 * - #swup 外的全局元素（Header、浮动按钮、光标）只绑定一次
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Swup 配置 ── */
  var swup = new Swup({
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
        },
        offset: 0
      })
    ]
  });
  window._swup = swup;

  /* ── 统一页面初始化入口 ── */
  function initPage() {
    initAOS();
    initCursorHeroRefresh();
    initLightbox();
    initTrustCounters();
    initFAQ();
    initFieldFenceVariants();
    initYPostCards();
    initHomeProductCards();
    initFormSubmit();
    initFormAutoSelect();
    initEmailReplyToSync();
    initTurnstile();
    syncThankYouHash();
  }

  /* ── AOS（首屏已 AOS.init，此处仅刷新） ── */
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    if (prefersReducedMotion) {
      AOS.init({ disable: true });
    } else {
      AOS.refreshHard();
    }
  }

  /* ── 刷新光标系统的 hero / 视差引用 ── */
  function initCursorHeroRefresh() {
    if (typeof window._cursorRefreshHero === 'function') {
      window._cursorRefreshHero();
    }
  }

  /* ── Lightbox ── */
  function initLightbox() {
    var overlay = document.getElementById('lightbox-overlay');
    if (!overlay) return;

    var imgEl = document.getElementById('lightbox-img');
    var counterEl = document.getElementById('lightbox-counter');
    var currentGroup = [];
    var currentIndex = 0;

    var allLinks = document.querySelectorAll('[data-lightbox]');
    var groups = {};
    allLinks.forEach(function (link) {
      var g = link.getAttribute('data-lightbox');
      if (!groups[g]) groups[g] = [];
      groups[g].push(link);
    });

    function showImage() {
      if (!currentGroup[currentIndex]) return;
      imgEl.src = currentGroup[currentIndex].getAttribute('href');
      imgEl.alt = 'Product image ' + (currentIndex + 1);
      counterEl.textContent = (currentIndex + 1) + ' / ' + currentGroup.length;
    }

    allLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        currentGroup = groups[link.getAttribute('data-lightbox')] || [];
        currentIndex = Array.prototype.indexOf.call(currentGroup, link);
        if (currentIndex < 0) currentIndex = 0;
        showImage();
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        document.body.style.overflow = 'hidden';
      });
    });

    window.closeLightbox = function (e) {
      if (e) e.stopPropagation();
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
      document.body.style.overflow = '';
    };

    window.navLightbox = function (e, dir) {
      if (e) e.stopPropagation();
      currentIndex = (currentIndex + dir + currentGroup.length) % currentGroup.length;
      showImage();
    };
  }

  /* ── 信任条数字滚动 ── */
  function initTrustCounters() {
    var counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    function animateCountUp(el, target, duration) {
      var start = 0, startTime = null;
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - (1 - progress) * (1 - progress);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }

    counters.forEach(function (el) { delete el.dataset.counted; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10);
          if (!isNaN(target) && !el.dataset.counted) {
            el.dataset.counted = 'true';
            animateCountUp(el, target, 2000);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ── FAQ 手风琴 ── */
  function initFAQ() {
    var accordion = document.getElementById('faq-accordion');
    if (!accordion) return;

    var questions = accordion.querySelectorAll('.faq-question');
    questions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var answer = item.querySelector('.faq-answer');
        var arrow = btn.querySelector('.faq-arrow');
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        questions.forEach(function (otherBtn) {
          if (otherBtn === btn) return;
          var otherItem = otherBtn.closest('.faq-item');
          otherBtn.setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-answer').classList.add('hidden');
          var otherArrow = otherBtn.querySelector('.faq-arrow');
          if (otherArrow) otherArrow.classList.remove('rotate-180');
        });

        if (isOpen) {
          btn.setAttribute('aria-expanded', 'false');
          answer.classList.add('hidden');
          arrow.classList.remove('rotate-180');
        } else {
          btn.setAttribute('aria-expanded', 'true');
          answer.classList.remove('hidden');
          arrow.classList.add('rotate-180');
        }
      });
    });
  }

  /* ── Field Fence 变体卡片 + 规格标签 ── */
  function initFieldFenceVariants() {
    var cards = document.querySelectorAll('.ff-variant-card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var variant = card.getAttribute('data-variant');

        document.querySelectorAll('.ff-variant-card').forEach(function (c) {
          c.classList.remove('border-orange-500', 'shadow-md');
          c.classList.add('border-gray-200');
          c.querySelectorAll('svg').forEach(function (svg) {
            svg.classList.remove('text-orange-500');
            svg.classList.add('text-gray-400');
          });
        });
        card.classList.remove('border-gray-200');
        card.classList.add('border-orange-500', 'shadow-md');
        card.querySelectorAll('svg').forEach(function (svg) {
          svg.classList.remove('text-gray-400');
          svg.classList.add('text-orange-500');
        });

        var slideOut = (variant === 'hj') ? 'ff-gallery-hidden-right' : 'ff-gallery-hidden-left';
        var slideIn  = (variant === 'hj') ? 'ff-gallery-hidden-left' : 'ff-gallery-hidden-right';

        document.querySelectorAll('.ff-gallery').forEach(function (g) {
          g.classList.remove('ff-gallery-visible', 'ff-gallery-hidden-left', 'ff-gallery-hidden-right');
          g.style.transition = 'none';
          g.classList.add(slideOut);
        });

        var gallery = document.getElementById('gallery-' + variant);
        if (gallery) {
          gallery.classList.remove(slideOut);
          gallery.classList.add(slideIn);
          gallery.offsetHeight;
          gallery.style.transition = '';
          setTimeout(function () {
            gallery.classList.remove(slideIn);
            gallery.classList.add('ff-gallery-visible');
          }, 20);
        }

        switchTab(variant);
      });
    });

    var tabs = document.querySelectorAll('.ff-spec-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchTab(tab.getAttribute('data-tab'));
      });
    });

    function switchTab(which) {
      document.querySelectorAll('.ff-spec-tab').forEach(function (t) {
        if (t.getAttribute('data-tab') === which) {
          t.classList.remove('bg-gray-100', 'text-gray-600');
          t.classList.add('bg-orange-500', 'text-white', 'shadow-md');
        } else {
          t.classList.remove('bg-orange-500', 'text-white', 'shadow-md');
          t.classList.add('bg-gray-100', 'text-gray-600');
        }
      });
      document.querySelectorAll('.ff-spec-panel').forEach(function (p) { p.classList.add('hidden'); });
      var panel = document.getElementById('spec-panel-' + which);
      if (panel) panel.classList.remove('hidden');

      var knotSel = document.getElementById('inq-knot-type');
      if (knotSel) {
        for (var i = 0; i < knotSel.options.length; i++) {
          if (which === 'hj' && knotSel.options[i].value === 'Hinge Joint') { knotSel.selectedIndex = i; break; }
          if (which === 'rl' && knotSel.options[i].value === 'Ring Lock') { knotSel.selectedIndex = i; break; }
        }
      }
    }
  }

  /* ── Y Post 型号卡片（产品页，跳过首页 #products 内的同名卡片） ── */
  function initYPostCards() {
    var cards = document.querySelectorAll('.y-post-card');
    var hero = document.getElementById('y-post-hero');
    if (!cards.length || !hero) return;

    cards.forEach(function (card) {
      if (card.closest('#products')) return; // 首页产品卡由 initHomeProductCards 处理
      card.addEventListener('click', function () {
        hero.style.opacity = '0';
        setTimeout(function () {
          hero.src = card.getAttribute('data-img');
          hero.alt = card.getAttribute('data-alt');
          hero.style.opacity = '1';
        }, 200);

        document.querySelectorAll('.y-post-card').forEach(function (c) {
          if (c.closest('#products')) return;
          c.classList.remove('border-orange-500', 'bg-orange-50/50');
          c.classList.add('border-gray-200');
        });
        card.classList.remove('border-gray-200');
        card.classList.add('border-orange-500', 'bg-orange-50/50');
      });
    });
  }

  /* ── 首页产品卡（Field Fence / Y Post 产品图切换，仅在 #products 内） ── */
  function initHomeProductCards() {
    bindImageSwitch('#products .ff-card', '#ff-hero', true);
    bindImageSwitch('#products .y-post-card', '#y-post-hero', true);
  }

  function bindImageSwitch(cardSelector, heroSelector, toggleLabel) {
    var cards = document.querySelectorAll(cardSelector);
    var hero = document.querySelector(heroSelector);
    if (!cards.length || !hero) return;

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        hero.style.opacity = '0';
        setTimeout(function () {
          hero.src = card.getAttribute('data-img');
          hero.alt = card.getAttribute('data-alt');
          hero.style.opacity = '1';
        }, 200);

        document.querySelectorAll(cardSelector).forEach(function (c) {
          c.classList.remove('border-orange-500', 'bg-orange-50/50');
          c.classList.add('border-gray-200');
          if (toggleLabel) {
            var lbl = c.querySelector('.text-xs');
            if (lbl) { lbl.classList.remove('text-orange-600'); lbl.classList.add('text-gray-700'); }
          }
        });
        card.classList.remove('border-gray-200');
        card.classList.add('border-orange-500', 'bg-orange-50/50');
        if (toggleLabel) {
          var activeLbl = card.querySelector('.text-xs');
          if (activeLbl) { activeLbl.classList.remove('text-gray-700'); activeLbl.classList.add('text-orange-600'); }
        }
      });
    });
  }

  /* ── 询盘表单 ── */
  function initFormSubmit() {
    var form = document.getElementById('inquiry-form') || document.querySelector('#inquiry form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput = form.querySelector('[name="name"]');
      var emailInput = form.querySelector('[name="email"]');
      var firstInvalid = null;

      form.querySelectorAll('.ring-2.ring-red-500').forEach(function (el) {
        el.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
      });

      if (!nameInput || !nameInput.value.trim()) {
        if (nameInput) nameInput.classList.add('ring-2', 'ring-red-500', 'ring-offset-2');
        if (!firstInvalid) firstInvalid = nameInput;
      }
      if (!emailInput || !emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        if (emailInput) emailInput.classList.add('ring-2', 'ring-red-500', 'ring-offset-2');
        if (!firstInvalid) firstInvalid = emailInput;
      }

      var btn = form.querySelector('button[type="submit"]') || document.getElementById('submit-btn');

      if (firstInvalid) {
        firstInvalid.focus();
        if (btn) { btn.disabled = false; if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText; }
        return;
      }

      if (btn) {
        btn.disabled = true;
        if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
        btn.textContent = 'Sending...';
      }

      try { sessionStorage.setItem('lj_form_source', window.location.href); } catch (e) {}

      var data = new FormData(form);
      var dwellEl = document.getElementById('inquiry-dwell');
      if (dwellEl && window.LJTracker) {
        try { data.set('dwell_times', JSON.stringify(window.LJTracker.getAllDwell())); } catch (e) {}
      }

      if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

      setTimeout(function () {
        fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
          .catch(function () {});
      }, 100);

      form.classList.add('hidden');
      var success = document.getElementById('inquiry-success');
      if (success) success.classList.remove('hidden');
      history.pushState(null, '', '#thank-you');
      document.title = 'Thank You — Inquiry Received | [COMPANY_NAME]';
    });

    form.querySelectorAll('input, textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        input.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
      });
    });
  }

  /* ── 根据 hash 显示/隐藏表单成功态 ── */
  function syncThankYouHash() {
    var form = document.getElementById('inquiry-form') || document.querySelector('#inquiry form');
    var success = document.getElementById('inquiry-success');
    var btn = form ? (form.querySelector('button[type="submit"]') || document.getElementById('submit-btn')) : null;
    if (!form || !success) return;

    if (window.location.hash === '#thank-you') {
      form.classList.add('hidden');
      success.classList.remove('hidden');
      document.title = 'Thank You — Inquiry Received | [COMPANY_NAME]';
    } else {
      form.classList.remove('hidden');
      success.classList.add('hidden');
      if (btn) { btn.disabled = false; if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText; }
    }
  }

  /* ── 表单：自动选中来源产品 ── */
  function initFormAutoSelect() {
    var source = window.LJTracker && window.LJTracker.getCurrentProduct();
    if (!source) return;

    var sourceEl = document.getElementById('inquiry-source');
    if (sourceEl) sourceEl.value = source;

    var productSel = document.getElementById('contact-product') || document.getElementById('inq-product');
    if (productSel && window.LJTracker) {
      var name = window.LJTracker.getProductName(source);
      for (var j = 0; j < productSel.options.length; j++) {
        if (productSel.options[j].value === name) { productSel.selectedIndex = j; break; }
      }
    }
  }

  /* ── 表单：email 同步到 _replyto ── */
  function initEmailReplyToSync() {
    var emailInput = document.getElementById('contact-email') || document.getElementById('inq-email');
    var replytoInput = document.getElementById('hidden-replyto');
    if (emailInput && replytoInput) {
      emailInput.addEventListener('change', function () {
        replytoInput.value = this.value;
      });
    }
  }

  /* ── Turnstile 重渲染 ── */
  function initTurnstile() {
    var el = document.querySelector('.cf-turnstile');
    if (!el || typeof window.turnstile === 'undefined') return;
    try { window.turnstile.remove(el); } catch (e) {}
    var sitekey = el.getAttribute('data-sitekey');
    var callback = el.getAttribute('data-callback');
    if (!sitekey || sitekey === 'YOUR_TURNSTILE_SITE_KEY') return;
    window.turnstile.render(el, {
      sitekey: sitekey,
      callback: callback || undefined
    });
  }

  /* ── 移动菜单切换（全局一次绑定） ── */
  function initMobileMenu() {
    var btn = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-menu');
    var iconHamburger = document.getElementById('icon-hamburger');
    var iconClose = document.getElementById('icon-close');
    if (!btn || !menu) return;

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

  /* ── Back to Top（全局一次绑定） ── */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    var ticking = false;
    function update() {
      ticking = false;
      var show = window.scrollY > 400;
      if (show) {
        btn.classList.remove('hidden', 'opacity-0', 'translate-y-4', 'pointer-events-none');
      } else {
        btn.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
        setTimeout(function () { if (window.scrollY <= 400) btn.classList.add('hidden'); }, 300);
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ── 全局 popstate：处理 #thank-you hash 前进/后退 ── */
  window.addEventListener('popstate', syncThankYouHash);

  /* ── 键盘：Lightbox ESC / 方向键 ── */
  document.addEventListener('keydown', function (e) {
    var overlay = document.getElementById('lightbox-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return;
    if (e.key === 'Escape') window.closeLightbox();
    if (e.key === 'ArrowLeft') window.navLightbox(null, -1);
    if (e.key === 'ArrowRight') window.navLightbox(null, 1);
  });

  /* ── 首屏初始化 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (typeof AOS !== 'undefined') {
        AOS.init({ once: true, duration: 800, offset: 80 });
      }
      initPage();
      initMobileMenu();
      initBackToTop();
    });
  } else {
    if (typeof AOS !== 'undefined') {
      AOS.init({ once: true, duration: 800, offset: 80 });
    }
    initPage();
    initMobileMenu();
    initBackToTop();
  }

  /* ── Swup 生命周期 ── */
  swup.hooks.on('visit:start', function () {
    if (window.LJTracker && window.LJTracker._settleDwell) {
      window.LJTracker._settleDwell();
    }
  });

  swup.hooks.on('page:view', function () {
    // 先更新 tracker 的 currentProduct，再运行 initPage（表单自动选中依赖它）
    if (window.LJTracker && window.LJTracker._reportPageview) {
      window.LJTracker._reportPageview();
    }

    initPage();

    if (window.LJTracker && window.LJTracker._resetTimer) {
      window.LJTracker._resetTimer();
    }

    var main = document.getElementById('swup');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.removeAttribute('tabindex');
    }
  });

})();
