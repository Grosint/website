/**
 * GROSINT — Main Application Script (Elevated Visual Experience)
 * Handles: Preloader, Lenis smooth scroll, cinematic GSAP scroll reveals,
 * custom HUD cursor, scroll-aware nav, 3D card tilt, immersive Three.js hero + background scenes.
 */

// Three.js imports are dynamic — only loaded on pages that include Three.js
// in their importmap (index, product pages). About & contact pages skip these.
let THREE = null;
let CSS2DObject = null;
let createScene = null;
let createResizeHandler = null;

async function loadThree() {
  try {
    THREE = await import('three');
    const css2d = await import('three/addons/renderers/CSS2DRenderer.js');
    CSS2DObject = css2d.CSS2DObject;
    const factory = await import('./three-scene.js');
    createScene = factory.createScene;
    createResizeHandler = factory.createResizeHandler;
    return true;
  } catch {
    return false;
  }
}

// ─── Constants ──────────────────────────────────────────────────────────────

const COLORS = {
  amber:  0xE87D14,
  cyan:   0x00C8FF,
  pink:   0xFF2D78,
  purple: 0x7B2FBE,
  white:  0xE6EDF3,
};

const INTEL_LABELS = [
  '/pivot', '/identify', '/locate', '/correlate', '/alert',
  '/fuse', '/resolve', '/enumerate', '/classify', '/surveil',
  '/intercept', '/decode', '/triangulate', '/pattern',
];

const PRELOADER_WORDS = [
  'INITIALIZING', 'CALIBRATING', 'SCANNING', 'ENCRYPTING',
  'RESOLVING', 'TRIANGULATING', 'LOCKING',
];

// ─── Preloader (enhanced with progress bar) ────────────────────────────────

const preloader = document.getElementById('preloader');
const preloaderText = document.getElementById('preloader-text');
const preloaderProgress = document.getElementById('preloader-progress');
let preloaderWordIndex = 0;
let progressValue = 0;

const preloaderInterval = setInterval(() => {
  preloaderWordIndex = (preloaderWordIndex + 1) % PRELOADER_WORDS.length;
  if (preloaderText) preloaderText.textContent = PRELOADER_WORDS[preloaderWordIndex];
  // Animate progress bar
  progressValue = Math.min(progressValue + 12 + Math.random() * 8, 95);
  if (preloaderProgress) preloaderProgress.style.width = `${progressValue}%`;
}, 400);

function dismissPreloader() {
  clearInterval(preloaderInterval);
  // Flash progress to 100%
  if (preloaderProgress) preloaderProgress.style.width = '100%';

  setTimeout(() => {
    if (preloader) {
      preloader.classList.add('done');
      setTimeout(() => { preloader.remove(); }, 800);
    }
    document.body.classList.add('loaded');
  }, 200);
}

const loadStart = performance.now();
const MIN_DISPLAY = 1800;

window.addEventListener('load', () => {
  const elapsed = performance.now() - loadStart;
  const remaining = Math.max(0, MIN_DISPLAY - elapsed);
  setTimeout(dismissPreloader, remaining);
});

setTimeout(dismissPreloader, 4000);

// ─── Lenis Smooth Scroll ────────────────────────────────────────────────────

let lenis = null;

async function initLenis() {
  try {
    const { default: Lenis } = await import('lenis');
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } catch (e) {
    // Lenis failed to load — site works fine without it
  }
}

initLenis();

// ─── Navigation ─────────────────────────────────────────────────────────────

const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');

let lastScrollY = 0;
const NAV_THRESHOLD = 100;

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;

  navbar.classList.toggle('scrolled', currentY > 20);

  if (navbar.classList.contains('open')) {
    lastScrollY = currentY;
    return;
  }

  if (currentY > NAV_THRESHOLD) {
    if (currentY > lastScrollY) {
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }
  } else {
    navbar.classList.remove('nav-hidden');
  }

  lastScrollY = currentY;
}, { passive: true });

hamburger?.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  navbar.classList.remove('nav-hidden');
});

