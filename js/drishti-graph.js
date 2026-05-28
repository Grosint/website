/**
 * Drishti — 3D Entity Resolution Graph Visualization
 *
 * An immersive, scroll-driven Three.js scene showing entity resolution
 * across 7 intelligence domains. Features: domain clusters, entity merging,
 * alert sweeps, evidence crystallization, scroll-pinned camera, bloom glow.
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  createScene,
  createVisibilityObserver,
  createResizeHandler,
  setupScrollPin,
} from './three-scene.js';

/* ─── Constants ─────────────────────────────────────────────── */

const DOMAIN_COLORS = {
  maritime:    new THREE.Color(0x00C8FF), // cyan
  aviation:    new THREE.Color(0xE87D14), // amber
  procurement: new THREE.Color(0xFF2D78), // pink
  financial:   new THREE.Color(0x3FB950), // green
  social:      new THREE.Color(0x7B2FBE), // purple
  sanctions:   new THREE.Color(0xFF4444), // red
  cyber:       new THREE.Color(0xC8D1D9), // white/muted
};

const DOMAINS = [
  { id: 0, key: 'maritime',    label: 'MARITIME',    color: DOMAIN_COLORS.maritime,    angle: 0,             desc: 'AIS vessel tracking, dark gap detection, STS transfers' },
  { id: 1, key: 'aviation',    label: 'AVIATION',    color: DOMAIN_COLORS.aviation,    angle: Math.PI * 2/7, desc: 'ADS-B transponders, rogue UAV detection, flight plans' },
  { id: 2, key: 'procurement', label: 'PROCUREMENT', color: DOMAIN_COLORS.procurement, angle: Math.PI * 4/7, desc: 'Government e-Marketplace, defence contracts, MCA registry' },
  { id: 3, key: 'financial',   label: 'FINANCIAL',   color: DOMAIN_COLORS.financial,   angle: Math.PI * 6/7, desc: 'Sanctions screening, crypto intel, transaction patterns' },
  { id: 4, key: 'social',      label: 'SOCIAL',      color: DOMAIN_COLORS.social,      angle: Math.PI * 8/7, desc: 'Telegram, X, Instagram, LinkedIn monitoring' },
  { id: 5, key: 'sanctions',   label: 'SANCTIONS',   color: DOMAIN_COLORS.sanctions,   angle: Math.PI * 10/7, desc: 'Global sanctions lists, Indian enforcement, PEP screening' },
  { id: 6, key: 'cyber',       label: 'CYBER',       color: DOMAIN_COLORS.cyber,       angle: Math.PI * 12/7, desc: 'MISP, OTX, VirusTotal, dark web threat indicators' },
];

const STAGE_TITLES = [
  'Entity Resolution Graph — Overview',
  'Maritime Domain — Vessel Tracking & Dark Gap Detection',
  'Aviation Domain — Transponder Monitoring & UAV Detection',
  'Procurement Domain — Contract & Ownership Intelligence',
  'Financial & Sanctions — Cross-Border Pattern Detection',
  'Social & Cyber — Identifier Cross-Match',
  'Full Graph — Alert Engine & Evidence Bundles',
];

const STAGE_DESCS = [
  'Seven intelligence domains feed into a unified knowledge graph. Each domain contributes entities — vessels, aircraft, companies, persons, accounts — that are resolved and merged across domains.',
  'AIS vessel positions stream in real-time. The dark gap engine detects transponder blackouts exceeding 2 hours within the EEZ. Ship-to-ship transfer detection identifies vessels within 20nm proximity during dark periods.',
  'ADS-B transponder data merged with DGCA registry. Rogue UAV detection fires when an aircraft operates without transponder, flight plan, or inside a prohibited geofence. Cross-referenced with procurement records.',
  'Government e-Marketplace, CPPP, IREPS, MoD eProcure, and MCA company registry data. Beneficial ownership chains traced through shell company layers. Sensitive facility access patterns detected.',
  'OpenSanctions and crypto intelligence merged with entity graph. Ownership chains traversed to detect sanctions exposure through intermediary shell companies. Financial transaction patterns flagged.',
  'Social media accounts linked to entities via phone numbers and email addresses. Geotagged posts cross-referenced with restricted facility geofences. Account clustering reveals coordinated networks.',
  'All 11 alert rules fire on every entity update. CRITICAL alerts require confirmation from 2+ independent domains. Evidence bundles generated with SHA-256 signed, immutable chain of custody.',
];

