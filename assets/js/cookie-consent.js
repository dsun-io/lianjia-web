/**
 * Cookie / 数据使用说明横幅
 * 
 * 面向国际市场的合规说明：仅做匿名行为统计，不做广告追踪。
 * 用户关闭后记入 localStorage，不再重复显示。
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'lj_cookie_consent_accepted';

  // 已经同意过，不再显示
  try {
    if (localStorage.getItem(CONSENT_KEY) === 'true') return;
  } catch (e) {}

  // 创建横幅 DOM
  var banner = document.createElement('div');
  banner.id = 'cookie-consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie and data usage notice');
  banner.style.cssText = [
    'position:fixed',
    'bottom:0',
    'left:0',
    'right:0',
    'z-index:9998',
    'background:rgba(27,40,56,0.96)',
    'backdrop-filter:blur(8px)',
    'color:#e2e8f0',
    'padding:16px 24px',
    'display:flex',
    'flex-wrap:wrap',
    'align-items:center',
    'justify-content:center',
    'gap:16px',
    'font-size:14px',
    'line-height:1.6',
    'font-family:system-ui,-apple-system,sans-serif',
    'border-top:1px solid rgba(var(--accent-bright-rgb),0.3)',
    'transition:transform 0.4s cubic-bezier(0.23,1,0.32,1),opacity 0.4s ease',
    'transform:translateY(0)',
    'opacity:1'
  ].join(';');

  banner.innerHTML =
    '<p style="margin:0;max-width:720px;text-align:center">' +
      '<svg style="display:inline-block;vertical-align:middle;margin-right:6px;width:16px;height:16px;color:var(--accent-bright)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>' +
      'This website uses anonymous browsing data (page dwell time) solely to improve our service. ' +
      'No personal data is shared with third parties. By continuing, you agree to our data usage for analytics purposes.' +
    '</p>' +
    '<button id="cookie-consent-accept" style="' +
      'background:var(--accent-bright);color:#fff;border:none;padding:8px 24px;border-radius:6px;' +
      'font-weight:600;font-size:14px;cursor:pointer;white-space:nowrap;' +
      'transition:background 0.2s ease' +
    '" onmouseover="this.style.background=\'var(--accent-dark)\'" onmouseout="this.style.background=\'var(--accent-bright)\'">' +
      'Got It' +
    '</button>';

  // 等 DOM 就绪后插入
  function append() {
    document.body.appendChild(banner);

    // 绑定关闭事件
    var btn = document.getElementById('cookie-consent-accept');
    if (btn) {
      btn.addEventListener('click', function () {
        // 淡出动画
        banner.style.transform = 'translateY(100%)';
        banner.style.opacity = '0';
        setTimeout(function () {
          banner.remove();
        }, 450);
        // 记录已同意
        try {
          localStorage.setItem(CONSENT_KEY, 'true');
        } catch (e) {}
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', append);
  } else {
    append();
  }
})();