document.querySelectorAll('.navbar__links a').forEach(link => {
  link.addEventListener('click', () => {
    navbar.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ─── Scroll Progress Bar ────────────────────────────────────────────────────

const scrollProgress = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${pct}%`;
}, { passive: true });

// ─── Custom HUD Cursor ─────────────────────────────────────────────────────

const hudCursor = document.getElementById('hud-cursor');
const isTouch = matchMedia('(hover: none)').matches;

if (hudCursor && !isTouch) {
  let cursorX = 0, cursorY = 0;
  let renderX = 0, renderY = 0;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  }, { passive: true });

  function updateCursor() {
    renderX += (cursorX - renderX) * 0.12;
    renderY += (cursorY - renderY) * 0.12;
    hudCursor.style.transform = `translate(${renderX}px, ${renderY}px)`;
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  const interactiveSelector = 'a, button, [data-tilt], input, textarea, select, .navbar__hamburger';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      hudCursor.classList.add('hovering');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      hudCursor.classList.remove('hovering');
    }
  }, { passive: true });

  document.addEventListener('mousedown', () => hudCursor.classList.add('clicking'), { passive: true });
  document.addEventListener('mouseup',   () => hudCursor.classList.remove('clicking'), { passive: true });
}

// ─── Cinematic GSAP Scroll Animations ──────────────────────────────────────

async function initScrollAnimations() {
  try {
    const gsapModule = await import('gsap');
    const stModule = await import('gsap/ScrollTrigger');

    const gsap = gsapModule.gsap || gsapModule.default;
    const ScrollTrigger = stModule.ScrollTrigger || stModule.default;

    gsap.registerPlugin(ScrollTrigger);

    // Connect Lenis to ScrollTrigger
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // Helper: safe scroll-triggered animation using set+onEnter pattern
    // Elements stay visible by default; only animate when confirmed in view
    function revealFrom(elements, fromVars, triggerEl, staggerVal) {
      if (!triggerEl) return;
      const targets = elements.length !== undefined ? Array.from(elements) : [elements];
      if (targets.length === 0) return;

      // Pre-set elements to hidden state
      gsap.set(targets, { opacity: 0, ...fromVars });

      ScrollTrigger.create({
        trigger: triggerEl,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(targets, {
            opacity: 1,
            x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0, scaleX: 1,
            duration: fromVars.duration || 0.8,
            stagger: staggerVal || 0,
            ease: fromVars.ease || 'power3.out',
            delay: fromVars.delay || 0,
            overwrite: true,
          });
        },
      });
    }

    // ── Section heading reveals ──
    gsap.utils.toArray('.reveal').forEach(el => {
      revealFrom(el, { y: 50, duration: 0.9 }, el);
    });

    // ── Stagger grid children ──
    gsap.utils.toArray('.reveal-stagger').forEach(container => {
      revealFrom(container.children, { y: 35, duration: 0.7 }, container, 0.12);
    });

    // ── Border trace reveals ──
    gsap.utils.toArray('.border-trace').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => el.classList.add('visible'),
      });
    });

    // ── Section divider animations ──
    gsap.utils.toArray('.section-divider').forEach(el => {
      revealFrom(el, { scaleX: 0, duration: 1.0, ease: 'power2.inOut' }, el);
    });

    // ── Parallax glow orbs (safe — uses gsap.to, no hiding) ──
    gsap.utils.toArray('.glow-orb').forEach(orb => {
      if (!orb.parentElement) return;
      gsap.to(orb, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: orb.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    });

    // ── Word-by-word hero headline reveal ──
    splitAndAnimate('.hero__headline', gsap);

    // ── Word-by-word section title reveals ──
    gsap.utils.toArray('.section-title').forEach(el => {
      splitAndAnimate(el, gsap, true);
    });

    // ── Word-by-word CTA title reveal ──
    splitAndAnimate('.cta-card__title', gsap, true);

    // ── Pipeline nodes — staggered entry (only if container exists) ──
    const pipelineScene = document.querySelector('.pipeline-3d-scene');
    if (pipelineScene) {
      const nodes = gsap.utils.toArray('.pipeline-node-3d');
      revealFrom(nodes, { y: 30, scale: 0.85, duration: 0.8, ease: 'back.out(1.7)' }, pipelineScene, 0.1);
    }

    // ── Domain tiles — wave entry (only if grid exists) ──
    const serveGrid = document.querySelector('.serve-grid');
    if (serveGrid) {
      const tiles = gsap.utils.toArray('.domain-tile');
      revealFrom(tiles, { y: 25, duration: 0.6 }, serveGrid, 0.08);
    }

    // ── Pillar cubes — flip entry (only if grid exists) ──
    const pillarsGrid = document.querySelector('.pillars-grid');
    if (pillarsGrid) {
      const cubes = gsap.utils.toArray('.cube-wrapper');
      revealFrom(cubes, { rotateY: 90, duration: 0.8, ease: 'back.out(1.4)' }, pillarsGrid, 0.12);
    }

    // ── CTA card — scale entry ──
    const ctaCard = document.querySelector('.cta-card');
    if (ctaCard) {
      revealFrom(ctaCard, { scale: 0.92, duration: 1.0 }, ctaCard);
    }

  } catch (e) {
    initFallbackReveals();
  }
}

function splitAndAnimate(target, gsap, useScrollTrigger = false) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  const dataText = el.getAttribute('data-text');
  const html = el.innerHTML;
  const parts = html.split(/(<br\s*\/?>|<[^>]+>.*?<\/[^>]+>)/gi);

  el.innerHTML = '';
  const words = [];

  parts.forEach(part => {
    if (part.match(/^<br\s*\/?>$/i)) {
      el.appendChild(document.createElement('br'));
    } else if (part.match(/^<[^>]+>.*<\/[^>]+>$/i)) {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = part;
      wrapper.style.display = 'inline-block';
      wrapper.style.willChange = 'transform, opacity';
      el.appendChild(wrapper);
      words.push(wrapper);
    } else {
      part.split(/\s+/).filter(Boolean).forEach(word => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.display = 'inline-block';
        span.style.willChange = 'transform, opacity';
        el.appendChild(span);
        words.push(span);
      });
    }
  });

  if (dataText) el.setAttribute('data-text', dataText);

  // Set hidden initial state
  gsap.set(words, { opacity: 0, y: 30, rotateX: -15 });

  const animTo = {
    opacity: 1,
    y: 0,
    rotateX: 0,
    duration: 0.5,
    stagger: 0.04,
    ease: 'power3.out',
  };

  if (useScrollTrigger) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(words, animTo),
    });
  } else {
    // Hero: animate after short delay
    setTimeout(() => gsap.to(words, animTo), 500);
  }
}

function initFallbackReveals() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger, .border-trace').forEach(el => {
    revealObserver.observe(el);
  });
}

initScrollAnimations();

// ─── 3D Card Tilt — Mouse Parallax ──────────────────────────────────────────

document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;

    card.style.setProperty('--rx', `${-y * 14}deg`);
    card.style.setProperty('--ry', `${ x * 14}deg`);
    card.style.setProperty('--mouse-x', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--mouse-y', `${(y + 0.5) * 100}%`);
  });

  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });

  card.addEventListener('touchend', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
});

// ─── Shared Background Three.js — Immersive Particle Field ────────────────

function initBackgroundScene() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  `;
  document.body.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 40;

  // More particles, subtle connections
  const count  = 800;
  const positions = new Float32Array(count * 3);
  const colours   = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);
  const velocities = [];

  const cyanC  = new THREE.Color(COLORS.cyan);
  const amberC = new THREE.Color(COLORS.amber);
  const pinkC  = new THREE.Color(COLORS.pink);

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 140;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

    const r = Math.random();
    const col = r < 0.5 ? cyanC : r < 0.8 ? amberC : pinkC;
    colours[i * 3]     = col.r;
    colours[i * 3 + 1] = col.g;
    colours[i * 3 + 2] = col.b;

    sizes[i] = 0.1 + Math.random() * 0.15;

    velocities.push({
      x: (Math.random() - 0.5) * 0.006,
      y: (Math.random() - 0.5) * 0.006,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.5,
    });
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colours, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.25,
    sizeAttenuation: true,
  });

  scene.add(new THREE.Points(geo, mat));

  // Scroll-reactive camera depth
  let scrollFactor = 0;
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollFactor = docHeight > 0 ? window.scrollY / docHeight : 0;
  }, { passive: true });

  let paused = false;

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) animate();
  });

  function animate() {
    if (paused) return;
    requestAnimationFrame(animate);

    const t = performance.now() * 0.001;
    const pos = geo.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const v = velocities[i];
      pos[i * 3 + 1] += Math.sin(t * v.speed + v.phase) * 0.003;
      pos[i * 3]     += Math.cos(t * v.speed * 0.7 + v.phase) * 0.002;
    }

    geo.attributes.position.needsUpdate = true;

    // Subtle camera drift based on scroll position
    camera.position.z = 40 - scrollFactor * 8;
    camera.rotation.x = scrollFactor * 0.05;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });
}