const STAGE_TITLES_HI = [
  'इकाई समाधान ग्राफ — अवलोकन',
  'समुद्री डोमेन — जहाज ट्रैकिंग और डार्क गैप डिटेक्शन',
  'विमानन डोमेन — ट्रांसपॉन्डर मॉनिटरिंग और UAV डिटेक्शन',
  'खरीद डोमेन — अनुबंध और स्वामित्व इंटेलिजेंस',
  'वित्तीय और प्रतिबंध — सीमा-पार पैटर्न डिटेक्शन',
  'सोशल और साइबर — आइडेंटिफायर क्रॉस-मैच',
  'पूर्ण ग्राफ — अलर्ट इंजन और साक्ष्य बंडल',
];

const STAGE_DESCS_HI = [
  'सात इंटेलिजेंस डोमेन एक एकीकृत ज्ञान ग्राफ में फीड करते हैं। प्रत्येक डोमेन इकाइयाँ योगदान करता है — जहाज, विमान, कंपनियाँ, व्यक्ति, खाते — जो डोमेन में हल और मर्ज होती हैं।',
  'AIS जहाज स्थिति वास्तविक समय में स्ट्रीम होती है। डार्क गैप इंजन EEZ के भीतर 2 घंटे से अधिक के ट्रांसपॉन्डर ब्लैकआउट का पता लगाता है। जहाज-से-जहाज स्थानांतरण डिटेक्शन अंधेरे अवधि में 20nm निकटता में जहाजों की पहचान करता है।',
  'ADS-B ट्रांसपॉन्डर डेटा DGCA रजिस्ट्री के साथ मर्ज। रोग UAV डिटेक्शन तब फायर होता है जब कोई विमान बिना ट्रांसपॉन्डर, फ्लाइट प्लान, या निषिद्ध जियोफेंस के अंदर संचालित होता है।',
  'सरकारी ई-मार्केटप्लेस, CPPP, IREPS, MoD eProcure, और MCA कंपनी रजिस्ट्री डेटा। शेल कंपनी परतों के माध्यम से लाभकारी स्वामित्व श्रृंखलाओं का पता लगाया जाता है।',
  'OpenSanctions और क्रिप्टो इंटेलिजेंस इकाई ग्राफ के साथ मर्ज। मध्यस्थ शेल कंपनियों के माध्यम से प्रतिबंध एक्सपोज़र का पता लगाने के लिए स्वामित्व श्रृंखलाओं को पार किया जाता है।',
  'सोशल मीडिया खाते फोन नंबर और ईमेल पते के माध्यम से इकाइयों से जुड़े। जियोटैग पोस्ट प्रतिबंधित सुविधा जियोफेंस के साथ क्रॉस-रेफरेंस। खाता क्लस्टरिंग समन्वित नेटवर्क प्रकट करता है।',
  'सभी 11 अलर्ट नियम हर इकाई अपडेट पर फायर होते हैं। क्रिटिकल अलर्ट 2+ स्वतंत्र डोमेन से पुष्टि की आवश्यकता है। SHA-256 हस्ताक्षरित, अपरिवर्तनीय हिरासत श्रृंखला के साथ साक्ष्य बंडल उत्पन्न।',
];

/* ─── Helpers ───────────────────────────────────────────────── */

const CLUSTER_RADIUS = 8;   // radius of domain clusters from center
const NODE_SPREAD = 1.8;    // how spread out nodes within a cluster are

function getDomainClusterCenter(domain) {
  return new THREE.Vector3(
    Math.cos(domain.angle) * CLUSTER_RADIUS,
    Math.sin(domain.angle) * CLUSTER_RADIUS,
    0
  );
}

function createDomainNodes(domain, count) {
  const center = getDomainClusterCenter(domain);
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = Math.random() * NODE_SPREAD;
    const z = (Math.random() - 0.5) * 1.2;
    nodes.push(new THREE.Vector3(
      center.x + Math.cos(theta) * r,
      center.y + Math.sin(theta) * r,
      z
    ));
  }
  return nodes;
}

/* ─── Main ──────────────────────────────────────────────────── */

