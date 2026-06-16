/**
 * FAQ Accordion — 全局单例，兼容 Swup 页面切换。
 * 使用事件委托监听 #swup 容器内的 .faq-question 点击。
 */
(function () {
  'use strict';

  if (window.__ljFAQInit) return;
  window.__ljFAQInit = true;

  function init() {
    // 委托容器：优先使用 #swup，回退到 document
    var container = document.getElementById('swup') || document.body;

    // 清理旧监听器（如果存在）
    if (container.__ljFAQClickHandler) {
      container.removeEventListener('click', container.__ljFAQClickHandler);
    }

    container.__ljFAQClickHandler = function (e) {
      var btn = e.target.closest('.faq-question');
      if (!btn) return;

      var item = btn.closest('.faq-item');
      if (!item) return;

      var answer = item.querySelector('.faq-answer');
      var arrow = btn.querySelector('.faq-arrow');
      if (!answer) return;

      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      var accordion = document.getElementById('faq-accordion');

      // 手风琴模式：同一容器内只能展开一个
      if (accordion && accordion.contains(btn)) {
        var questions = accordion.querySelectorAll('.faq-question');
        questions.forEach(function (otherBtn) {
          if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            var otherItem = otherBtn.closest('.faq-item');
            if (otherItem) {
              var otherAnswer = otherItem.querySelector('.faq-answer');
              if (otherAnswer) otherAnswer.classList.add('hidden');
            }
            var otherArrow = otherBtn.querySelector('.faq-arrow');
            if (otherArrow) otherArrow.classList.remove('rotate-180');
          }
        });
      }

      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        answer.classList.add('hidden');
        if (arrow) arrow.classList.remove('rotate-180');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.remove('hidden');
        if (arrow) arrow.classList.add('rotate-180');
      }
    };

    container.addEventListener('click', container.__ljFAQClickHandler);
  }

  window.LJFAQ = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
