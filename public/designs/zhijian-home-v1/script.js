/*============================================================================
  Zhi Jian 博客 · 设计还原页脚本
  - 明暗：跟随系统 / 明色 / 暗色，档位记在 localStorage
  - 头部：滚动过首屏后加毛玻璃底
  - 复制：代码块与 RSS 地址
============================================================================*/
(function () {
  'use strict';

  var SCHEME_KEY = 'zhijian-home-scheme';
  var root = document.documentElement;

  function readScheme() {
    try {
      return localStorage.getItem(SCHEME_KEY) || 'auto';
    } catch (error) {
      return 'auto';
    }
  }

  function applyScheme(scheme) {
    if (scheme === 'light' || scheme === 'dark') {
      root.setAttribute('data-scheme', scheme);
    } else {
      root.removeAttribute('data-scheme');
    }

    /* 档位按钮限定在分组里，避免选中 <html> 自身时给根元素挂上 state 属性 */
    var buttons = document.querySelectorAll('[data-scheme-group] button[data-scheme]');
    for (var i = 0; i < buttons.length; i += 1) {
      var active = buttons[i].getAttribute('data-scheme') === scheme;
      buttons[i].classList.toggle('is-active', active);
      buttons[i].setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  applyScheme(readScheme());

  document.addEventListener('click', function (event) {
    var target = event.target;

    if (target && target.closest) {
      var schemeButton = target.closest('[data-scheme-group] button[data-scheme]');
      if (schemeButton) {
        var next = schemeButton.getAttribute('data-scheme');
        try {
          localStorage.setItem(SCHEME_KEY, next);
        } catch (error) {
          /* 隐私模式下忽略 */
        }
        applyScheme(next);
        return;
      }

      var copyCode = target.closest('[data-copy-code]');
      if (copyCode) {
        var block = copyCode.closest('[data-code-block]');
        var code = block ? block.querySelector('code') : null;
        if (code) {
          copyText(code.innerText, copyCode);
        }
        return;
      }

      var copyFeed = target.closest('[data-copy-feed]');
      if (copyFeed) {
        copyText(
          'https://yuwb.dev/feed.xml',
          copyFeed,
          copyFeed.querySelector('[data-copy-feed-label]'),
        );
      }
    }
  });

  function copyText(text, button, label) {
    var done = function () {
      if (label) {
        var original = label.textContent;
        label.textContent = '已复制';
        window.setTimeout(function () {
          label.textContent = original;
        }, 1600);
        return;
      }
      button.classList.add('is-copied');
      window.setTimeout(function () {
        button.classList.remove('is-copied');
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text, done);
      });
      return;
    }

    fallbackCopy(text, done);
  }

  function fallbackCopy(text, done) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      done();
    } catch (error) {
      /* 复制失败时保持静默 */
    }
    document.body.removeChild(area);
  }

  var filterDialog = document.querySelector('[data-filter-dialog]');
  if (filterDialog && typeof filterDialog.showModal === 'function') {
    var closeFilter = function () {
      if (filterDialog.open) filterDialog.close();
    };
    var openTrigger = document.querySelector('[data-filter-open]');
    if (openTrigger) {
      openTrigger.addEventListener('click', function () {
        filterDialog.showModal();
        openTrigger.setAttribute('aria-expanded', 'true');
      });
    }
    /* 关闭可能来自关闭按钮、遮罩或 Esc，统一在 close 事件里收回触发器状态 */
    filterDialog.addEventListener('close', function () {
      if (openTrigger) openTrigger.setAttribute('aria-expanded', 'false');
    });
    var closeTrigger = filterDialog.querySelector('[data-filter-close]');
    if (closeTrigger) {
      closeTrigger.addEventListener('click', closeFilter);
    }
    filterDialog.addEventListener('click', function (event) {
      if (event.target === filterDialog) {
        closeFilter();
      }
    });
    var desktopQuery = window.matchMedia('(min-width: 48rem)');
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', function (event) {
        if (event.matches) closeFilter();
      });
    }
  }

  var header = document.querySelector('[data-header]');
  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }
})();
