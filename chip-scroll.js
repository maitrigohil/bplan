(function () {
  'use strict';

  var TOTAL = 78;
  var bitmaps = new Array(TOTAL); // ImageBitmap (or HTMLImageElement fallback)
  var loaded = 0;
  var ready = false;

  var canvas, ctx, section, loader, cta;
  var lastIndex = -1;
  var rafId = null;
  var pendingIndex = null;

  // ─── preload ──────────────────────────────────────────────────────────────

  function preload() {
    for (var i = 0; i < TOTAL; i++) {
      (function (idx) {
        var img = new Image();
        img.onload = function () {
          if (typeof createImageBitmap === 'function') {
            // Downsample to display resolution (canvas is max 1000px wide @2x DPR)
            // This reduces decoded memory from ~33MB/frame (4K) to ~3MB/frame
            createImageBitmap(img, { resizeWidth: 1400, resizeHeight: 788, resizeQuality: 'medium' }).then(function (bmp) {
              bitmaps[idx] = bmp;
              onLoad();
            }).catch(function () {
              bitmaps[idx] = img;
              onLoad();
            });
          } else {
            bitmaps[idx] = img;
            onLoad();
          }
        };
        img.onerror = function () {
          bitmaps[idx] = null;
          onLoad();
        };
        img.src = 'sequencee/ezgif-frame-' +
                  String(idx + 1).padStart(3, '0') + '.jpg';
      })(i);
    }
  }

  function onLoad() {
    loaded++;
    if (loaded === TOTAL) {
      ready = true;
      if (loader) loader.style.display = 'none';
      paint(frameForProgress(scrollProgress()));
    }
  }

  // ─── scroll math ─────────────────────────────────────────────────────────

  function scrollProgress() {
    if (!section) return 0;
    var rect       = section.getBoundingClientRect();
    var scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    var scrolled = -rect.top;
    return Math.min(1, Math.max(0, scrolled / scrollable));
  }

  function frameForProgress(p) {
    return Math.min(TOTAL - 1, Math.floor(p * TOTAL));
  }

  // ─── canvas drawing ───────────────────────────────────────────────────────

  function resizeCanvas() {
    if (!canvas) return;
    // Cap DPR at 2 — higher values double pixel count with no visible gain
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx = canvas.getContext('2d');
    if (ready && lastIndex >= 0) drawFrame(lastIndex);
  }

  function drawFrame(idx) {
    if (!ctx) return;
    var cw = canvas.width;
    var ch = canvas.height;

    ctx.fillStyle = '#f5f5f7';
    ctx.fillRect(0, 0, cw, ch);

    var bmp = bitmaps[idx];
    if (!bmp) return;

    // ImageBitmap uses .width/.height; HTMLImageElement uses .naturalWidth/.naturalHeight
    var nw = bmp.naturalWidth  || bmp.width;
    var nh = bmp.naturalHeight || bmp.height;
    if (!nw || !nh) return;

    var scale = Math.min(cw / nw, ch / nh);
    var dw = nw * scale;
    var dh = nh * scale;
    var dx = (cw - dw) / 2;
    var dy = (ch - dh) / 2;

    ctx.drawImage(bmp, dx, dy, dw, dh);
    lastIndex = idx;
  }

  function paint(idx) {
    pendingIndex = idx;
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = null;
      if (pendingIndex !== lastIndex) drawFrame(pendingIndex);
    });
  }

  // ─── scroll handler ───────────────────────────────────────────────────────

  function onScroll() {
    if (!ready) return;
    var p = scrollProgress();
    paint(frameForProgress(p));
    if (cta) {
      var show = p >= 0.9;
      cta.style.opacity = show ? '1' : '0';
      cta.style.pointerEvents = show ? 'all' : 'none';
    }
  }

  // ─── init ─────────────────────────────────────────────────────────────────

  function init() {
    canvas  = document.getElementById('chip-canvas');
    section = document.getElementById('chip-demo');
    loader  = document.getElementById('chip-loader');
    cta     = document.getElementById('chip-cta');
    if (!canvas || !section) return;

    // Promote canvas to its own compositor layer for smoother repaints
    canvas.style.willChange = 'contents';

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', onScroll, { passive: true });
    preload();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
