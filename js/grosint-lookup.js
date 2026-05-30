/**
 * Grosint SMINT — 3D Lookup Convergence Visualization (Enhanced)
 *
 * Data sources orbit a central profile node. Streams of data particles
 * flow inward. Sub-items float near each source. HUD-style wireframe grid.
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  createScene,
  createVisibilityObserver,
  createResizeHandler,
} from './three-scene.js';

const COLORS = {
  cyan:   0x00C8FF,
  amber:  0xE87D14,
  pink:   0xFF2D78,
  green:  0x3FB950,
  purple: 0x7B2FBE,
  white:  0xE6EDF3,
};

const SOURCES = [
  { icon: '📱', name: 'TELECOM',   color: COLORS.cyan,   angle: 0,               items: ['HLR Lookup', 'Caller ID', 'Carrier', 'Portability'] },
  { icon: '💬', name: 'SOCIAL',    color: COLORS.amber,  angle: Math.PI * 1/3,    items: ['WhatsApp', 'Telegram', 'Instagram', 'Facebook'] },
  { icon: '₹',  name: 'FINANCIAL', color: COLORS.green,  angle: Math.PI * 2/3,    items: ['UPI', 'PAN', 'Bank Acct', 'FASTag'] },
  { icon: '🪪', name: 'IDENTITY',  color: COLORS.purple, angle: Math.PI,          items: ['Voter ID', 'DL', 'Passport', 'Vehicle RC'] },
  { icon: '🔓', name: 'BREACH',    color: COLORS.pink,   angle: Math.PI * 4/3,    items: ['Exposures', 'Credentials', 'Dark Web'] },
  { icon: '✉️',  name: 'EMAIL',     color: COLORS.cyan,   angle: Math.PI * 5/3,    items: ['Profiles', 'Services', 'Aliases', 'Linked'] },
];

function initGrosintLookup() {
  const canvas = document.getElementById('grosint-canvas');
  if (!canvas) return;

  const parent = canvas.parentElement;
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    parent.style.display = 'none';
    const mobileFallback = document.getElementById('grosint-mobile');
    if (mobileFallback) mobileFallback.style.display = 'block';
    return;
  }

  const { scene, camera, renderer, composer, bloomPass, labelRenderer } = createScene(canvas, {
    fov: 50,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    bloom: { strength: 1.1, radius: 0.5, threshold: 0.75 },
    filmGrain: true,
    filmGrainIntensity: 0.18,
    exposure: 1.3,
  });

  camera.position.set(0, 0, 30);

  const orbitRadius = 11;

  // ── Wire grid ground plane — HUD depth ──
  {
    const gridGeo = new THREE.PlaneGeometry(60, 60, 30, 30);
    const gridMat = new THREE.MeshBasicMaterial({
      color: COLORS.cyan,
      wireframe: true,
      transparent: true,
      opacity: 0.025,
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.position.z = -8;
    scene.add(grid);
  }

  // ── Central Profile Node ──
  // Inner glowing core
  const centerCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 24, 24),
    new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.8 })
  );
  scene.add(centerCore);

  // Outer shell
  const centerShell = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 32),
    new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.08, wireframe: true })
  );
  scene.add(centerShell);

  // Rings around center
  const centerRings = [];
  [
    { r: 1.8, w: 0.03, o: 0.5, rx: 0, rz: 0 },
    { r: 2.5, w: 0.02, o: 0.2, rx: Math.PI * 0.35, rz: 0 },
    { r: 2.1, w: 0.02, o: 0.15, rx: Math.PI * 0.5, rz: Math.PI * 0.4 },
  ].forEach(cfg => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(cfg.r, cfg.w, 8, 64),
      new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: cfg.o })
    );
    ring.rotation.x = cfg.rx;
    ring.rotation.z = cfg.rz;
    scene.add(ring);
    centerRings.push(ring);
  });

  // Center label
  {
    const div = document.createElement('div');
    div.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:15px;letter-spacing:0.2em;color:#00C8FF;text-shadow:0 0 10px #00C8FF;margin-bottom:3px;font-weight:600;">⬢ INTELLIGENCE PROFILE</div>
        <div style="font-size:10px;letter-spacing:0.15em;color:#707080;">AGGREGATED · SOURCE-ATTRIBUTED</div>
      </div>`;
    div.style.cssText = 'font-family:"JetBrains Mono",monospace;white-space:nowrap;pointer-events:none;';
    const label = new CSS2DObject(div);
    label.position.set(0, -3.2, 0);
    scene.add(label);
  }

  // ── Pulse rings from center ──
  const pulseRings = [];
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.3, 0.4, 48),
      new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.userData = { phase: (i / 4) * Math.PI * 2 };
    scene.add(ring);
    pulseRings.push(ring);
  }

  // ── Orbit rings — dashed circle effect ──
  // Main orbit
  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(orbitRadius, 0.015, 8, 200),
    new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.1 })
  );
  scene.add(orbitRing);

  // Inner and outer subtle rings
  [orbitRadius - 2, orbitRadius + 2].forEach(r => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.008, 8, 128),
      new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.03 })
    );
    scene.add(ring);
  });

  // ── Source Nodes ──
  const sourceNodes = [];

  SOURCES.forEach((src, i) => {
    const group = new THREE.Group();
    const x = Math.cos(src.angle) * orbitRadius;
    const y = Math.sin(src.angle) * orbitRadius;
    group.position.set(x, y, 0);

    // Smaller, sharper node
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshBasicMaterial({ color: src.color, transparent: true, opacity: 0.7 })
    );
    group.add(sphere);

    // Node ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.015, 8, 32),
      new THREE.MeshBasicMaterial({ color: src.color, transparent: true, opacity: 0.4 })
    );
    group.add(ring);

    // Outer glow ring
    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.008, 8, 32),
      new THREE.MeshBasicMaterial({ color: src.color, transparent: true, opacity: 0.15 })
    );
    group.add(glowRing);

    // Source name label
    const colHex = '#' + new THREE.Color(src.color).getHexString();
    const nameDiv = document.createElement('div');
    nameDiv.innerHTML = `<div style="text-align:center;"><span style="font-size:22px;display:block;line-height:1;margin-bottom:3px;">${src.icon}</span><span style="font-size:13px;letter-spacing:0.18em;color:${colHex};text-shadow:0 0 10px ${colHex};font-weight:700;">${src.name}</span></div>`;
    nameDiv.style.cssText = 'font-family:"JetBrains Mono",monospace;white-space:nowrap;pointer-events:none;';
    const nameLabel = new CSS2DObject(nameDiv);
    nameLabel.position.set(0, -1.8, 0);
    group.add(nameLabel);

    // Sub-item labels floating near the source
    src.items.forEach((item, j) => {
      const itemDiv = document.createElement('div');
      itemDiv.textContent = item;
      itemDiv.style.cssText = `font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:0.1em;color:${colHex};opacity:0.6;white-space:nowrap;pointer-events:none;text-shadow:0 0 6px ${colHex};`;
      const itemLabel = new CSS2DObject(itemDiv);
      // Position items in a small arc around the source
      const itemAngle = src.angle + ((j - (src.items.length - 1) / 2) * 0.12);
      const itemR = 2.2 + j * 0.3;
      itemLabel.position.set(
        Math.cos(itemAngle) * itemR - x + Math.cos(src.angle) * itemR,
        Math.sin(itemAngle) * itemR - y + Math.sin(src.angle) * itemR,
        0
      );
      // Simpler: offset outward from source
      const outX = Math.cos(src.angle) * (1.8 + j * 0.4);
      const outY = Math.sin(src.angle) * (1.8 + j * 0.4) + (j - 1.5) * 0.8;
      itemLabel.position.set(outX, outY, 0);
      group.add(itemLabel);
    });

    scene.add(group);

    sourceNodes.push({
      group,
      color: src.color,
      baseAngle: src.angle,
      speed: 0.04 + i * 0.003,
      sphere,
    });
  });

  // ── Data Stream Particles — 500 flowing to center ──
  const streamCount = 500;
  const streamPositions = new Float32Array(streamCount * 3);
  const streamColors = new Float32Array(streamCount * 3);
  const streamSizes = new Float32Array(streamCount);
  const streamData = [];

  for (let i = 0; i < streamCount; i++) {
    const srcIdx = i % SOURCES.length;
    const col = new THREE.Color(SOURCES[srcIdx].color);
    streamColors[i * 3] = col.r;
    streamColors[i * 3 + 1] = col.g;
    streamColors[i * 3 + 2] = col.b;
    streamSizes[i] = 0.06 + Math.random() * 0.08;

    streamData.push({
      srcIdx,
      progress: Math.random(),
      speed: 0.004 + Math.random() * 0.008,
      offsetAngle: (Math.random() - 0.5) * 0.6,
      offsetZ: (Math.random() - 0.5) * 1,
    });
  }

  const streamGeo = new THREE.BufferGeometry();
  streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
  streamGeo.setAttribute('color', new THREE.BufferAttribute(streamColors, 3));

  scene.add(new THREE.Points(streamGeo, new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  })));

  // ── Animated connection lines (update each frame) ──
  const connectionLines = [];
  SOURCES.forEach((src, i) => {
    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
      color: src.color,
      transparent: true,
      opacity: 0.08,
    }));
    scene.add(line);
    connectionLines.push({ line, lineGeo, srcIdx: i });
  });

  // ── Radar sweep behind everything ──
  {
    const sweepGeo = new THREE.CircleGeometry(orbitRadius + 3, 64, 0, Math.PI * 0.1);
    const sweep = new THREE.Mesh(sweepGeo, new THREE.MeshBasicMaterial({
      color: COLORS.cyan,
      transparent: true,
      opacity: 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
    }));
    sweep.position.z = -2;
    sweep.userData = { isSweep: true };
    scene.add(sweep);
  }

  // ── Background particle field ──
  {
    const bgCount = 300;
    const bgPos = new Float32Array(bgCount * 3);
    const bgCol = new Float32Array(bgCount * 3);
    const cC = new THREE.Color(COLORS.cyan);
    const aC = new THREE.Color(COLORS.amber);

    for (let i = 0; i < bgCount; i++) {
      bgPos[i * 3] = (Math.random() - 0.5) * 70;
      bgPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      bgPos[i * 3 + 2] = (Math.random() - 0.5) * 25 - 10;
      const c = Math.random() > 0.6 ? cC : aC;
      bgCol[i * 3] = c.r;
      bgCol[i * 3 + 1] = c.g;
      bgCol[i * 3 + 2] = c.b;
    }

    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    bgGeo.setAttribute('color', new THREE.BufferAttribute(bgCol, 3));

    scene.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true,
    })));
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.06));

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

    // Center animations
    centerRings[0].rotation.z = t * 0.2;
    centerRings[1].rotation.z = -t * 0.12;
    centerRings[2].rotation.z = t * 0.08;
    centerShell.rotation.y = t * 0.1;
    centerShell.rotation.x = t * 0.07;
    centerCore.material.opacity = 0.6 + Math.sin(t * 2) * 0.2;

    // Pulse rings
    pulseRings.forEach(ring => {
      const cycle = ((t * 0.35 + ring.userData.phase) % (Math.PI * 2)) / (Math.PI * 2);
      ring.scale.set(1 + cycle * 5, 1 + cycle * 5, 1);
      ring.material.opacity = (1 - cycle) * 0.25;
    });

    // Source nodes orbit
    sourceNodes.forEach(node => {
      const angle = node.baseAngle + t * node.speed;
      node.group.position.set(
        Math.cos(angle) * orbitRadius,
        Math.sin(angle) * orbitRadius,
        Math.sin(t * 0.4 + node.baseAngle) * 0.4
      );
      // Pulse node sphere
      node.sphere.material.opacity = 0.5 + Math.sin(t * 1.5 + node.baseAngle) * 0.2;
    });

    // Update connection lines to follow orbiting sources
    connectionLines.forEach(({ lineGeo, srcIdx }) => {
      const node = sourceNodes[srcIdx];
      const positions = lineGeo.attributes.position.array;
      positions[0] = node.group.position.x;
      positions[1] = node.group.position.y;
      positions[2] = node.group.position.z;
      // Target is center (0,0,0)
      positions[3] = 0;
      positions[4] = 0;
      positions[5] = 0;
      lineGeo.attributes.position.needsUpdate = true;
    });

    // Data stream particles
    const pos = streamGeo.attributes.position.array;
    for (let i = 0; i < streamCount; i++) {
      const d = streamData[i];
      d.progress += d.speed;
      if (d.progress > 1) {
        d.progress = 0;
        d.offsetAngle = (Math.random() - 0.5) * 0.6;
        d.offsetZ = (Math.random() - 0.5) * 1;
      }

      const srcNode = sourceNodes[d.srcIdx];
      const srcX = srcNode.group.position.x;
      const srcY = srcNode.group.position.y;
      const p = d.progress;

      // Curved path from source to center
      const midX = srcX * 0.5 + Math.sin(d.offsetAngle + p * Math.PI) * 2;
      const midY = srcY * 0.5 + Math.cos(d.offsetAngle + p * Math.PI) * 2;

      // Quadratic bezier interpolation
      const t1 = 1 - p;
      pos[i * 3]     = t1 * t1 * srcX + 2 * t1 * p * midX + p * p * 0;
      pos[i * 3 + 1] = t1 * t1 * srcY + 2 * t1 * p * midY + p * p * 0;
      pos[i * 3 + 2] = d.offsetZ * t1;
    }
    streamGeo.attributes.position.needsUpdate = true;

    // Radar sweep
    scene.traverse(obj => {
      if (obj.userData?.isSweep) obj.rotation.z = -t * 0.3;
    });

    // Mouse-reactive camera
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    composer.render();
    if (labelRenderer) labelRenderer.render(scene, camera);
  }

  animate();

  createResizeHandler(parent, {
    camera, renderer, composer, bloomPass, labelRenderer,
    onResize: (w, h) => {
      camera.fov = w < 768 ? 70 : 50;
      camera.position.z = w < 768 ? 38 : 30;
      camera.updateProjectionMatrix();
    },
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGrosintLookup);
} else {
  initGrosintLookup();
}
