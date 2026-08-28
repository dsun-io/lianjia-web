/**
 * Google Analytics 4
 * Measurement ID: G-3HNM42B05G
 *
 * 加载 gtag.js 并配置 GA4，用于匿名统计网站访问行为。
 * 不收集可识别个人身份的信息，仅用于了解访客兴趣和改进服务。
 */
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-3HNM42B05G');

// 异步加载官方 gtag.js 脚本
(function () {
  'use strict';
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-3HNM42B05G';
  var first = document.getElementsByTagName('script')[0];
  first.parentNode.insertBefore(s, first);
})();
