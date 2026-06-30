/* ============================================================
   particles.js — small CORNER particle emblems (no library)
   A tiny multi-colour picture made of dots sits in one corner of
   each section. It stays still; the pointer pushes nearby dots
   away and they spring back so the picture is preserved.
     • Hero   → 🎓 cap  — dark board + indigo tassel (bottom-right)
     • Journey→ 🚀 rocket— indigo body + gold flame (top-right)
     • Footer → ♥  heart — gold→rose gradient (right; footer dark)
   Colours come from reading the emoji's own pixels and remapping
   them to the site palette. Edit THEMES / colour fns below.
   ============================================================ */
(function () {
  "use strict";

  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif';
  var TAU = 6.28319;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function isMobile() { return window.innerWidth <= 700; }

  /* ---- per-region colour maps (read emoji colour → site palette) ---- */
  var INK = "#1a1922", INDIGO = "#5b4be6", GOLD = "#e6a92f";
  function capColors(r, g, b) {            // gold tassel → indigo, dark board → ink
    return (r > 140 && g > 110) ? INDIGO : INK;
  }
  function rocketColors(r, g, b) {         // flame/fins → gold, window/body → indigo, dark → ink
    if (r + g + b < 150) return INK;
    if (b > r && b > g) return INDIGO;
    if (r > 150 && g > 90 && b < 140) return GOLD;
    return INDIGO;
  }

  var THEMES = {
    everywhere: { subject: "🎓", colorFn: capColors,    scale: 0.30, maxPx: 150, gap: 4, dot: 1.8, ax: 0.90, ay: 0.74,
                  mobile: { maxPx: 60, gap: 3, dot: 1.5, ax: 0.97, ay: 0.60 } },
    sidekick:   { subject: "🚀", colorFn: rocketColors, scale: 0.30, maxPx: 140, gap: 4, dot: 1.8, ax: 0.88, ay: 0.16 },
    online:     { subject: "♥",  grad: ["#ffd56b", "#ff8fb0"], scale: 0.30, maxPx: 132, gap: 4, dot: 1.8, ax: 0.86, ay: 0.40,
                  mobile: { maxPx: 84, gap: 3, ax: 0.88, ay: 0.28 } }
  };

  function Field(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    var host = canvas.closest("[data-theme]");
    this.host = host || canvas.parentElement;
    this.base = THEMES[host && host.dataset.theme] || THEMES.everywhere;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.parts = [];
    this.ptr = { x: -9999, y: -9999, on: false };
    this.running = false; this.inview = false; this.raf = 0;
    this.resize();
    this.bind();
  }

  Field.prototype.cfg = function () {
    var th = this.base;
    return (th.mobile && isMobile()) ? Object.assign({}, th, th.mobile) : th;
  };

  Field.prototype.resize = function () {
    var r = this.host.getBoundingClientRect();
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.canvas.width = (this.w * this.dpr) | 0;
    this.canvas.height = (this.h * this.dpr) | 0;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.sample();
  };

  /* render the subject offscreen, read pixels → fixed home dots + colours */
  Field.prototype.sample = function () {
    var th = this.cfg(), w = this.w, h = this.h;
    var fontPx = Math.min(th.scale * Math.min(w, h), th.maxPx);
    var off = document.createElement("canvas");
    var octx = off.getContext("2d");
    octx.font = fontPx + "px " + EMOJI_FONT;
    var mw = Math.ceil(octx.measureText(th.subject).width) || Math.ceil(fontPx);
    var ow = mw + 6, oh = Math.ceil(fontPx * 1.25) + 6;
    off.width = ow; off.height = oh;
    octx.font = fontPx + "px " + EMOJI_FONT;
    octx.textAlign = "center"; octx.textBaseline = "middle";
    if (th.grad) { var lg = octx.createLinearGradient(0, oh * 0.1, 0, oh * 0.95); lg.addColorStop(0, th.grad[0]); lg.addColorStop(1, th.grad[1]); octx.fillStyle = lg; }
    else octx.fillStyle = "#fff";
    octx.fillText(th.subject, ow / 2, oh / 2);
    var data = octx.getImageData(0, 0, ow, oh).data;

    var ox = clamp(th.ax * w - ow / 2, 8, Math.max(8, w - ow - 8));
    var oy = clamp(th.ay * h - oh / 2, 8, Math.max(8, h - oh - 8));

    var pts = [], gap = th.gap, idx;
    for (var sy = 0; sy < oh; sy += gap)
      for (var sx = 0; sx < ow; sx += gap) {
        idx = (sy * ow + sx) * 4;
        if (data[idx + 3] > 130) pts.push(sx, sy, data[idx], data[idx + 1], data[idx + 2]);
      }

    var n = pts.length / 5, i, j = gap * 0.45;
    var reuse = this.parts.length === n;
    var arr = reuse ? this.parts : new Array(n);
    for (i = 0; i < n; i++) {
      var k = i * 5, r = pts[k + 2], g = pts[k + 3], b = pts[k + 4];
      var col = th.colorFn ? th.colorFn(r, g, b) : "rgb(" + r + "," + g + "," + b + ")";
      var jx = reuse ? arr[i].jx : rand(-j, j);
      var jy = reuse ? arr[i].jy : rand(-j, j);
      var hx = ox + pts[k] + jx, hy = oy + pts[k + 1] + jy;
      if (reuse) { arr[i].hx = hx; arr[i].hy = hy; arr[i].x = hx; arr[i].y = hy; arr[i].col = col; }
      else arr[i] = { hx: hx, hy: hy, x: hx, y: hy, vx: 0, vy: 0, jx: jx, jy: jy, col: col };
    }
    this.parts = arr; this.dot = th.dot;
    this.render();
  };

  Field.prototype.step = function () {
    var P = this.parts, on = this.ptr.on, px = this.ptr.x, py = this.ptr.y;
    var R = 80, R2 = R * R, moving = false;
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (on) {
        var dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) { var d = Math.sqrt(d2), f = 1 - d / R, force = f * f * 6; p.vx += (dx / d) * force; p.vy += (dy / d) * force; }
      }
      p.vx += (p.hx - p.x) * 0.08; p.vy += (p.hy - p.y) * 0.08;
      p.vx *= 0.78; p.vy *= 0.78;
      p.x += p.vx; p.y += p.vy;
      if (p.vx * p.vx + p.vy * p.vy > 0.0016) moving = true;
    }
    this.render();
    if (!moving) this.running = false;
  };

  Field.prototype.render = function () {
    var ctx = this.ctx, P = this.parts, r = this.dot || 1.8;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalAlpha = 0.92;
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  Field.prototype.wake = function () { if (!this.running && this.inview && !REDUCE) this.start(); };
  Field.prototype.bind = function () {
    var self = this;
    this._move = function (e) {
      var r = self.canvas.getBoundingClientRect();
      self.ptr.x = e.clientX - r.left; self.ptr.y = e.clientY - r.top; self.ptr.on = true; self.wake();
    };
    this._leave = function () { self.ptr.on = false; self.wake(); };
    this.host.addEventListener("pointermove", this._move, { passive: true });
    this.host.addEventListener("pointerleave", this._leave, { passive: true });
  };
  Field.prototype.start = function () {
    if (this.running || REDUCE) return;
    this.running = true;
    var self = this;
    (function loop() { if (!self.running) return; self.step(); self.raf = requestAnimationFrame(loop); })();
  };
  Field.prototype.stop = function () { this.running = false; if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; };

  function init() {
    var canvases = document.querySelectorAll("canvas.bg-particles");
    if (!canvases.length) return;
    var fields = [];
    for (var i = 0; i < canvases.length; i++) { try { fields.push(new Field(canvases[i])); } catch (e) {} }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var f = e.target.__field; if (!f) return;
          f.inview = e.isIntersecting;
          if (e.isIntersecting) { f.render(); f.wake(); } else f.stop();
        });
      }, { rootMargin: "120px" });
      fields.forEach(function (f) { f.canvas.__field = f; io.observe(f.canvas); });
    }

    var rT;
    window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(function () { fields.forEach(function (f) { f.resize(); }); }, 200); });
    window.addEventListener("load", function () { fields.forEach(function (f) { f.resize(); }); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) fields.forEach(function (f) { f.stop(); });
      else fields.forEach(function (f) { if (f.inview) f.wake(); });
    });

    window.__particles = fields;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
