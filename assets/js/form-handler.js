/**
 * Contact / Quote Form Handler — 全局单例，兼容 Swup 页面切换。
 *
 * 使用事件委托处理以下表单提交：
 *   - #inquiry-form（首页）
 *   - #inquiry form（产品页）
 *
 * 同时处理：
 *   - 邮箱同步到 _replyto
 *   - LJTracker 来源页 / 产品自动选择
 *   - "Submit Another Inquiry" 重置按钮
 */
(function () {
  'use strict';

  if (window.__ljFormHandlerInit) return;
  window.__ljFormHandlerInit = true;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function clearErrors(form) {
    if (!form) return;
    form.querySelectorAll('.ring-2.ring-red-500').forEach(function (el) {
      el.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
    });
  }

  function validateRequired(form) {
    var nameInput = form.querySelector('[name="name"]');
    var emailInput = form.querySelector('[name="email"]');
    var firstInvalid = null;

    clearErrors(form);

    if (!nameInput || !nameInput.value.trim()) {
      if (nameInput) nameInput.classList.add('ring-2', 'ring-red-500', 'ring-offset-2');
      if (!firstInvalid) firstInvalid = nameInput;
    }

    if (!emailInput || !emailInput.value.trim() || !EMAIL_RE.test(emailInput.value.trim())) {
      if (emailInput) emailInput.classList.add('ring-2', 'ring-red-500', 'ring-offset-2');
      if (!firstInvalid) firstInvalid = emailInput;
    }

    return firstInvalid;
  }

  function setSubmitting(btn, isSubmitting) {
    if (!btn) return;
    if (isSubmitting) {
      btn.disabled = true;
      btn.textContent = 'Sending...';
    } else {
      btn.disabled = false;
      btn.textContent = 'Send Inquiry';
    }
  }

  function collectFormData(form) {
    var data = new FormData(form);
    var dwellEl = form.querySelector('[name="dwell_times"], #inquiry-dwell');
    if (dwellEl && window.LJTracker) {
      try {
        data.set('dwell_times', JSON.stringify(window.LJTracker.getAllDwell()));
      } catch (e) {}
    }
    return data;
  }

  function showSuccess(form) {
    if (!form) return;
    var success = document.getElementById('inquiry-success');
    var btn = form.querySelector('button[type="submit"]');

    form.classList.add('hidden');
    if (success) success.classList.remove('hidden');
    document.title = 'Thank You — Inquiry Received | [COMPANY_NAME]';
    setSubmitting(btn, false);

    if (form.id === 'inquiry-form') {
      history.pushState(null, '', '#thank-you');
    } else {
      history.replaceState(null, '', window.location.pathname);
    }
  }

  function showError(form, message) {
    if (!form) return;
    var btn = form.querySelector('button[type="submit"]');
    setSubmitting(btn, false);

    var existing = form.querySelector('.lj-form-error');
    if (!existing) {
      existing = document.createElement('p');
      existing.className = 'lj-form-error text-red-400 text-sm mt-3 flex items-center gap-2';
      existing.innerHTML = '<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span></span>';
      btn.parentNode.insertBefore(existing, btn.nextSibling);
    }
    existing.querySelector('span').textContent = message || 'Submission failed. Please check your connection and try again.';
  }

  function resetForm(resetBtn) {
    var form;
    var homeForm = document.getElementById('inquiry-form');
    var productForm = document.querySelector('#inquiry form');

    if (resetBtn && resetBtn.getAttribute('data-reset-form')) {
      var selector = resetBtn.getAttribute('data-reset-form');
      form = document.querySelector(selector);
    }

    if (!form) form = homeForm || productForm;
    if (!form) return;

    var success = document.getElementById('inquiry-success');
    if (success) success.classList.add('hidden');
    form.classList.remove('hidden');

    var btn = form.querySelector('button[type="submit"]');
    setSubmitting(btn, false);

    // 重置表单时保持当前滚动位置，不要自动滚动
    if (form.id === 'inquiry-form') {
      history.replaceState(null, '', '#contact');
      document.title = 'Field Fence & Chain Link Fence Manufacturer in China | [COMPANY_NAME]';
    } else {
      history.replaceState(null, '', '');
    }
  }

  function syncEmailToReplyto(email) {
    var replytoInput = document.getElementById('hidden-replyto');
    if (replytoInput) replytoInput.value = email;
  }

  function applyTrackerSource() {
    if (!window.LJTracker) return;
    var source = window.LJTracker.getCurrentProduct && window.LJTracker.getCurrentProduct();
    if (!source) return;

    var sourceEl = document.getElementById('inquiry-source');
    if (sourceEl) sourceEl.value = source;

    var productSel = document.getElementById('contact-product');
    var nameFn = window.LJTracker.getProductName;
    if (productSel && nameFn) {
      var name = nameFn(source);
      for (var i = 0; i < productSel.options.length; i++) {
        if (productSel.options[i].value === name) {
          productSel.selectedIndex = i;
          break;
        }
      }
    }
  }

  function onSubmit(e) {
    var form = e.target;
    if (!form || (!form.id && !form.closest('#inquiry'))) return;
    if (form.id !== 'inquiry-form' && !form.closest('#inquiry')) return;

    e.preventDefault();

    var firstInvalid = validateRequired(form);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    setSubmitting(btn, true);

    try {
      sessionStorage.setItem('lj_form_source', window.location.href);
    } catch (err) {}

    var data = collectFormData(form);

    // 保持当前滚动位置，不要自动回到页面顶部
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    setTimeout(function () {
      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            showSuccess(form);
          } else {
            showError(form, 'Submission failed (server error). Please try again.');
          }
        })
        .catch(function () {
          showError(form, 'Network error. Please check your connection and try again.');
        });
    }, 100);
  }

  function onInput(e) {
    var input = e.target;
    if (!input) return;
    input.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
  }

  function onHashState() {
    var homeForm = document.getElementById('inquiry-form');
    var success = document.getElementById('inquiry-success');
    var btn = homeForm ? homeForm.querySelector('button[type="submit"]') : null;

    if (!homeForm) return;

    if (window.location.hash === '#thank-you') {
      homeForm.classList.add('hidden');
      if (success) success.classList.remove('hidden');
      document.title = 'Thank You — Inquiry Received | [COMPANY_NAME]';
    } else {
      homeForm.classList.remove('hidden');
      if (success) success.classList.add('hidden');
      setSubmitting(btn, false);
      document.title = 'Field Fence & Chain Link Fence Manufacturer in China | [COMPANY_NAME]';
    }
  }

  function init() {
    var container = document.getElementById('swup') || document.body;

    // 提交委托
    if (container.__ljFormHandlerSubmitHandler) {
      container.removeEventListener('submit', container.__ljFormHandlerSubmitHandler);
    }
    container.__ljFormHandlerSubmitHandler = onSubmit;
    container.addEventListener('submit', container.__ljFormHandlerSubmitHandler);

    // 输入时清除错误样式
    if (container.__ljFormHandlerInputHandler) {
      container.removeEventListener('input', container.__ljFormHandlerInputHandler);
    }
    container.__ljFormHandlerInputHandler = onInput;
    container.addEventListener('input', container.__ljFormHandlerInputHandler);

    // "Submit Another Inquiry" 重置按钮委托
    if (container.__ljFormHandlerResetHandler) {
      container.removeEventListener('click', container.__ljFormHandlerResetHandler);
    }
    container.__ljFormHandlerResetHandler = function (e) {
      var btn = e.target.closest('[data-reset-form]');
      if (!btn) return;
      e.preventDefault();
      resetForm(btn);
    };
    container.addEventListener('click', container.__ljFormHandlerResetHandler);

    // 邮箱同步
    var emailInput = document.getElementById('contact-email');
    if (emailInput) {
      emailInput.removeEventListener('change', syncEmailToReplytoWrapper);
      emailInput.addEventListener('change', syncEmailToReplytoWrapper);
    }

    // LJTracker 来源页 / 产品选择
    applyTrackerSource();

    // 首页 hash 状态同步（刷新或直接访问 #thank-you）
    var homeForm = document.getElementById('inquiry-form');
    if (homeForm) {
      onHashState();
    }
  }

  function syncEmailToReplytoWrapper(e) {
    syncEmailToReplyto(e.target.value);
  }

  // popstate 只绑定一次
  if (!document.__ljFormHandlerPopstateBound) {
    document.__ljFormHandlerPopstateBound = true;
    window.addEventListener('popstate', onHashState);
  }

  window.LJFormHandler = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
