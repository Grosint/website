/**
 * Anveshak — Technical Moat Mini-Visualizations
 * Blended Similarity (Three.js dot clouds) + Leiden vs HDBSCAN (canvas 2D)
 */

import * as THREE from 'three';

const COLORS = {
  amber:  0xE87D14,
  cyan:   0x00C8FF,
  pink:   0xFF2D78,
  purple: 0x7B2FBE,
};

/* ─── Blended Similarity Visualization ──────────────────────── */

function initBlendedVis() {
  const canvas = document.getElementById('moat-blended-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  const w = container.clientWidth;
  const h = Math.max(container.clientHeight, 220);

  canvas.width = w;
  canvas.height = h;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // Two clusters of dots
  const clusterA = createCluster(40, new THREE.Vector3(-2.5, 0, 0), COLORS.cyan, 2.0);
  const clusterB = createCluster(40, new THREE.Vector3(2.5, 0, 0), COLORS.amber, 2.0);
  scene.add(clusterA.mesh, clusterB.mesh);

  // Shared entities (bridge dots) — start between clusters
  const bridgeDots = createCluster(8, new THREE.Vector3(0, 0, 0), COLORS.pink, 1.2);
  scene.add(bridgeDots.mesh);

  // Labels
  const labelA = createTextSprite('DARK WEB', COLORS.cyan);
  labelA.position.set(-2.5, -3, 0);
  scene.add(labelA);

  const labelB = createTextSprite('CERT-In', COLORS.amber);
  labelB.position.set(2.5, -3, 0);
  scene.add(labelB);

  const labelBridge = createTextSprite('SHARED ENTITIES', COLORS.pink);
  labelBridge.position.set(0, 3, 0);
  scene.add(labelBridge);

  let time = 0;
  let paused = false;

  const observer = new IntersectionObserver(([entry]) => {
    paused = !entry.isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  function animate() {
    if (!paused) {
      time += 0.005;

      // Gentle rotation
      clusterA.mesh.rotation.y = Math.sin(time) * 0.3;
      clusterB.mesh.rotation.y = Math.sin(time + 1) * 0.3;
      bridgeDots.mesh.rotation.y = time * 0.5;
      bridgeDots.mesh.rotation.x = Math.sin(time * 0.7) * 0.1;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }
  animate();
}

function createCluster(count, center, color, spread) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = center.x + (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = center.y + (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = center.z + (Math.random() - 0.5) * spread;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color,
    size: 0.18,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });

  return { mesh: new THREE.Points(geometry, material), positions };
}

function createTextSprite(text, color) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;

  ctx.font = '600 18px "JetBrains Mono", monospace';
  ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.6,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4, 1, 1);
  return sprite;
}

/* ─── Leiden vs HDBSCAN Visualization ───────────────────────── */

function initLeidenVis() {
  const canvas = document.getElementById('moat-leiden-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  const w = container.clientWidth;
  const h = Math.max(container.clientHeight, 220);

  canvas.width = w * window.devicePixelRatio;
  canvas.height = h * window.devicePixelRatio;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  // Generate two network graphs side by side
  const midX = w / 2;

  // Leiden side (left) — clean communities
  const leidenClusters = [
    generateClusterNodes(6, midX * 0.3, h * 0.35, 35, '#00C8FF'),
    generateClusterNodes(5, midX * 0.7, h * 0.35, 30, '#E87D14'),
    generateClusterNodes(4, midX * 0.5, h * 0.72, 28, '#FF2D78'),
  ];

  // HDBSCAN side (right) — messy with noise
  const hdbscanClusters = [
    generateClusterNodes(6, midX + midX * 0.3, h * 0.35, 35, '#00C8FF'),
    generateClusterNodes(5, midX + midX * 0.7, h * 0.35, 30, '#E87D14'),
  ];
  // Noise points for HDBSCAN
  const noiseNodes = [];
  for (let i = 0; i < 8; i++) {
    noiseNodes.push({
      x: midX + Math.random() * midX * 0.8 + midX * 0.1,
      y: h * 0.2 + Math.random() * h * 0.6,
      color: '#3D4451',
    });
  }

  let time = 0;
  let paused = false;

  const observer = new IntersectionObserver(([entry]) => {
    paused = !entry.isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  function draw() {
    if (paused) {
      requestAnimationFrame(draw);
      return;
    }

    time += 0.01;
    ctx.clearRect(0, 0, w, h);

    // Divider
    ctx.strokeStyle = '#1A2540';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, 10);
    ctx.lineTo(midX, h - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3FB950';
    ctx.fillText('LEIDEN', midX * 0.5, h - 12);
    ctx.fillStyle = '#F85149';
    ctx.fillText('HDBSCAN', midX + midX * 0.5, h - 12);

    // Draw Leiden clusters with intra-cluster edges
    leidenClusters.forEach(cluster => {
      drawClusterEdges(ctx, cluster, 0.15);
      cluster.forEach((node, i) => {
        const offsetX = Math.sin(time + i * 0.5) * 1.5;
        const offsetY = Math.cos(time * 0.7 + i * 0.3) * 1.5;
        drawNode(ctx, node.x + offsetX, node.y + offsetY, node.color, 4);
      });
    });

    // Bridge edge between Leiden clusters (correctly assigned)
    ctx.strokeStyle = 'rgba(255, 45, 120, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(leidenClusters[0][0].x, leidenClusters[0][0].y);
    ctx.lineTo(leidenClusters[1][0].x, leidenClusters[1][0].y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw HDBSCAN clusters
    hdbscanClusters.forEach(cluster => {
      drawClusterEdges(ctx, cluster, 0.1);
      cluster.forEach((node, i) => {
        const offsetX = Math.sin(time + i * 0.5) * 1.5;
        const offsetY = Math.cos(time * 0.7 + i * 0.3) * 1.5;
        drawNode(ctx, node.x + offsetX, node.y + offsetY, node.color, 4);
      });
    });

    // Draw HDBSCAN noise points (unmarked, grey)
    noiseNodes.forEach((node, i) => {
      const offsetX = Math.sin(time * 1.2 + i) * 2;
      const offsetY = Math.cos(time * 0.8 + i * 0.7) * 2;
      drawNode(ctx, node.x + offsetX, node.y + offsetY, node.color, 3);
      // X mark for noise
      ctx.strokeStyle = '#F85149';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      const nx = node.x + offsetX;
      const ny = node.y + offsetY;
      ctx.beginPath();
      ctx.moveTo(nx - 5, ny - 5);
      ctx.lineTo(nx + 5, ny + 5);
      ctx.moveTo(nx + 5, ny - 5);
      ctx.lineTo(nx - 5, ny + 5);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Status badges
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3FB950';
    ctx.fillText('✓ ALL CLUSTERED', midX * 0.5, 18);
    ctx.fillStyle = '#F85149';
    ctx.fillText('✗ 8 NOISE POINTS', midX + midX * 0.5, 18);

    requestAnimationFrame(draw);
  }
  draw();
}

function generateClusterNodes(count, cx, cy, radius, color) {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const r = radius * (0.4 + Math.random() * 0.6);
    nodes.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      color,
    });
  }
  return nodes;
}

function drawClusterEdges(ctx, nodes, opacity) {
  ctx.strokeStyle = nodes[0]?.color || '#1A2540';
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = opacity;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 60) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}

function drawNode(ctx, x, y, color, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  // Glow
  ctx.beginPath();
  ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.15;
  ctx.fill();
  ctx.globalAlpha = 1;
}

/* ─── Init ──────────────────────────────────────────────────── */

function init() {
  // Only init when the moat card is opened (lazy)
  const blendedCard = document.querySelector('[data-moat="blended"]');
  const leidenCard = document.querySelector('[data-moat="leiden"]');

  let blendedInit = false;
  let leidenInit = false;

  if (blendedCard) {
    const observer = new MutationObserver(() => {
      if (blendedCard.classList.contains('open') && !blendedInit) {
        blendedInit = true;
        setTimeout(initBlendedVis, 100); // Wait for CSS transition
      }
    });
    observer.observe(blendedCard, { attributes: true, attributeFilter: ['class'] });
  }

  if (leidenCard) {
    const observer = new MutationObserver(() => {
      if (leidenCard.classList.contains('open') && !leidenInit) {
        leidenInit = true;
        setTimeout(initLeidenVis, 100);
      }
    });
    observer.observe(leidenCard, { attributes: true, attributeFilter: ['class'] });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
