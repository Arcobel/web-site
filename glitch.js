(function () {
  'use strict';

  /* ── 1. CSS ── */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes g-slice {
      0%,89%,100% { transform:translate(0); }
      91% { transform:translate(-3px,0); }
      93% { transform:translate(3px,0); }
      95% { transform:translate(0); }
    }
    @keyframes g-flicker {
      0%,91%,100% { opacity:1; }
      92% { opacity:0.45; }
      93% { opacity:1; }
      95% { opacity:0.7; }
      96% { opacity:1; }
    }
    @keyframes border-flicker {
      0%,89%,100% { box-shadow:none; }
      90% { box-shadow: 2px 0 0 rgba(255,50,50,0.5), -2px 0 0 rgba(50,100,255,0.5); }
      92% { box-shadow: inset 0 0 0 1px rgba(95,71,231,0.7); }
      94% { box-shadow: -2px 0 0 rgba(255,50,50,0.3); }
      96% { box-shadow: none; }
    }
    .g-slice   { animation: g-slice   var(--gd,5s) var(--gdd,0s) infinite; }
    .g-flicker { animation: g-flicker var(--fd,7s) var(--fdd,0s) infinite; }
    .g-bf      { animation: border-flicker var(--bf-dur,6s) var(--bf-delay,0s) infinite; }
    #glitch-scanlines {
      position:fixed; inset:0; pointer-events:none; z-index:9990;
      background:repeating-linear-gradient(to bottom,transparent 0px,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px);
      animation: g-flicker 9s 2s infinite;
    }
  `;
  document.head.appendChild(style);

  /* ── 2. Scanlines ── */
  const sl = document.createElement('div');
  sl.id = 'glitch-scanlines';
  document.body.appendChild(sl);

  /* ── 3. Slice + flicker sur les textes ── */
  const TEXT_SEL = ['.section-label','.stat-num','.service-num','.nav-logo','.section-title'];

  function applyTextGlitch() {
    let i = 0;
    TEXT_SEL.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.dataset.gDone) return;
        el.dataset.gDone = '1';
        const dur   = +(3.5 + Math.random() * 4).toFixed(1);
        const delay = +(i * 0.4 + Math.random() * 2).toFixed(1);
        el.classList.add('g-slice','g-flicker');
        el.style.setProperty('--gd',  dur+'s');
        el.style.setProperty('--gdd', delay+'s');
        el.style.setProperty('--fd',  (dur*1.3).toFixed(1)+'s');
        el.style.setProperty('--fdd', (delay+0.4).toFixed(1)+'s');
        i++;
      });
    });
  }

  /* ── 4. RGB canvas glitch sur petits éléments ── */
  const RGB_SEL = ['.section-label','.stat-num','.service-num','.nav-logo'];

  function rgbCanvasGlitch(el) {
    if (el.dataset.rgbCanvas) return;
    el.dataset.rgbCanvas = '1';
    if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:99;opacity:0;mix-blend-mode:screen;left:0;top:0;';
    el.appendChild(canvas);

    function doFlash() {
      const rect = el.getBoundingClientRect();
      const w = Math.ceil(rect.width) || 200;
      const h = Math.ceil(rect.height) || 50;
      canvas.width = w; canvas.height = h;
      canvas.style.width = w+'px'; canvas.style.height = h+'px';
      const ctx = canvas.getContext('2d');
      let frame = 0;
      canvas.style.opacity = '0.9';
      const iv = setInterval(() => {
        ctx.clearRect(0,0,w,h);
        for (let s=0;s<3;s++) {
          const y=Math.random()*h, sh=1+Math.random()*(h*.35), ox=(Math.random()-.5)*8;
          ctx.fillStyle='rgba(255,40,40,0.55)'; ctx.fillRect(ox,y,w,sh);
          ctx.fillStyle='rgba(40,80,255,0.45)'; ctx.fillRect(-ox,y+sh*.4,w,sh*.5);
        }
        frame++;
        if (frame>=5) {
          clearInterval(iv);
          ctx.clearRect(0,0,w,h);
          canvas.style.opacity='0';
          setTimeout(doFlash, 4000+Math.random()*10000);
        }
      }, 45);
    }
    setTimeout(doFlash, 1500+Math.random()*5000);
  }

  function applyRGBCanvas() {
    RGB_SEL.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => rgbCanvasGlitch(el));
    });
  }

  /* ── 5. Text corruption — 2-3 lettres seulement ── */
  const GLYPHS = '!@#%^&*<>?|[]~±×ΔΩΨλξ01';

  function corruptEl(el) {
    // Safety: si le texte visible a déjà des glyphs, skip
    const walker0 = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n0; while (n0 = walker0.nextNode()) {
      if (!n0._origText) n0._origText = n0.textContent;
      else n0.textContent = n0._origText; // restaurer avant de recorrompre
    }
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) textNodes.push(node);
    }
    if (!textNodes.length) return;

    const tNode = textNodes[Math.floor(Math.random() * textNodes.length)];
    const orig = tNode._origText || tNode.textContent;
    if (!tNode._origText) tNode._origText = orig;
    const len   = orig.length;
    if (len < 2) return;

    const count = 2 + Math.floor(Math.random() * 2);
    const indices = new Set();
    let attempts = 0;
    while (indices.size < Math.min(count, len) && attempts < 50) {
      const i = Math.floor(Math.random() * len);
      if (orig[i] !== ' ') indices.add(i);
      attempts++;
    }

    let frame = 0;
    const total = 8;
    const iv = setInterval(() => {
      const p = frame / total;
      const chars = orig.split('');
      indices.forEach(i => {
        if (Math.random() > p) chars[i] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      });
      tNode.textContent = chars.join('');
      frame++;
      if (frame > total) {
        clearInterval(iv);
        tNode.textContent = tNode._origText;
      }
    }, 40);
  }

  function scheduleCorruption() {
    const targets = [
      ...document.querySelectorAll('.stat-num'),
      ...document.querySelectorAll('.step-name'),
      ...document.querySelectorAll('.section-title'),
    ];
    targets.forEach((el, i) => {
      const loop = () => setTimeout(() => { corruptEl(el); loop(); }, 5000 + Math.random() * 9000);
      setTimeout(loop, i * 600 + Math.random() * 2000);
    });
  }

  /* ── 6. Border flicker ── */
  function applyBorderFlicker() {
    document.querySelectorAll('.service-card, .work-card, .stat-block').forEach((card, i) => {
      if (card.dataset.bf) return;
      card.dataset.bf = '1';
      card.classList.add('g-bf');
      card.style.setProperty('--bf-dur',   (4+Math.random()*5).toFixed(1)+'s');
      card.style.setProperty('--bf-delay', (i*0.3+Math.random()*3).toFixed(1)+'s');
    });
  }

  /* ── 7. RGB noise sur work cards ── */
  function flashCardImage(container) {
    if (container.dataset.rgbFlashing) return;
    container.dataset.rgbFlashing = '1';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;opacity:0;mix-blend-mode:screen;';
    container.style.position = 'relative';
    container.appendChild(canvas);
    function flash() {
      const w = canvas.offsetWidth||300, h = canvas.offsetHeight||200;
      canvas.width=w; canvas.height=h;
      const ctx = canvas.getContext('2d');
      let frame=0;
      canvas.style.opacity='1';
      const iv = setInterval(() => {
        ctx.clearRect(0,0,w,h);
        for (let s=0;s<4;s++) {
          const y=Math.random()*h, sh=2+Math.random()*12, ox=(Math.random()-.5)*14;
          ctx.fillStyle='rgba(255,40,40,0.25)'; ctx.fillRect(ox,y,w,sh);
          ctx.fillStyle='rgba(40,80,255,0.2)';  ctx.fillRect(-ox,y+sh*.5,w,sh*.5);
        }
        const id=ctx.createImageData(w,h);
        for (let i=0;i<w*h*0.003;i++) {
          const px=Math.floor(Math.random()*w), py=Math.floor(Math.random()*h), idx=(py*w+px)*4;
          id.data[idx]=255; id.data[idx+1]=Math.random()>.5?50:255;
          id.data[idx+2]=Math.random()>.5?50:231; id.data[idx+3]=160;
        }
        ctx.putImageData(id,0,0);
        frame++;
        if (frame>=8) {
          clearInterval(iv); ctx.clearRect(0,0,w,h);
          canvas.style.opacity='0';
          setTimeout(flash, 4000+Math.random()*10000);
        }
      }, 40);
    }
    setTimeout(flash, 2000+Math.random()*6000);
  }

  function applyImageGlitch() {
    document.querySelectorAll('.work-card').forEach(card => flashCardImage(card));
  }

  /* ── 8. Canvas noise hero ── */
  function initHeroNoise() {
    const hero = document.getElementById('hero');
    if (!hero || hero.dataset.noiseCanvas) return;
    hero.dataset.noiseCanvas = '1';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;opacity:0;mix-blend-mode:screen;';
    hero.appendChild(canvas);
    function flash() {
      const w=canvas.offsetWidth||window.innerWidth, h=canvas.offsetHeight||600;
      canvas.width=w; canvas.height=h;
      const ctx=canvas.getContext('2d');
      let frame=0;
      canvas.style.opacity='0.65';
      const iv=setInterval(() => {
        ctx.clearRect(0,0,w,h);
        for (let s=0;s<4;s++) {
          const y=Math.random()*h, sh=1+Math.random()*8, ox=(Math.random()-.5)*20;
          ctx.fillStyle='rgba(255,30,30,0.1)';  ctx.fillRect(ox,y,w,sh);
          ctx.fillStyle='rgba(30,80,255,0.08)'; ctx.fillRect(-ox*.7,y+1,w,sh*.6);
        }
        const id=ctx.createImageData(w,h);
        for (let i=0;i<w*h*0.001;i++) {
          const px=Math.floor(Math.random()*w), py=Math.floor(Math.random()*h), idx=(py*w+px)*4;
          id.data[idx]=200+Math.random()*55;
          id.data[idx+1]=Math.random()>.6?71:200;
          id.data[idx+2]=Math.random()>.4?231:100;
          id.data[idx+3]=100;
        }
        ctx.putImageData(id,0,0);
        frame++;
        if (frame>=6) {
          clearInterval(iv); ctx.clearRect(0,0,w,h);
          canvas.style.opacity='0';
          setTimeout(flash, 5000+Math.random()*12000);
        }
      }, 50);
    }
    setTimeout(flash, 3000+Math.random()*4000);
  }

  /* ── INIT ── */
  function init() {
    applyTextGlitch();
    applyRGBCanvas();
    scheduleCorruption();
    applyBorderFlicker();
    applyImageGlitch();
    initHeroNoise();
    const grid = document.getElementById('worksGrid');
    if (grid) {
      new MutationObserver(() => {
        applyImageGlitch();
        applyBorderFlicker();
      }).observe(grid, { childList: true, subtree: true });
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
