/*============================================================================
  耶温博客 · 设计语言还原页脚本

  - 网格：40px / 20px / 关
  - 动效：墨色涟漪（canvas）/ 雪 / 关
  - 树形目录：分组折叠、当前章节跟随滚动
  - 窄屏：目录抽屉
  原站的涟漪参数取自 src/components/layout/InkBackground，雪片逻辑同理简化。
============================================================================*/
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*== 网格尺寸 ==*/
  var gridButtons = document.querySelectorAll('[data-grid-group] button[data-grid]');
  function applyGrid(value) {
    if (value === 'off') {
      root.style.setProperty('--grid-line', 'transparent');
      root.style.setProperty('--grid-line-strong', 'transparent');
      root.style.setProperty('--grid-size', '40px');
    } else {
      var size = value + 'px';
      root.style.setProperty('--grid-size', size);
      root.style.setProperty('--grid-line', 'rgba(0, 0, 0, 0.01)');
      root.style.setProperty('--grid-line-strong', 'rgba(0, 0, 0, 0.045)');
    }
    for (var i = 0; i < gridButtons.length; i += 1) {
      var on = gridButtons[i].getAttribute('data-grid') === value;
      gridButtons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  /*== 动效：墨与雪 ==*/
  var canvas = document.querySelector('.ink-canvas');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var ripples = [];
  var flakes = [];
  var frameId = 0;
  var mode = 'ink';
  var lastSpawn = 0;
  var pointer = { x: 0, y: 0, last: 0 };

  function resize() {
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnRipple(x, y, intensity) {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var base = Math.max(w, h) * 0.18;
    var count = intensity > 0.6 ? 4 : 3;
    for (var i = 0; i < count; i += 1) {
      ripples.push({
        x: x,
        y: y,
        radius: i * (6 + intensity * 10),
        maxRadius: base * (0.35 + intensity * 0.65) + Math.random() * 40,
        opacity: (0.08 + Math.random() * 0.1) * (0.85 + intensity * 0.15),
        life: 280 + Math.random() * 140,
        maxLife: 280 + Math.random() * 140,
        speed: (0.4 + i * 0.1) * (1 + intensity * 0.15),
        phase: i * Math.PI * 0.5,
        waves: count,
        intensity: intensity,
      });
    }
  }

  function spawnFlake() {
    flakes.push({
      x: Math.random() * window.innerWidth,
      y: -12,
      r: 2.5 + Math.random() * 3.5,
      vy: 0.35 + Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 0.5,
      spin: Math.random() * Math.PI,
      spinSpeed: (Math.random() - 0.5) * 0.02,
      alpha: 0.18 + Math.random() * 0.3,
    });
  }

  function drawInk(now) {
    if (!ctx) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    if (now - lastSpawn > 900 + Math.random() * 900) {
      spawnRipple(Math.random() * w, Math.random() * h, Math.random());
      lastSpawn = now;
    }

    var next = [];
    for (var i = 0; i < ripples.length; i += 1) {
      var r = ripples[i];
      r.radius += r.speed;
      r.life -= 1;
      r.phase += 0.08;
      var lifeRatio = r.life / r.maxLife;
      var radiusRatio = r.radius / r.maxRadius;
      if (lifeRatio <= 0 || radiusRatio >= 1) continue;

      var alpha =
        r.opacity *
        Math.pow(lifeRatio, 0.7) *
        (1 - Math.pow(radiusRatio, 0.8)) *
        (Math.sin(r.phase) * 0.1 + 0.9);
      if (alpha <= 0.005) continue;

      var lineWidth = Math.max(0.3, (0.8 + r.intensity * 1.2) * (1 - radiusRatio * 0.7));
      for (var wave = 0; wave < r.waves; wave += 1) {
        var waveRadius = r.radius - wave * (12 + r.intensity * 8) * radiusRatio;
        if (waveRadius <= 0) continue;
        var waveAlpha = alpha * (1 - wave * 0.2) * (1 - radiusRatio * 0.5);
        if (waveAlpha <= 0.005) continue;

        var gradient = ctx.createRadialGradient(
          r.x,
          r.y,
          waveRadius * 0.8,
          r.x,
          r.y,
          waveRadius * 1.15,
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, ' + waveAlpha * 0.08 + ')');
        gradient.addColorStop(0.25, 'rgba(0, 0, 0, ' + waveAlpha * 0.6 + ')');
        gradient.addColorStop(0.45, 'rgba(0, 0, 0, ' + waveAlpha * 0.85 + ')');
        gradient.addColorStop(0.75, 'rgba(0, 0, 0, ' + waveAlpha * 0.6 + ')');
        gradient.addColorStop(1, 'rgba(0, 0, 0, ' + waveAlpha * 0.08 + ')');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = Math.max(0.3, lineWidth * (1 - wave * 0.2));
        ctx.beginPath();
        ctx.arc(r.x, r.y, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
      next.push(r);
    }
    ripples = next;
  }

  function drawSnow() {
    if (!ctx) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    var next = [];
    for (var i = 0; i < flakes.length; i += 1) {
      var f = flakes[i];
      f.y += f.vy;
      f.x += Math.sin(f.y / 40) * 0.4 + f.drift * 0.2;
      f.spin += f.spinSpeed;
      if (f.y > h + 16) continue;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.spin);
      ctx.strokeStyle = 'rgba(124, 192, 242, ' + f.alpha + ')';
      ctx.lineWidth = 1;
      for (var a = 0; a < 6; a += 1) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos((a * Math.PI) / 3) * f.r, Math.sin((a * Math.PI) / 3) * f.r);
        ctx.stroke();
      }
      ctx.restore();
      next.push(f);
    }
    flakes = next;
    if (flakes.length < 60 && Math.random() < 0.6) spawnFlake();
  }

  function loop(now) {
    if (mode === 'ink') drawInk(now);
    else if (mode === 'snow') drawSnow();
    frameId = window.requestAnimationFrame(loop);
  }

  function startLoop() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    if (mode === 'off') {
      if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      return;
    }
    frameId = window.requestAnimationFrame(loop);
  }

  var motionButtons = document.querySelectorAll('[data-motion-group] button[data-motion]');
  function applyMotion(value) {
    mode = value;
    ripples = [];
    flakes = [];
    for (var i = 0; i < motionButtons.length; i += 1) {
      var on = motionButtons[i].getAttribute('data-motion') === value;
      motionButtons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    startLoop();
  }

  /*== 树形目录 ==*/
  /* 章节树：真实交互，展开收起 */
  var treeHeads = document.querySelectorAll('.rail .tree-cat-head');
  for (var t = 0; t < treeHeads.length; t += 1) {
    treeHeads[t].addEventListener('click', function () {
      var head = this;
      var open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', open ? 'false' : 'true');
      var body = head.nextElementSibling;
      if (body) body.classList.toggle('is-open', !open);
    });
  }

  /* 当前章节：滚动时高亮左侧对应的条目 */
  var sections = [];
  var links = document.querySelectorAll('.rail .tree-item[href^="#"]');
  for (var s = 0; s < links.length; s += 1) {
    var id = links[s].getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) sections.push({ el: el, link: links[s] });
  }

  function syncActive() {
    if (!sections.length) return;
    var line = window.scrollY + 120;
    var current = sections[0];
    for (var i = 0; i < sections.length; i += 1) {
      if (sections[i].el.offsetTop <= line) current = sections[i];
    }
    for (var j = 0; j < sections.length; j += 1) {
      sections[j].link.classList.toggle('is-active', sections[j] === current);
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      syncActive();
      ticking = false;
    });
  });

  /*== 窄屏目录 ==*/
  var rail = document.getElementById('rail');
  var railToggle = document.querySelector('[data-rail-toggle]');
  if (railToggle && rail) {
    railToggle.addEventListener('click', function () {
      var open = rail.classList.toggle('is-open');
      railToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /*== 绑定 ==*/
  for (var g = 0; g < gridButtons.length; g += 1) {
    gridButtons[g].addEventListener('click', function () {
      applyGrid(this.getAttribute('data-grid'));
    });
  }

  for (var m = 0; m < motionButtons.length; m += 1) {
    motionButtons[m].addEventListener('click', function () {
      applyMotion(this.getAttribute('data-motion'));
    });
  }

  window.addEventListener('resize', function () {
    resize();
    syncActive();
  });

  if (canvas) {
    window.addEventListener('pointermove', function (event) {
      if (mode !== 'ink') return;
      var now = Date.now();
      if (now - pointer.last < 220) return;
      var dx = event.clientX - pointer.x;
      var dy = event.clientY - pointer.y;
      if (dx * dx + dy * dy < 6400) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.last = now;
      spawnRipple(event.clientX, event.clientY, 0.25);
    });
  }

  resize();
  syncActive();
  if (reduceMotion) {
    applyMotion('off');
    mode = 'off';
    startLoop();
  } else {
    startLoop();
  }
})();
