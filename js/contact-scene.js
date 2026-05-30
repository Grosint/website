/**
 * GROSINT — Contact Page Three.js Scene
 * Secure transmission visualization: rotating torus, spiral particles,
 * pulsing rings, connection mesh. Reinforces "classified briefing" aesthetic.
 */

import {
  createScene,
  createResizeHandler,
  createVisibilityObserver,
} from './three-scene.js';
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const COLORS = {
  amber:  0xE87D14,
  cyan:   0x00C8FF,
  pink:   0xFF2D78,
};

function initContactScene() {
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return;

  const parent = canvas.parentElement;
  const isMobile = window.innerWidth < 768;

  const { scene, camera, renderer, composer, bloomPass, labelRenderer } = createScene(canvas, {
    fov: isMobile ? 80 : 55,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    bloom: { strength: 0.9, radius: 0.45, threshold: 0.8 },
    filmGrain: true,
    filmGrainIntensity: 0.2,
    exposure: 1.2,
  });

  camera.position.set(0, 0, isMobile ? 30 : 25);

  // ── Central torus — secure channel ring ──
  const torusGeo = new THREE.TorusGeometry(8, 0.06, 16, 120);
  const torusMat = new THREE.MeshBasicMaterial({
    color: COLORS.amber,
    transparent: true,
    opacity: 0.3,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = Math.PI * 0.4;
  scene.add(torus);

  // ── Outer ring — counter-rotating ──
  const outerGeo = new THREE.TorusGeometry(14, 0.03, 12, 100);
  const outerMat = new THREE.MeshBasicMaterial({
    color: COLORS.cyan,
    transparent: true,
    opacity: 0.12,
  });
  const outerRing = new THREE.Mesh(outerGeo, outerMat);
  outerRing.rotation.x = Math.PI * 0.55;
  outerRing.rotation.y = Math.PI * 0.15;
  scene.add(outerRing);

  // ── Third ring — perpendicular accent ──
  const thirdGeo = new THREE.TorusGeometry(11, 0.02, 8, 80);
  const thirdMat = new THREE.MeshBasicMaterial({
    color: COLORS.pink,
    transparent: true,
    opacity: 0.08,
  });
  const thirdRing = new THREE.Mesh(thirdGeo, thirdMat);
  thirdRing.rotation.x = Math.PI * 0.8;
  thirdRing.rotation.z = Math.PI * 0.3;
  scene.add(thirdRing);

  // ── Pulsing concentric rings ──
  const pulseRings = [];
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.RingGeometry(0.5, 0.6, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: COLORS.amber,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.4;
    ring.userData = { phase: (i / 3) * Math.PI * 2, speed: 0.4 };
    scene.add(ring);
    pulseRings.push(ring);
  }

  // ── Spiral inward particles — data flowing to center ──
  const particleCount = 250;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const particleData = [];

  const cyanC = new THREE.Color(COLORS.cyan);
  const amberC = new THREE.Color(COLORS.amber);

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 15;
    const height = (Math.random() - 0.5) * 12;

    particlePositions[i * 3] = Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = height;
    particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

    const col = Math.random() > 0.4 ? cyanC : amberC;
    particleColors[i * 3] = col.r;
    particleColors[i * 3 + 1] = col.g;
    particleColors[i * 3 + 2] = col.b;

    particleData.push({
      angle,
      radius,
      height,
      speed: 0.15 + Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 0.5,
    });
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Connection mesh lines — network visualization ──
  const lineMat = new THREE.LineBasicMaterial({
    color: COLORS.cyan,
    transparent: true,
    opacity: 0.06,
  });

  const lineData = [];
  for (let i = 0; i < 10; i++) {
    const pts = [
      new THREE.Vector3((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10),
      new THREE.Vector3((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10),
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(lineGeo, lineMat.clone());
    line.userData = { phase: Math.random() * Math.PI * 2 };
    scene.add(line);
    lineData.push(line);
  }

  // ── Radar sweep ──
  const sweepGeo = new THREE.CircleGeometry(16, 64, 0, Math.PI * 0.12);
  const sweep = new THREE.Mesh(sweepGeo, new THREE.MeshBasicMaterial({
    color: COLORS.amber,
    transparent: true,
    opacity: 0.04,
    side: THREE.DoubleSide,
    depthWrite: false,
  }));
  sweep.position.z = -4;
  sweep.rotation.x = Math.PI * 0.4;
  scene.add(sweep);

  // ── Floating labels ──
  if (!isMobile && labelRenderer) {
    const labels = ['/secure', '/encrypted', '/sovereign', '/direct', '/briefing'];
    const labelColors = ['#E87D14', '#00C8FF', '#00C8FF', '#FF2D78', '#E87D14'];

    labels.forEach((text, i) => {
      const div = document.createElement('div');
      div.textContent = text;
      div.style.cssText = `
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: ${labelColors[i]};
        opacity: 0;
        white-space: nowrap;
        letter-spacing: 0.1em;
        text-shadow: 0 0 6px currentColor;
        transition: opacity 0.8s ease;
      `;

      const label = new CSS2DObject(div);
      const angle = (i / labels.length) * Math.PI * 2;
      const r = 10 + Math.random() * 6;
      label.position.set(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 8,
        Math.sin(angle) * r * 0.5 - 3
      );
      scene.add(label);

      setTimeout(() => { div.style.opacity = '0.5'; }, 800 + i * 400);
    });
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.08));

  // ── Mouse tracking ──
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── Animation ──
  let paused = false;

  createVisibilityObserver(parent, (visible) => {
    paused = !visible;
    if (visible) animate();
  });

  function animate() {
    if (paused) return;
    requestAnimationFrame(animate);

    const t = performance.now() * 0.001;

    // Rotate rings
    torus.rotation.z = t * 0.12;
    outerRing.rotation.z = -t * 0.08;
    thirdRing.rotation.z = t * 0.06;

    // Radar sweep
    sweep.rotation.z = -t * 0.4;

    // Pulse rings — expand and fade
    pulseRings.forEach((ring) => {
      const cycle = ((t * ring.userData.speed + ring.userData.phase) % (Math.PI * 2)) / (Math.PI * 2);
      const scale = 1 + cycle * 18;
      ring.scale.set(scale, scale, 1);
      ring.material.opacity = (1 - cycle) * 0.25;
    });

    // Spiral particles inward
    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const d = particleData[i];
      d.angle += d.speed * 0.008;
      // Slowly spiral inward then reset
      d.radius -= 0.005;
      if (d.radius < 2) {
        d.radius = 15 + Math.random() * 5;
        d.angle = Math.random() * Math.PI * 2;
      }

      pos[i * 3] = Math.cos(d.angle) * d.radius;
      pos[i * 3 + 1] = d.height + Math.sin(t * d.speed + d.drift) * 0.8;
      pos[i * 3 + 2] = Math.sin(d.angle) * d.radius;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Connection lines drift
    lineData.forEach((line) => {
      line.material.opacity = 0.03 + Math.sin(t * 0.5 + line.userData.phase) * 0.03;
    });

    // Mouse-reactive camera
    const targetX = mouseX * 2;
    const targetY = -mouseY * 1;
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    composer.render();
    if (labelRenderer) labelRenderer.render(scene, camera);
  }

  animate();

  createResizeHandler(parent, {
    camera, renderer, composer, bloomPass, labelRenderer,
    onResize: (w, h) => {
      const mobile = w < 768;
      camera.fov = mobile ? 80 : 55;
      camera.position.z = mobile ? 30 : 25;
      camera.updateProjectionMatrix();
    },
  });
}

// Init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactScene);
} else {
  initContactScene();
}
