/**
 * GROSINT — Main Application Script
 * Handles: Preloader, Lenis smooth scroll, GSAP scroll reveals,
 * custom HUD cursor, scroll-aware nav, 3D card tilt, Three.js hero + background scenes.
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  createScene,
  createResizeHandler,
} from './three-scene.js';

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

// ─── Preloader ──────────────────────────────────────────────────────────────

const preloader = document.getElementById('preloader');
const preloaderText = document.getElementById('preloader-text');
let preloaderWordIndex = 0;

const preloaderInterval = setInterval(() => {
  preloaderWordIndex = (preloaderWordIndex + 1) % PRELOADER_WORDS.length;
  if (preloaderText) preloaderText.textContent = PRELOADER_WORDS[preloaderWordIndex];
}, 400);

function dismissPreloader() {
  clearInterval(preloaderInterval);
  if (preloader) {
    preloader.classList.add('done');
    setTimeout(() => { preloader.remove(); }, 600);
  }
  document.body.classList.add('loaded');
}

// Dismiss after load + minimum display time
const loadStart = performance.now();
const MIN_DISPLAY = 1500;

window.addEventListener('load', () => {
  const elapsed = performance.now() - loadStart;
  const remaining = Math.max(0, MIN_DISPLAY - elapsed);
  setTimeout(dismissPreloader, remaining);
});

// Fallback: dismiss after 4s regardless
setTimeout(dismissPreloader, 4000);

// ─── Lenis Smooth Scroll ────────────────────────────────────────────────────

let lenis = null;

async function initLenis() {
  try {
    const { default: Lenis } = await import('lenis');
    lenis = new Lenis({
      duration: 1.2,
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

// Scroll-aware nav: hide on scroll down, show on scroll up
let lastScrollY = 0;
const NAV_THRESHOLD = 100;

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;

  // Scrolled state (background change)
  navbar.classList.toggle('scrolled', currentY > 20);

  // Don't hide nav when mobile menu is open
  if (navbar.classList.contains('open')) {
    lastScrollY = currentY;
    return;
  }

  // Hide/show based on direction
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

// Mobile menu toggle
hamburger?.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  // Always show nav when menu is open
  navbar.classList.remove('nav-hidden');
});

// Close on nav link click (mobile)
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

  // Smooth follow with lerp
  function updateCursor() {
    renderX += (cursorX - renderX) * 0.15;
    renderY += (cursorY - renderY) * 0.15;
    hudCursor.style.transform = `translate(${renderX}px, ${renderY}px)`;
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Hover state on interactive elements
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

  // Click pulse
  document.addEventListener('mousedown', () => hudCursor.classList.add('clicking'), { passive: true });
  document.addEventListener('mouseup',   () => hudCursor.classList.remove('clicking'), { passive: true });
}

// ─── GSAP Scroll Reveals ────────────────────────────────────────────────────

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

    // ── Section heading reveals ──
    gsap.utils.toArray('.reveal').forEach(el => {
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    });

    // ── Stagger grid children ──
    gsap.utils.toArray('.reveal-stagger').forEach(container => {
      const children = container.children;
      gsap.from(children, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
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

    // ── Word-by-word hero headline reveal ──
    splitAndAnimate('.hero__headline', gsap);

    // ── Word-by-word section title reveals ──
    gsap.utils.toArray('.section-title').forEach(el => {
      splitAndAnimate(el, gsap, true);
    });

    // ── Word-by-word CTA title reveal ──
    splitAndAnimate('.cta-card__title', gsap, true);

  } catch (e) {
    // GSAP failed to load — fall back to CSS-based IntersectionObserver reveals
    initFallbackReveals();
  }
}

function splitAndAnimate(target, gsap, useScrollTrigger = false) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  // Preserve the data-text attribute for glitch effect
  const dataText = el.getAttribute('data-text');

  // Get the content, preserving line breaks and inline HTML elements
  const html = el.innerHTML;
  // Split by <br> tags and inline HTML elements (e.g. <span class="...">...</span>)
  const parts = html.split(/(<br\s*\/?>|<[^>]+>.*?<\/[^>]+>)/gi);

  el.innerHTML = '';
  const words = [];

  parts.forEach(part => {
    if (part.match(/^<br\s*\/?>$/i)) {
      el.appendChild(document.createElement('br'));
    } else if (part.match(/^<[^>]+>.*<\/[^>]+>$/i)) {
      // Inline HTML element — wrap it in an animated span preserving inner HTML
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

  // Re-apply data-text for glitch
  if (dataText) el.setAttribute('data-text', dataText);

  const animConfig = {
    y: 30,
    opacity: 0,
    rotateX: -15,
    duration: 0.5,
    stagger: 0.04,
    ease: 'power3.out',
  };

  if (useScrollTrigger) {
    animConfig.scrollTrigger = {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
      once: true,
    };
  } else {
    animConfig.delay = 0.5;
  }

  gsap.from(words, animConfig);
}

// Fallback for when GSAP doesn't load
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

// ─── Shared Background Three.js — Drifting Particle Field ───────────────────

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

  const count  = 600;
  const positions = new Float32Array(count * 3);
  const colours   = new Float32Array(count * 3);
  const velocities = [];

  const cyanC  = new THREE.Color(COLORS.cyan);
  const amberC = new THREE.Color(COLORS.amber);

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

    const col = Math.random() > 0.35 ? cyanC : amberC;
    colours[i * 3]     = col.r;
    colours[i * 3 + 1] = col.g;
    colours[i * 3 + 2] = col.b;

    velocities.push({
      x: (Math.random() - 0.5) * 0.005,
      y: (Math.random() - 0.5) * 0.005,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
    });
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colours, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
  });

  scene.add(new THREE.Points(geo, mat));

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
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });
}

// ─── Hero Three.js WebGL Scene ───────────────────────────────────────────────

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
    bloom: { strength: 0.8, radius: 0.4, threshold: 0.85 },
    filmGrain: true,
    filmGrainIntensity: 0.2,
    exposure: 1.2,
  });
  camera.position.set(0, 0, heroCamZ);
  // Override label renderer z-index style for hero
  labelRenderer.domElement.style.zIndex = '2';

  // Particle field — 800 points
  {
    const count = 800;
    const pos   = new Float32Array(count * 3);
    const col   = new Float32Array(count * 3);
    const cC = new THREE.Color(COLORS.cyan);
    const aC = new THREE.Color(COLORS.amber);
    const pC = new THREE.Color(COLORS.pink);

    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 80;
      pos[i*3+1] = (Math.random() - 0.5) * 50;
      pos[i*3+2] = (Math.random() - 0.5) * 30;
      const r = Math.random();
      const c = r < 0.6 ? cC : r < 0.85 ? aC : pC;
      col[i*3]   = c.r;
      col[i*3+1] = c.g;
      col[i*3+2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    })));
  }

  // Floating intelligence labels (CSS2DObjects)
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

  // Crosshair reticles
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

  // Garud eagle wireframe
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

  // Radar sweep
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

    // Radar ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(21.5, 22, 64),
      new THREE.MeshBasicMaterial({ color: COLORS.amber, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    ring.position.z = -6;
    scene.add(ring);

    // Inner rings
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

  // Animation loop
  let paused = false;

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) animate();
  });

  function animate() {
    if (paused) return;
    requestAnimationFrame(animate);

    const t = performance.now() * 0.001;

    scene.traverse(obj => {
      if (obj.userData?.isSweep) {
        obj.rotation.z = -t * (Math.PI / 2);
      }
      if (obj.userData?.rotate) {
        obj.rotation.y = Math.sin(t * 0.1) * 0.15;
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

    camera.position.x = Math.sin(t * 0.07) * 1.5;
    camera.position.y = Math.cos(t * 0.05) * 0.8;
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

initBackgroundScene();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroScene);
} else {
  initHeroScene();
}
