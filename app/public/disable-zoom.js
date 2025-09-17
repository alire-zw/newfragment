// جلوگیری کامل از zoom در موبایل
(function() {
  'use strict';
  
  // تنظیم viewport
  function setViewport() {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }
  }
  
  // اجرای فوری
  setViewport();
  
  // اجرای مجدد بعد از load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setViewport);
  }
  window.addEventListener('load', setViewport);
  
  // اجرای مجدد در resize
  window.addEventListener('resize', setViewport);
  
  // جلوگیری از gesture events
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function(event) {
    document.addEventListener(event, function(e) {
      e.preventDefault();
      return false;
    }, { passive: false, capture: true });
  });
  
  // جلوگیری از double tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
      return false;
    }
    lastTouchEnd = now;
  }, { passive: false, capture: true });
  
  // جلوگیری از wheel zoom
  document.addEventListener('wheel', function(e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      return false;
    }
  }, { passive: false, capture: true });
  
  // جلوگیری از keyboard zoom
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=')) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });
  
  // جلوگیری از context menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, { passive: false });
  
  // تنظیم CSS به صورت دستی
  function applyZoomPrevention() {
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        -webkit-text-size-adjust: 100% !important;
        -ms-text-size-adjust: 100% !important;
        text-size-adjust: 100% !important;
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
        touch-action: manipulation !important;
        -ms-touch-action: manipulation !important;
      }
      
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
        touch-action: manipulation !important;
        -ms-touch-action: manipulation !important;
      }
      
      input, textarea, [contenteditable] {
        -webkit-user-select: text !important;
        -khtml-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // اجرای CSS
  applyZoomPrevention();
  
  // اجرای مجدد در navigation (برای SPA)
  let currentUrl = location.href;
  new MutationObserver(function() {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      setTimeout(function() {
        setViewport();
        applyZoomPrevention();
      }, 100);
    }
  }).observe(document, { subtree: true, childList: true });
  
})();
