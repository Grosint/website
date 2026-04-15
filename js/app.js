/**
 * GROSINT — Main Application Script
 * Handles: Nav, scroll reveals, 3D card tilt, Three.js hero + background scenes.
 */

import * as THREE from 'three';
import { EffectComposer }   from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }       from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }  from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass }         from 'three/addons/postprocessing/FilmPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

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

// ─── Page Load ──────────────────────────────────────────────────────────────

document.body.classList.add('loaded');

// ─── Navigation ─────────────────────────────────────────────────────────────

const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');

// Sticky scrolled state
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Mobile menu toggle
hamburger?.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on nav link click (mobile)
document.querySelectorAll('.navbar__links a').forEach(link => {
  link.addEventListener('click', () => {
    navbar.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ─── Scroll Reveal — IntersectionObserver ──────────────────────────────────

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // fire once
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-stagger, .border-trace').forEach(el => {
  revealObserver.observe(el);
});

// ─── 3D Card Tilt — Mouse Parallax ──────────────────────────────────────────

document.querySelectorAll('[data-tilt]').forEach(card => {
  const wrapper = card.parentElement; // card-3d-wrapper

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 → 0.5
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

  // Touch support — reset on touch end
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

  // Particle geometry — 600 drifting dots
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

    // Individual drift velocity
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

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let frameId;
  let paused = false;

  // Pause when tab hidden (saves GPU)
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) animate();
  });

  function animate() {
    if (paused) return;
    frameId = requestAnimationFrame(animate);

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

  // ── Renderer ──────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ── CSS2D overlay renderer (floating text labels) ─────────
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(W, H);
  labelRenderer.domElement.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
  `;
  canvas.parentElement.appendChild(labelRenderer.domElement);

  // ── Scene + Camera ────────────────────────────────────────
  // On portrait/mobile screens the radar ring (radius 22) clips at the sides.
  // Increase FOV and pull camera back so the full ring stays in view.
  const isMobile = W / H < 0.9;
  const heroFov  = isMobile ? 100 : 60;
  const heroCamZ = isMobile ? 42  : 35;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(heroFov, W / H, 0.1, 500);
  camera.position.set(0, 0, heroCamZ);

  // ── Post-processing: Bloom + Film grain ───────────────────
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(W, H),
    0.8,   // strength
    0.4,   // radius
    0.85   // threshold
  );
  composer.addPass(bloom);

  const film = new FilmPass(0.2, false);
  composer.addPass(film);

  // ── Particle field — 800 points (hero foreground) ─────────
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

    const mat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    scene.add(new THREE.Points(geo, mat));
  }

  // ── Floating intelligence labels (CSS2DObjects) ────────────
  // Skip on mobile — reduces clutter on narrow screens
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

    // Fade in with stagger, then cycle opacity
    const delay = i * 300 + 500;
    setTimeout(() => {
      div.style.opacity = '0.55';
      labelObjects.push({ label, div, phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.3 });
    }, delay);
  });

  // ── Crosshair reticles (LineSegments) ─────────────────────
  function makeReticle(color, x, y, z, scale = 1) {
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
    const s = scale * 2;
    const gap = s * 0.28;

    // Horizontal segments (left + right of gap)
    const pts = [
      new THREE.Vector3(-s, 0, 0), new THREE.Vector3(-gap, 0, 0),
      new THREE.Vector3( gap, 0, 0), new THREE.Vector3( s, 0, 0),
      // Vertical segments
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

  // ── Garud eagle wireframe (centre-back) ───────────────────
  {
    // Approximate eagle outline as wireframe polygon
    const pts = [
      [0,  10], [-3,  8], [-6,  6], [-14,  8], [-20, 5], [-22, 2],
      [-16,  1], [-8, 3], [-4,  0], [-5, -4], [-3, -8],
      [0, -10], [3, -8], [5, -4], [4, 0], [8, 3], [16, 1],
      [22, 2], [20, 5], [14, 8], [6, 6], [3, 8],
    ].map(([x, y]) => new THREE.Vector3(x * 0.6, y * 0.6, -8));

    const geo = new THREE.BufferGeometry().setFromPoints([...pts, pts[0]]); // close
    const mat = new THREE.LineBasicMaterial({
      color: COLORS.amber,
      transparent: true,
      opacity: 0.25,
    });

    const eagle = new THREE.Line(geo, mat);
    scene.add(eagle);

    // Slow Y rotation
    eagle.userData.rotate = true;
  }

  // ── Radar sweep disc ──────────────────────────────────────
  {
    const geo = new THREE.CircleGeometry(22, 64);
    const mat = new THREE.MeshBasicMaterial({
      color: COLORS.amber,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
    });

    // Build sweep as a thin wedge (pie slice) instead of full disc
    const sweepGeo = new THREE.CircleGeometry(22, 64, 0, Math.PI * 0.15);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: COLORS.amber,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const sweep = new THREE.Mesh(sweepGeo, sweepMat);
    sweep.position.z = -6;
    sweep.userData.isSweep = true;
    scene.add(sweep);

    // Radar ring
    const ringGeo = new THREE.RingGeometry(21.5, 22, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: COLORS.amber,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.z = -6;
    scene.add(ring);

    // Inner rings
    [14, 8].forEach(r => {
      const rg = new THREE.RingGeometry(r - 0.2, r, 64);
      const rm = new THREE.MeshBasicMaterial({
        color: COLORS.amber,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      });
      scene.add(new THREE.Mesh(rg, rm)).position.z = -6;
    });
  }

  // ── Ambient light ─────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.1));

  // ── Animation loop ────────────────────────────────────────
  let frameId;
  let paused = false;

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) animate();
  });

  function animate() {
    if (paused) return;
    frameId = requestAnimationFrame(animate);

    const t = performance.now() * 0.001;

    // Rotate radar sweep
    scene.traverse(obj => {
      if (obj.userData?.isSweep) {
        obj.rotation.z = -t * (Math.PI / 2); // one full rotation per 4s
      }
      if (obj.userData?.rotate) {
        obj.rotation.y = Math.sin(t * 0.1) * 0.15;
      }
    });

    // Pulse reticles
    reticles.forEach((r, i) => {
      r.material.opacity = 0.3 + Math.sin(t * 1.2 + r.userData.phase) * 0.4;
      r.rotation.z = t * 0.1 * (i % 2 === 0 ? 1 : -1);
    });

    // Float labels
    labelObjects.forEach(({ label, div, phase, speed }) => {
      label.position.y += Math.sin(t * speed + phase) * 0.004;
      label.position.x += Math.cos(t * speed * 0.6 + phase) * 0.002;
    });

    // Subtle camera drift
    camera.position.x = Math.sin(t * 0.07) * 1.5;
    camera.position.y = Math.cos(t * 0.05) * 0.8;
    camera.lookAt(0, 0, 0);

    composer.render();
    labelRenderer.render(scene, camera);
  }

  animate();

  // ── Resize ────────────────────────────────────────────────
  const resizeObserver = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    camera.aspect = width / height;
    camera.fov = camera.aspect < 0.9 ? 100 : 60;
    camera.position.z = camera.aspect < 0.9 ? 42 : 35;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
    labelRenderer.setSize(width, height);
  });

  resizeObserver.observe(canvas.parentElement);
}

// ─── Init ────────────────────────────────────────────────────────────────────

// Background particle field — loads immediately
initBackgroundScene();

// Hero scene — waits for DOM ready (canvas exists)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroScene);
} else {
  initHeroScene();
}
