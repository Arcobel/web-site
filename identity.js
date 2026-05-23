/* ════════════════════════════════════════════════════════
   ARCOBEL — IDENTITY.JS
   Ajouter ce fichier dans le même dossier que index.html,
   puis coller juste avant </body> :
   <script src="identity.js"></script>
   ════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. CANVAS SHADER HERO ───────────────────────────
     Blob fluide animé style ZE-FIR / gradient organique.
     Injecte un <canvas> derrière tout le contenu hero.
  ─────────────────────────────────────────────────────── */
  function initHeroShader() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'hero-shader';
    canvas.style.cssText = `
      position:absolute;
      inset:0;
      width:100%;
      height:100%;
      pointer-events:none;
      z-index:0;
      opacity:0.85;
    `;
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let W, H, t = 0;
    let mx = 0.6, my = 0.4; // normalised mouse position in hero

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track mouse only inside hero
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top)  / r.height;
    }, { passive: true });

    function lerp(a, b, n) { return a + (b - a) * n; }

    // Blob config — (cx, cy as fractions of W/H, radius, color stops)
    // Each blob drifts on its own Lissajous
    const blobs = [
      { ax:0.55, ay:0.38, fx:0.31, fy:0.27, r:0.58, c0:'rgba(95,71,231,0.22)',  c1:'rgba(95,71,231,0)',  phx:0,    phy:0    },
      { ax:0.30, ay:0.55, fx:0.19, fy:0.23, r:0.45, c0:'rgba(60,40,180,0.14)',  c1:'rgba(60,40,180,0)', phx:1.1,  phy:2.3  },
      { ax:0.72, ay:0.65, fx:0.13, fy:0.17, r:0.40, c0:'rgba(123,99,255,0.12)', c1:'rgba(123,99,255,0)',phx:2.4,  phy:1.0  },
      { ax:0.18, ay:0.28, fx:0.22, fy:0.11, r:0.32, c0:'rgba(180,60,120,0.07)', c1:'rgba(180,60,120,0)',phx:3.5,  phy:0.8  },
    ];

    // Smooth-target mouse blob
    let smx = 0.6, smy = 0.4;

    function draw() {
      t += 0.004;
      smx = lerp(smx, mx, 0.025);
      smy = lerp(smy, my, 0.025);

      ctx.clearRect(0, 0, W, H);

      // Mouse-reactive blob
      {
        const x = smx * W;
        const y = smy * H;
        const r = Math.min(W, H) * 0.55;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(95,71,231,0.16)');
        g.addColorStop(0.5, 'rgba(95,71,231,0.06)');
        g.addColorStop(1, 'rgba(95,71,231,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // Drifting blobs
      blobs.forEach(b => {
        const x = (b.ax + 0.18 * Math.sin(t * b.fx * 6.28 + b.phx)) * W;
        const y = (b.ay + 0.14 * Math.cos(t * b.fy * 6.28 + b.phy)) * H;
        const r = b.r * Math.min(W, H);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, b.c0);
        g.addColorStop(1, b.c1);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // Subtle horizontal noise line (scanline feel)
      const lineY = ((Math.sin(t * 0.7) * 0.5 + 0.5)) * H;
      const lg = ctx.createLinearGradient(0, lineY, W, lineY);
      lg.addColorStop(0,   'rgba(95,71,231,0)');
      lg.addColorStop(0.3, 'rgba(95,71,231,0.04)');
      lg.addColorStop(0.5, 'rgba(95,71,231,0.09)');
      lg.addColorStop(0.7, 'rgba(95,71,231,0.04)');
      lg.addColorStop(1,   'rgba(95,71,231,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(0, lineY - 1, W, 2);

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── 2. CURSOR GLOW TRAIL ────────────────────────────
     Un orb lumineux qui suit le curseur avec du lag,
     plus dramatique que le simple blob existant.
  ─────────────────────────────────────────────────────── */
  function initCursorGlow() {
    const orb = document.createElement('div');
    orb.id = 'cursor-orb';
    orb.style.cssText = `
      position:fixed;
      pointer-events:none;
      z-index:9989;
      width:320px;
      height:320px;
      border-radius:50%;
      background:radial-gradient(circle, rgba(95,71,231,0.13) 0%, rgba(95,71,231,0.04) 40%, transparent 70%);
      transform:translate(-50%,-50%);
      transition:opacity 0.4s;
      mix-blend-mode:screen;
      will-change:left,top;
    `;
    document.body.appendChild(orb);

    let ox = window.innerWidth/2, oy = window.innerHeight/2;
    let tx = ox, ty = oy;

    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });

    (function animOrb() {
      ox += (tx - ox) * 0.06;
      oy += (ty - oy) * 0.06;
      orb.style.left = ox + 'px';
      orb.style.top  = oy + 'px';
      requestAnimationFrame(animOrb);
    })();
  }

  /* ── 3. CARD HOVER GLOW ──────────────────────────────
     Chaque .work-card et .service-card émet un glow
     centré sur la position de la souris (style Framer).
  ─────────────────────────────────────────────────────── */
  function initCardGlow() {
    const style = document.createElement('style');
    style.textContent = `
      .work-card, .service-card {
        --gx: 50%;
        --gy: 50%;
        --glow-op: 0;
        position: relative;
        isolation: isolate;
      }
      .work-card::after, .service-card::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at var(--gx) var(--gy),
          rgba(95,71,231,0.18) 0%,
          rgba(95,71,231,0.06) 35%,
          transparent 65%);
        opacity: var(--glow-op);
        transition: opacity 0.35s ease;
        pointer-events: none;
        z-index: 1;
        border-radius: inherit;
      }
      .work-card:hover::after  { --glow-op: 1; }
      .service-card:hover::after { --glow-op: 1; }

      /* Border glow on hover */
      .work-card {
        box-shadow: 0 0 0 0 rgba(95,71,231,0);
        transition: box-shadow 0.35s ease, transform 0.25s ease;
      }
      .work-card:hover {
        box-shadow: 0 0 0 1px rgba(95,71,231,0.35), 0 8px 32px rgba(95,71,231,0.12);
        transform: translateY(-3px);
      }
      .service-card {
        transition: background 0.3s ease, box-shadow 0.3s ease;
      }
      .service-card:hover {
        box-shadow: 0 0 0 1px rgba(95,71,231,0.3), 0 4px 24px rgba(95,71,231,0.08);
      }
    `;
    document.head.appendChild(style);

    function bindGlow(selector) {
      document.querySelectorAll(selector).forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
          const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
          card.style.setProperty('--gx', x);
          card.style.setProperty('--gy', y);
        }, { passive: true });
      });
    }

    // Bind now + re-bind after works are rendered (they're loaded async)
    bindGlow('.service-card');
    bindGlow('.work-card');

    // Re-bind work cards after they're injected by JS
    const worksGrid = document.getElementById('worksGrid');
    if (worksGrid) {
      new MutationObserver(() => bindGlow('.work-card'))
        .observe(worksGrid, { childList: true, subtree: true });
    }
  }

  /* ── 4. HERO TYPOGRAPHY UPGRADE ─────────────────────
     Injecte les styles CSS identité directement.
     Pas de modification HTML — pure injection CSS.
  ─────────────────────────────────────────────────────── */
  function injectIdentityStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Hero title — plus dramatique */
      .hero-title {
        font-size: clamp(4rem, 10vw, 10rem) !important;
        line-height: 0.88 !important;
        letter-spacing: -0.03em !important;
      }

      /* Accent word — glow text */
      .hero-title .accent {
        color: var(--accent);
        text-shadow: 0 0 40px rgba(95,71,231,0.5), 0 0 80px rgba(95,71,231,0.2);
        position: relative;
      }

      /* Blink cursor sur le tag hero */
      .hero-tag::after {
        content: '_';
        color: var(--accent);
        animation: _blink 1.1s step-end infinite;
        margin-left: 2px;
      }
      @keyframes _blink { 0%,100%{opacity:1} 50%{opacity:0} }

      /* Nav logo — badge version ambre */
      .nav-logo::after {
        content: 'v25';
        font-family: 'DM Mono', monospace;
        font-size: 0.44rem;
        font-weight: 400;
        color: rgba(232,153,74,0.55);
        letter-spacing: 0.1em;
        vertical-align: super;
        margin-left: 3px;
      }

      /* Section titles — léger upgrade taille */
      .section-title {
        font-size: clamp(2.2rem, 4.5vw, 3.8rem) !important;
      }

      /* Tool pills — glyph */
      .tool-pill::before {
        content: '◈ ';
        font-size: 0.65em;
        color: var(--accent);
        opacity: 0.5;
      }

      /* Stat block — glow on active */
      .stat-block.active {
        box-shadow: inset 2px 0 0 var(--accent), 0 0 20px rgba(95,71,231,0.08);
      }

      /* Scroll indicator — plus visible */
      .hero-scroll {
        opacity: 0.7 !important;
      }

      /* Hero canvas derrière tout */
      #hero-shader {
        mix-blend-mode: screen;
      }

      /* Section label — index ambre discret */
      .section-label[data-idx]::after {
        content: attr(data-idx);
        font-size: 0.5rem;
        letter-spacing: 0.18em;
        color: rgba(232,153,74,0.45);
        margin-left: auto;
      }

      /* Process step num — prefix technique */
      .step-num::before {
        content: '# ';
        font-size: 0.5em;
        opacity: 0.4;
        color: rgba(232,153,74,0.8);
      }

      /* Footer — tag discret */
      footer { position: relative; }
      footer::before {
        content: 'arcobel_interactive.exe · v2025';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: 1.2rem;
        font-family: 'DM Mono', monospace;
        font-size: 0.44rem;
        letter-spacing: 0.22em;
        color: rgba(255,255,255,0.05);
        white-space: nowrap;
        pointer-events: none;
      }

      /* Work card index label */
      .work-card .wi-label {
        position: absolute;
        top: 0.7rem; left: 0.8rem;
        font-family: 'DM Mono', monospace;
        font-size: 0.5rem;
        letter-spacing: 0.2em;
        color: rgba(232,153,74,0.55);
        z-index: 10;
        pointer-events: none;
        text-shadow: 0 1px 4px rgba(0,0,0,0.9);
      }

      @media (max-width: 768px) {
        .hero-title { font-size: clamp(3rem, 13vw, 5rem) !important; }
        .nav-logo::after { display: none; }
        footer::before { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── 5. WORK CARD INDEX LABELS ───────────────────────
     Ajoute "AST_001" sur chaque work card dès qu'elles
     sont injectées dans le DOM par le système admin.
  ─────────────────────────────────────────────────────── */
  function initWorkLabels() {
    function labelCards() {
      document.querySelectorAll('.work-card').forEach((card, i) => {
        if (card.querySelector('.wi-label')) return; // déjà fait
        const lbl = document.createElement('div');
        lbl.className = 'wi-label';
        lbl.textContent = 'AST_' + String(i + 1).padStart(3, '0');
        card.appendChild(lbl);
      });
    }
    labelCards();
    const grid = document.getElementById('worksGrid');
    if (grid) {
      new MutationObserver(labelCards).observe(grid, { childList: true, subtree: true });
    }
  }

  /* ── 6. SECTION LABEL INDICES ────────────────────────
     Injecte data-idx sur chaque .section-label.
  ─────────────────────────────────────────────────────── */
  function initSectionIndices() {
    const labels = document.querySelectorAll('.section-label');
    const nums = ['// 01', '// 02', '// 03', '// 04', '// 05', '// 06'];
    labels.forEach((l, i) => {
      if (nums[i]) l.dataset.idx = nums[i];
    });
  }

  /* ── INIT ─────────────────────────────────────────── */
  function init() {
    injectIdentityStyles();
    initHeroShader();
    initCursorGlow();
    initCardGlow();
    initWorkLabels();
    initSectionIndices();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