function initGraph() {
  const canvas = document.getElementById('graph-canvas');
  const wrapper = document.getElementById('graph-canvas-wrapper');
  if (!canvas || !wrapper) return;
  if (window.matchMedia('(max-width: 767px)').matches) return;

  /* ── Scene (shared factory) ── */
  const { scene, camera, renderer, composer, bloomPass, labelRenderer } = createScene(canvas, {
    fov: 50,
    fog: { density: 0.008 },
    bloom: { strength: 0.8, radius: 0.4, threshold: 0.75 },
    exposure: 1.2,
    far: 200,
    labelParent: wrapper,
  });
  camera.position.set(0, 0, 28);

  /* ── Lighting ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const keyLight = new THREE.PointLight(0x7B2FBE, 2.0, 60);
  keyLight.position.set(0, 8, 15);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0x00C8FF, 0.5, 50);
  fillLight.position.set(-10, -5, 10);
  scene.add(fillLight);

  /* ── Grid Floor ── */
  const gridHelper = new THREE.GridHelper(50, 50, 0x0A1628, 0x0A1628);
  gridHelper.position.y = -8;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.12;
  gridHelper.rotation.x = Math.PI / 2;
  scene.add(gridHelper);

  /* ── Star field ── */
  const starGeom = new THREE.BufferGeometry();
  const starPos = new Float32Array(400 * 3);
  const starCols = new Float32Array(400 * 3);
  for (let i = 0; i < 400; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 100;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 15;
    const c = Math.random() < 0.5 ? DOMAIN_COLORS.maritime : (Math.random() < 0.5 ? DOMAIN_COLORS.social : DOMAIN_COLORS.cyber);
    starCols[i * 3] = c.r * 0.25;
    starCols[i * 3 + 1] = c.g * 0.25;
    starCols[i * 3 + 2] = c.b * 0.25;
  }
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeom.setAttribute('color', new THREE.BufferAttribute(starCols, 3));
  scene.add(new THREE.Points(starGeom, new THREE.PointsMaterial({
    size: 0.07, transparent: true, opacity: 0.4, vertexColors: true,
  })));

  /* ── Domain Cluster Nodes ── */
  const domainGroups = []; // THREE.Group per domain
  const domainNodeMeshes = []; // Array of arrays: domainNodeMeshes[domainIdx][nodeIdx]
  const domainLabels = []; // CSS2D labels
  const domainNodePositions = []; // positions per domain
  const nodeGeom = new THREE.SphereGeometry(0.15, 12, 12);
  const nodesPerDomain = 8;

  DOMAINS.forEach((domain, di) => {
    const group = new THREE.Group();
    scene.add(group);
    domainGroups.push(group);

    // Node positions
    const positions = createDomainNodes(domain, nodesPerDomain);
    domainNodePositions.push(positions);

    // Meshes
    const meshes = [];
    positions.forEach((pos) => {
      const mat = new THREE.MeshStandardMaterial({
        color: domain.color.clone().multiplyScalar(0.3),
        emissive: domain.color,
        emissiveIntensity: 0.4,
        metalness: 0.8,
        roughness: 0.3,
      });
      const mesh = new THREE.Mesh(nodeGeom, mat);
      mesh.position.copy(pos);
      group.add(mesh);
      meshes.push(mesh);
    });
    domainNodeMeshes.push(meshes);

    // Domain label
    const center = getDomainClusterCenter(domain);
    const labelEl = document.createElement('div');
    labelEl.className = 'pipeline-label';
    labelEl.style.cssText = `font-size:10px;color:${domain.color.getStyle()};letter-spacing:0.15em;opacity:0.7;`;
    labelEl.textContent = domain.label;
    const labelObj = new CSS2DObject(labelEl);
    labelObj.position.set(center.x, center.y + NODE_SPREAD + 0.6, 0);
    group.add(labelObj);
    domainLabels.push(labelEl);
  });

  /* ── Central Resolved Entities ── */
  const resolvedGroup = new THREE.Group();
  scene.add(resolvedGroup);

  const resolvedGeom = new THREE.IcosahedronGeometry(0.4, 2);
  const resolvedNodes = [];
  const resolvedCount = 5;
  for (let i = 0; i < resolvedCount; i++) {
    const angle = (i / resolvedCount) * Math.PI * 2;
    const r = 1.5 + Math.random() * 1.0;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x2A1A40),
      emissive: new THREE.Color(0xA78BFA),
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0,
    });
    const mesh = new THREE.Mesh(resolvedGeom, mat);
    mesh.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
    resolvedGroup.add(mesh);
    resolvedNodes.push(mesh);

    // Wireframe shell
    const wfMat = new THREE.MeshBasicMaterial({
      color: 0xA78BFA, wireframe: true, transparent: true, opacity: 0,
    });
    const wf = new THREE.Mesh(resolvedGeom, wfMat);
    wf.scale.setScalar(1.4);
    mesh.add(wf);
    mesh.userData.wireframe = wf;
  }

  /* ── Connecting Edges (animated dashed lines) ── */
  const edgeLines = [];
  const edgeMaterial = new THREE.LineDashedMaterial({
    color: 0xA78BFA,
    dashSize: 0.2,
    gapSize: 0.15,
    transparent: true,
    opacity: 0,
  });

  // Create edges from each domain toward resolved center nodes
  DOMAINS.forEach((domain, di) => {
    const center = getDomainClusterCenter(domain);
    const target = resolvedNodes[di % resolvedCount].position;
    const pts = [
      new THREE.Vector3(center.x, center.y, 0),
      new THREE.Vector3(target.x, target.y, 0),
    ];
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({
      color: domain.color,
      dashSize: 0.2,
      gapSize: 0.12,
      transparent: true,
      opacity: 0,
    });
    const line = new THREE.Line(geom, mat);
    line.computeLineDistances();
    scene.add(line);
    edgeLines.push(line);
  });

  /* ── Alert Sweep Arc ── */
  const sweepGeom = new THREE.CircleGeometry(3.5, 32, 0, Math.PI / 5);
  const sweepMat = new THREE.MeshBasicMaterial({
    color: 0xFF4444,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const alertSweep = new THREE.Mesh(sweepGeom, sweepMat);
  scene.add(alertSweep);

  /* ── Evidence Lock Cubes ── */
  const evidenceCubes = [];
  const cubeGeom = new THREE.BoxGeometry(0.25, 0.25, 0.25);
  resolvedNodes.forEach((node) => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xA78BFA,
      emissive: 0xA78BFA,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0,
    });
    const cube = new THREE.Mesh(cubeGeom, mat);
    cube.position.set(0, 0.7, 0);
    node.add(cube);
    evidenceCubes.push(cube);
  });

  /* ── Floating HUD Labels ── */
  const hudLabels = ['/entity-resolve', '/fuse-domains', '/alert-engine', '/evidence-bundle', '/sanctions-match', '/dark-gap'];
  hudLabels.forEach((text, i) => {
    const el = document.createElement('div');
    el.className = 'pipeline-label';
    el.style.cssText = `font-size:9px;opacity:0.1;color:${i % 2 === 0 ? '#A78BFA' : '#00C8FF'}`;
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 14,
      -5 + Math.random() * -5
    );
    scene.add(obj);
  });

  /* ── Camera Path ── */
  function buildCameraPath() {
    const points = [];
    // Stage 0: Overview
    points.push(new THREE.Vector3(0, 0, 28));

    // Stages 1-6: focus on each domain, staying centered
    DOMAINS.forEach((domain) => {
      const center = getDomainClusterCenter(domain);
      points.push(new THREE.Vector3(
        center.x * 0.3,
        center.y * 0.3,
        20
      ));
    });

    // Stage 7: Back to center for full graph
    points.push(new THREE.Vector3(0, 0, 22));

    return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
  }
  const cameraPath = buildCameraPath();

  /* ── State ── */
  let activeStage = -1;
  let scrollProgress = 0;
  let graphActive = false;
  let paused = false;
  let time = 0;

  const detailPanel = document.getElementById('graph-detail');
  const detailStep = document.getElementById('graph-detail-step');
  const detailTitle = document.getElementById('graph-detail-title');
  const detailDesc = document.getElementById('graph-detail-desc');

  // Progress dots
  const progressContainer = document.getElementById('graph-progress');
  const progressDots = [];
  if (progressContainer) {
    for (let i = 0; i < 7; i++) {
      const dot = document.createElement('div');
      dot.className = 'pipeline-progress__dot';
      dot.addEventListener('click', () => {
        const trigger = window._graphScrollTrigger;
        if (trigger) {
          const targetScroll = trigger.start + (trigger.end - trigger.start) * (i / 6);
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      });
      progressContainer.appendChild(dot);
      progressDots.push(dot);
    }
  }

  /* ── Stage Update ── */
  function updateActiveStage(index) {
    if (index === activeStage) return;
    activeStage = index;

    // Highlight active domain
    DOMAINS.forEach((domain, di) => {
      const isActive = (index === 0) || (di === index - 1) || (index === 6);
      const isFocused = di === index - 1;

      domainNodeMeshes[di].forEach((mesh) => {
        mesh.material.emissiveIntensity = isFocused ? 1.0 : (isActive ? 0.4 : 0.15);
        mesh.scale.setScalar(isFocused ? 1.5 : 1.0);
      });

      domainLabels[di].style.opacity = isFocused ? '1' : (isActive ? '0.7' : '0.3');
    });

    // Show resolved nodes progressively
    const resolvedProgress = Math.max(0, (index - 1) / 5);
    resolvedNodes.forEach((node, ni) => {
      const visible = ni / resolvedCount <= resolvedProgress;
      node.material.opacity = visible ? 0.9 : 0;
      node.userData.wireframe.material.opacity = visible ? 0.15 : 0;
    });

    // Show edges progressively
    edgeLines.forEach((line, li) => {
      line.material.opacity = li < index ? 0.35 : 0;
    });

    // Alert sweep on final stage
    sweepMat.opacity = index >= 5 ? 0.12 : 0;

    // Evidence cubes on final stage
    evidenceCubes.forEach((cube) => {
      cube.material.opacity = index >= 6 ? 0.9 : 0;
    });

    // Detail panel
    if (detailPanel && detailStep && detailTitle && detailDesc) {
      const stageNum = index + 1;
      detailStep.textContent = index === 0 ? 'OVERVIEW' : (index === 6 ? 'FULL GRAPH' : `DOMAIN ${String(index).padStart(2, '0')}`);
      const isHi = document.documentElement.lang === 'hi';
      detailTitle.textContent = isHi ? STAGE_TITLES_HI[index] : STAGE_TITLES[index];
      detailDesc.textContent = isHi ? STAGE_DESCS_HI[index] : STAGE_DESCS[index];
      if (graphActive) detailPanel.classList.add('active');
    }

    // Progress dots
    progressDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  /* ── ScrollTrigger (shared factory) ── */
  (async () => {
    const st = await setupScrollPin('#graph-section', {
      snapCount: 6,
      onUpdate: (self) => {
        scrollProgress = self.progress;
        const stageIndex = Math.round(self.progress * 6);
        updateActiveStage(Math.min(stageIndex, 6));
      },
      onEnter: () => {
        graphActive = true;
        if (detailPanel) detailPanel.classList.add('active');
      },
      onLeave: () => {
        graphActive = false;
        if (detailPanel) detailPanel.classList.remove('active');
      },
      onEnterBack: () => {
        graphActive = true;
        if (detailPanel) detailPanel.classList.add('active');
      },
      onLeaveBack: () => {
        graphActive = false;
        if (detailPanel) detailPanel.classList.remove('active');
      },
    });
    if (st) {
      window._graphScrollTrigger = st;
    } else {
      updateActiveStage(0);
    }
  })();

  /* ── Visibility (shared factory) ── */
  createVisibilityObserver(wrapper, (isVisible) => { paused = !isVisible; });

  /* ── Resize (shared factory) ── */
  createResizeHandler(wrapper, { camera, renderer, composer, bloomPass, labelRenderer });

  /* ── Particle Flow (domain nodes streaming toward center) ── */
  const particleCount = window.matchMedia('(max-width: 1024px)').matches ? 60 : 120;
  const pGeom = new THREE.SphereGeometry(0.05, 6, 6);
  const pMat = new THREE.MeshBasicMaterial({ color: 0xA78BFA, transparent: true, opacity: 0.7 });
  const particleMesh = new THREE.InstancedMesh(pGeom, pMat, particleCount);
  scene.add(particleMesh);

  const particleColors = new Float32Array(particleCount * 3);
  const particleData = [];
  for (let i = 0; i < particleCount; i++) {
    const di = i % 7;
    const c = DOMAINS[di].color;
    particleColors[i * 3] = c.r;
    particleColors[i * 3 + 1] = c.g;
    particleColors[i * 3 + 2] = c.b;
    const center = getDomainClusterCenter(DOMAINS[di]);
    particleData.push({
      domainIdx: di,
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
      start: center.clone(),
      end: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        0
      ),
    });
  }
  particleMesh.instanceColor = new THREE.InstancedBufferAttribute(particleColors, 3);

  const dummy = new THREE.Object3D();

  /* ── Animation Loop ── */
  function animate() {
    requestAnimationFrame(animate);
    if (paused) return;
    time += 0.006;

    // Camera follows path
    const pathT = Math.max(0.001, Math.min(0.999, scrollProgress));
    const camPos = cameraPath.getPointAt(pathT);
    camera.position.lerp(camPos, 0.05);

    // Look at center with slight bias toward active domain
    const lookTarget = new THREE.Vector3(0, 0, 0);
    if (activeStage >= 1 && activeStage <= 5) {
      const domainCenter = getDomainClusterCenter(DOMAINS[activeStage - 1]);
      lookTarget.x = domainCenter.x * 0.15;
      lookTarget.y = domainCenter.y * 0.15;
    }
    camera.lookAt(lookTarget);

    // ── Animate domain nodes (subtle float)
    domainNodeMeshes.forEach((meshes, di) => {
      meshes.forEach((mesh, ni) => {
        mesh.position.x += Math.sin(time * 0.5 + ni * 1.3 + di) * 0.001;
        mesh.position.y += Math.cos(time * 0.4 + ni * 0.9 + di * 0.5) * 0.001;
        mesh.rotation.y = time * 0.2 + ni * 0.3;
      });
    });

    // ── Animate resolved nodes (rotation, pulse)
    resolvedNodes.forEach((node, ni) => {
      if (node.material.opacity > 0) {
        node.rotation.y = time * 0.3 + ni * 1.0;
        node.rotation.x = Math.sin(time * 0.4 + ni * 0.8) * 0.1;
        const s = 1 + Math.sin(time * 1.5 + ni * 1.2) * 0.05;
        node.scale.setScalar(s);
      }
    });

    // ── Alert sweep rotation
    if (activeStage >= 5) {
      alertSweep.rotation.z = time * 1.5;
    }

    // ── Evidence cubes rotation
    evidenceCubes.forEach((cube, ci) => {
      if (cube.material.opacity > 0) {
        cube.rotation.y = time * 2 + ci;
        cube.rotation.x = time * 1.5;
      }
    });

    // ── Particles flow from domain clusters toward center
    const showParticles = activeStage >= 1;
    particleMesh.visible = showParticles;
    if (showParticles) {
      for (let i = 0; i < particleCount; i++) {
        const p = particleData[i];
        // Only animate particles for domains that are "active" (their stage has been passed)
        if (p.domainIdx >= activeStage && activeStage < 6) {
          // Keep at domain position
          dummy.position.copy(p.start);
          dummy.position.x += Math.sin(time + i) * 0.3;
          dummy.position.y += Math.cos(time * 0.8 + i * 0.5) * 0.3;
        } else {
          p.progress += p.speed;
          if (p.progress >= 1) p.progress = 0;
          dummy.position.lerpVectors(p.start, p.end, p.progress);
          dummy.position.z = Math.sin(p.progress * Math.PI) * 0.5;
        }
        dummy.updateMatrix();
        particleMesh.setMatrixAt(i, dummy.matrix);
      }
      particleMesh.instanceMatrix.needsUpdate = true;
    }

    // ── Edge dash animation
    edgeLines.forEach((line) => {
      if (line.material.opacity > 0) {
        line.material.dashSize = 0.2 + Math.sin(time * 2) * 0.05;
      }
    });

    // ── Light follows focus
    const lightTarget = activeStage >= 1 && activeStage <= 5
      ? getDomainClusterCenter(DOMAINS[activeStage - 1])
      : new THREE.Vector3(0, 0, 0);
    keyLight.position.lerp(new THREE.Vector3(lightTarget.x, lightTarget.y + 5, 12), 0.03);
    keyLight.intensity = 2.0 + Math.sin(time * 2) * 0.3;

    composer.render();
    labelRenderer.render(scene, camera);
  }

  animate();
}

/* ─── Init ──────────────────────────────────────────────────── */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGraph);
} else {
  initGraph();
}