// ─── Hero Three.js WebGL Scene (Elevated) ──────────────────────────────────

function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const W = canvas.parentElement.clientWidth;
  const H = canvas.parentElement.clientHeight;

  const isMobile = W / H < 0.9;
  const heroFov  = isMobile ? 100 : 60;
  const heroCamZ = isMobile ? 42  : 35;

  const { scene, camera, renderer, composer, bloomPass: bloom, labelRenderer } = createScene(canvas, {
    fov: heroFov,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    bloom: { strength: 1.0, radius: 0.5, threshold: 0.8 },
    filmGrain: true,
    filmGrainIntensity: 0.25,
    exposure: 1.3,
  });
  camera.position.set(0, 0, heroCamZ);
  labelRenderer.domElement.style.zIndex = '2';

  // ── Enhanced particle field — 1200 points with depth ──
  const particleData = [];
  {
    const count = 1200;
    const pos   = new Float32Array(count * 3);
    const col   = new Float32Array(count * 3);
    const cC = new THREE.Color(COLORS.cyan);
    const aC = new THREE.Color(COLORS.amber);
    const pC = new THREE.Color(COLORS.pink);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 90;
      const y = (Math.random() - 0.5) * 55;
      const z = (Math.random() - 0.5) * 40;
      pos[i*3]   = x;
      pos[i*3+1] = y;
      pos[i*3+2] = z;

      const r = Math.random();
      const c = r < 0.55 ? cC : r < 0.85 ? aC : pC;
      col[i*3]   = c.r;
      col[i*3+1] = c.g;
      col[i*3+2] = c.b;

      particleData.push({
        origX: x, origY: y, origZ: z,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.5,
        amplitude: 0.5 + Math.random() * 1.5,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
    })));

    geo.userData = { particleData, count };
  }

  // ── Wire grid ground plane ──
  {
    const gridGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    const gridMat = new THREE.MeshBasicMaterial({
      color: COLORS.cyan,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -20;
    scene.add(grid);
  }

  // ── Floating intelligence labels ──
  const labelObjects = [];
  if (isMobile) labelRenderer.domElement.style.display = 'none';
  INTEL_LABELS.forEach((text, i) => {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.cssText = `
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: ${i % 3 === 0 ? '#FF2D78' : i % 3 === 1 ? '#00C8FF' : '#E87D14'};
      opacity: 0;
      white-space: nowrap;
      letter-spacing: 0.1em;
      text-shadow: 0 0 8px currentColor;
      transition: opacity 0.5s ease;
    `;

    const label = new CSS2DObject(div);
    label.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 24,
      (Math.random() - 0.5) * 10 - 5
    );
    scene.add(label);

    const delay = i * 300 + 500;
    setTimeout(() => {
      div.style.opacity = '0.55';
      labelObjects.push({ label, div, phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.3 });
    }, delay);
  });

  // ── Crosshair reticles ──
  function makeReticle(color, x, y, z, scale = 1) {
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
    const s = scale * 2;
    const gap = s * 0.28;

    const pts = [
      new THREE.Vector3(-s, 0, 0), new THREE.Vector3(-gap, 0, 0),
      new THREE.Vector3( gap, 0, 0), new THREE.Vector3( s, 0, 0),
      new THREE.Vector3(0, -s, 0), new THREE.Vector3(0, -gap, 0),
      new THREE.Vector3(0,  gap, 0), new THREE.Vector3(0,  s, 0),
    ];

    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const reticle = new THREE.LineSegments(geo, mat);
    reticle.position.set(x, y, z);
    reticle.userData = { mat, phase: Math.random() * Math.PI * 2 };
    scene.add(reticle);
    return reticle;
  }

  const reticles = [
    makeReticle(COLORS.cyan,  -18,  8, -2, 1.2),
    makeReticle(COLORS.pink,   16, -9, -3, 1.0),
    makeReticle(COLORS.amber, -10, -7,  2, 0.8),
    makeReticle(COLORS.cyan,   14,  7,  1, 0.6),
  ];

  // ── Garud eagle wireframe ──
  {
    const pts = [
      [0,  10], [-3,  8], [-6,  6], [-14,  8], [-20, 5], [-22, 2],
      [-16,  1], [-8, 3], [-4,  0], [-5, -4], [-3, -8],
      [0, -10], [3, -8], [5, -4], [4, 0], [8, 3], [16, 1],
      [22, 2], [20, 5], [14, 8], [6, 6], [3, 8],
    ].map(([x, y]) => new THREE.Vector3(x * 0.6, y * 0.6, -8));

    const geo = new THREE.BufferGeometry().setFromPoints([...pts, pts[0]]);
    const eagle = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: COLORS.amber,
      transparent: true,
      opacity: 0.25,
    }));
    scene.add(eagle);
    eagle.userData.rotate = true;
  }

  // ── Orbiting ring geometry — adds depth ──
  {
    const ringGeo = new THREE.TorusGeometry(18, 0.03, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: COLORS.cyan,
      transparent: true,
      opacity: 0.12,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.45;
    ring.position.z = -5;
    ring.userData.isOrbitRing = true;
    scene.add(ring);
  }

  // ── Second orbital ring — perpendicular ──
  {
    const ringGeo2 = new THREE.TorusGeometry(14, 0.02, 8, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: COLORS.amber,
      transparent: true,
      opacity: 0.08,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI * 0.7;
    ring2.rotation.y = Math.PI * 0.3;
    ring2.position.z = -3;
    ring2.userData.isOrbitRing = true;
    scene.add(ring2);
  }

  // ── Radar sweep ──
  {
    const sweepGeo = new THREE.CircleGeometry(22, 64, 0, Math.PI * 0.15);
    const sweep = new THREE.Mesh(sweepGeo, new THREE.MeshBasicMaterial({
      color: COLORS.amber,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
    }));
    sweep.position.z = -6;
    sweep.userData.isSweep = true;
    scene.add(sweep);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(21.5, 22, 64),
      new THREE.MeshBasicMaterial({ color: COLORS.amber, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    ring.position.z = -6;
    scene.add(ring);

    [14, 8].forEach(r => {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(r - 0.2, r, 64),
        new THREE.MeshBasicMaterial({ color: COLORS.amber, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
      );
      m.position.z = -6;
      scene.add(m);
    });
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.1));

  // ── Mouse tracking for reactive camera ──
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── Animation loop ──
  let paused = false;

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) animate();
  });

  function animate() {
    if (paused) return;
    requestAnimationFrame(animate);

    const t = performance.now() * 0.001;

    // Reactive particles — gentle wave motion
    scene.traverse(obj => {
      if (obj.isPoints && obj.geometry.userData?.particleData) {
        const data = obj.geometry.userData.particleData;
        const pos = obj.geometry.attributes.position.array;
        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          pos[i*3]     = d.origX + Math.sin(t * d.speed + d.phase) * d.amplitude * 0.3;
          pos[i*3 + 1] = d.origY + Math.cos(t * d.speed * 0.8 + d.phase) * d.amplitude * 0.4;
          pos[i*3 + 2] = d.origZ + Math.sin(t * d.speed * 0.5 + d.phase * 1.5) * d.amplitude * 0.2;
        }
        obj.geometry.attributes.position.needsUpdate = true;
      }

      if (obj.userData?.isSweep) {
        obj.rotation.z = -t * (Math.PI / 2);
      }
      if (obj.userData?.rotate) {
        obj.rotation.y = Math.sin(t * 0.1) * 0.15;
      }
      if (obj.userData?.isOrbitRing) {
        obj.rotation.z = t * 0.08;
      }
    });

    reticles.forEach((r, i) => {
      r.material.opacity = 0.3 + Math.sin(t * 1.2 + r.userData.phase) * 0.4;
      r.rotation.z = t * 0.1 * (i % 2 === 0 ? 1 : -1);
    });

    labelObjects.forEach(({ label, phase, speed }) => {
      label.position.y += Math.sin(t * speed + phase) * 0.004;
      label.position.x += Math.cos(t * speed * 0.6 + phase) * 0.002;
    });

    // Mouse-reactive camera with smooth lerp
    const targetX = Math.sin(t * 0.07) * 1.5 + mouseX * 2;
    const targetY = Math.cos(t * 0.05) * 0.8 - mouseY * 1;
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    composer.render();
    labelRenderer.render(scene, camera);
  }

  animate();

  createResizeHandler(canvas.parentElement, {
    camera, renderer, composer, bloomPass: bloom, labelRenderer,
    onResize: (width, height) => {
      const mobile = (width / height) < 0.9;
      camera.fov = mobile ? 100 : 60;
      camera.position.z = mobile ? 42 : 35;
      camera.updateProjectionMatrix();
    },
  });
}

// ─── Init ────────────────────────────────────────────────────────────────────

async function initThreeScenes() {
  const hasThree = await loadThree();
  if (!hasThree) return; // Pages without Three.js (about, contact) skip gracefully

  initBackgroundScene();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroScene);
  } else {
    initHeroScene();
  }
}

initThreeScenes();
