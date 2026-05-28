/**
 * Anveshak — 3D Scroll-Driven Pipeline Visualization
 *
 * An immersive, HUD-style 3D scene showing the 12-stage intelligence pipeline.
 * Features: scroll-driven camera, per-node micro-visualizations, radar sweeps,
 * orbiting satellites, data stream trails, floating intel labels, bloom glow.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/* ─── Constants ─────────────────────────────────────────────── */

const COLORS = {
  amber:  new THREE.Color(0xE87D14),
  cyan:   new THREE.Color(0x00C8FF),
  pink:   new THREE.Color(0xFF2D78),
  purple: new THREE.Color(0x7B2FBE),
  white:  new THREE.Color(0xE6EDF3),
};

const STAGES = [
  { id: 1,  label: 'INGEST',    color: 'amber',  title: 'Multi-Source Ingestion',            tech: ['6 Platforms', 'Deduplication', 'Real-Time'],       micro: 'sources' },
  { id: 2,  label: 'TRANSLATE',  color: 'cyan',   title: 'Multilingual Translation',          tech: ['200+ Languages', 'Auto-Detect', 'Sovereign'],     micro: 'languages' },
  { id: 3,  label: 'NER',        color: 'cyan',   title: 'Entity Extraction',                 tech: ['People', 'Organisations', 'Locations'],            micro: 'entities' },
  { id: 4,  label: 'EMBED',      color: 'cyan',   title: 'Semantic Vectorisation',            tech: ['384-Dimensional', 'Cross-Lingual', 'Indexed'],     micro: 'vectors' },
  { id: 5,  label: 'SENTIMENT',  color: 'cyan',   title: 'Sentiment & Keyword Analysis',      tech: ['Tone Detection', 'Key Phrases', 'Trending'],       micro: 'gauge' },
  { id: 6,  label: 'RELEVANCE',  color: 'cyan',   title: 'Relevance Scoring',                 tech: ['Auto-Calibrated', 'Per-Topic', 'Adaptive'],        micro: 'arc' },
  { id: 7,  label: 'VISION',     color: 'pink',   title: 'Visual Intelligence',               tech: ['Object Detection', 'Deepfake Scoring', 'Forensics'], micro: 'bbox' },
  { id: 8,  label: 'GATES',      color: 'pink',   title: 'Quality Assurance Gates',           tech: ['11 Checkpoints', '4 Stages', 'Defence-in-Depth'],  micro: 'gates' },
  { id: 9,  label: 'DEDUP',      color: 'purple', title: 'Duplicate Elimination',             tech: ['Semantic Match', 'Source Integrity', 'ISC Count'],  micro: 'merge' },
  { id: 10, label: 'CLUSTER',    color: 'purple', title: 'Narrative Clustering',              tech: ['Blended Similarity', 'Community Detection', 'Incremental'], micro: 'graph' },
  { id: 11, label: 'LABEL',      color: 'purple', title: 'Automated Labelling',               tech: ['Local LLM', 'Human-Readable', 'Self-Updating'],    micro: 'label' },
  { id: 12, label: 'SIGNAL',     color: 'purple', title: 'Intelligence Alerts',               tech: ['Multi-Source Threshold', 'Real-Time Push', 'Cross-Topic'], micro: 'pulse' },
];

const STAGE_TITLES_HI = [
  'बहु-स्रोत अंतर्ग्रहण', 'बहुभाषी अनुवाद', 'इकाई निष्कर्षण', 'सिमेंटिक वेक्टराइज़ेशन',
  'भावना और कीवर्ड विश्लेषण', 'प्रासंगिकता स्कोरिंग', 'विज़ुअल इंटेलिजेंस', 'गुणवत्ता आश्वासन द्वार',
  'डुप्लिकेट उन्मूलन', 'कथा क्लस्टरिंग', 'स्वचालित लेबलिंग', 'इंटेलिजेंस अलर्ट',
];

const STAGE_DESCS_HI = [
  'वेब पेज, समाचार फीड, टेलीग्राम चैनल, रेडिट, ब्लूस्काई, और X/ट्विटर से एक साथ इंटेलिजेंस एकत्र करता है। क्रिप्टोग्राफिक डिडुप्लिकेशन सुनिश्चित करता है कि प्रत्येक सामग्री केवल एक बार प्रोसेस हो।',
  'हमारा कस्टम-बिल्ट अनुवाद इंजन 200+ भाषाओं को स्वचालित रूप से पहचानता और एकीकृत सिमेंटिक स्पेस में अनुवाद करता है। भाषा अब इंटेलिजेंस विश्लेषण में बाधा नहीं है।',
  'स्वामित्व इकाई निष्कर्षण व्यक्ति, संगठन, स्थान, और तिथियों की पहचान करता है। ये इकाइयाँ एक संरचनात्मक फिंगरप्रिंट बनाती हैं जो अलग-अलग शब्दों में एक ही घटना पर चर्चा करने वाले लेखों को जोड़ती है।',
  'प्रत्येक लेख को एक उच्च-आयामी गणितीय प्रतिनिधित्व में बदला जाता है जो उसके अर्थ को पकड़ता है, न कि केवल शब्दों को। प्रणाली भाषाओं और लेखन शैलियों में अवधारणात्मक समानता समझती है।',
  'प्रत्येक सामग्री को भावनात्मक स्वर के लिए स्कोर किया जाता है और प्रमुख वाक्यांश निकाले जाते हैं। यह ट्रेंड विश्लेषण सक्षम करता है — क्या भावना बदल रही है?',
  'एक बुद्धिमान स्कोरिंग प्रणाली एनालिस्ट के निगरानी विषयों से प्रासंगिकता निर्धारित करती है। थ्रेशोल्ड डेटा वितरण के आधार पर स्वतः कैलिब्रेट होता है।',
  'छवियों और वीडियो का ऑब्जेक्ट डिटेक्शन, निरंतर पैमाने पर डीपफेक स्कोरिंग, मेटाडेटा फोरेंसिक, और रिवर्स इमेज सर्च के लिए विश्लेषण किया जाता है।',
  'सामग्री 4 चरणों में 11 स्वतंत्र गुणवत्ता जांच बिंदुओं से गुजरती है। यह डिफेंस-इन-डेप्थ दृष्टिकोण सुनिश्चित करता है कि केवल वास्तविक इंटेलिजेंस एनालिस्ट तक पहुँचे।',
  'जब कई स्रोत एक ही कहानी को दोहराते हैं, प्रणाली सिमेंटिक निकट-डुप्लिकेट का पता लगाती है और उन्हें स्रोत विविधता गणना बढ़ाने से रोकती है।',
  'हमारा प्रोप्राइटरी ब्लेंडेड समानता एल्गोरिदम सिमेंटिक अर्थ को इकाई ओवरलैप के साथ जोड़कर संबंधित लेखों को कथा क्लस्टर में समूहित करता है।',
  'एक संप्रभु, स्थानीय रूप से होस्ट किया गया AI प्रत्येक कथा क्लस्टर के लिए संक्षिप्त मानव-पठनीय लेबल उत्पन्न करता है।',
  'जब कोई कथा कई प्लेटफार्मों पर स्वतंत्र स्रोतों द्वारा पुष्ट होती है, प्रणाली इंटेलिजेंस अलर्ट फायर करती है। क्रॉस-टॉपिक कन्वर्जेंस अलग निगरानी धाराओं में एक ही घटना का पता लगाता है।',
];

const STAGE_DESCS = [
  'Simultaneously collects intelligence from web pages, news feeds, Telegram channels, Reddit forums, Bluesky, and X/Twitter. Cryptographic deduplication ensures every piece of content is processed exactly once, eliminating noise before it enters the pipeline.',
  'Our custom-built translation engine automatically detects and translates 200+ languages into a unified semantic space. An analyst monitoring Chinese, Hindi, Urdu, and English sources sees all narratives clustered together — language is no longer a barrier.',
  'Proprietary entity extraction identifies people, organisations, locations, dates, and facilities mentioned in every article. These entities form a structural fingerprint — enabling our system to connect articles that talk about the same incident in entirely different words.',
  'Each article is transformed into a high-dimensional mathematical representation that captures its meaning, not just its words. This enables the system to understand that "IAF deploys Rafale" and "Indian fighter jets positioned at forward base" are about the same event.',
  'Every piece of content is scored for emotional tone — positive, negative, neutral — and key phrases are extracted automatically. This enables trend analysis: is sentiment around a topic shifting? Are new keywords emerging that signal a developing situation?',
  'An intelligent scoring system determines how relevant each article is to the analyst\'s defined watch topics. The threshold self-calibrates based on the data distribution — no manual tuning required. Off-topic noise is filtered before it reaches the clustering engine.',
  'Images and videos are analysed for object detection (vehicles, aircraft, weapons, personnel), deepfake probability scoring on a continuous scale, metadata forensics, and perceptual fingerprinting for reverse image search across the entire database.',
  'Content passes through 11 independent quality checkpoints across 4 stages — from structural validation at collection, to linguistic analysis, to semantic filtering. This defence-in-depth approach ensures only genuine, substantive intelligence reaches the analyst.',
  'When multiple news outlets paraphrase the same story, the system detects semantic near-duplicates and prevents them from artificially inflating the source diversity count. The true independent source count reflects genuine multi-source corroboration.',
  'Our proprietary blended similarity algorithm combines semantic meaning with structural entity overlap to group related articles into narrative clusters. The system is incremental — new articles are assigned to existing narratives in real-time without reprocessing the entire corpus.',
  'A sovereign, locally-hosted AI model generates concise human-readable labels for each narrative cluster. The system automatically detects when a cluster\'s composition has changed significantly and regenerates the label — analysts always see current, accurate descriptions.',
  'When a narrative cluster reaches the corroboration threshold — confirmed by independent sources across multiple platforms — the system fires an intelligence alert. Analysts receive real-time push notifications. Cross-topic convergence detects when two separate watch topics surface the same underlying event.',
];

/* ─── Helpers ───────────────────────────────────────────────── */

function createRingMesh(innerR, outerR, color, opacity) {
  const geom = new THREE.RingGeometry(innerR, outerR, 64);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide });
  return new THREE.Mesh(geom, mat);
}

function createOrbitDot(radius, color, size) {
  const geom = new THREE.SphereGeometry(size, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.userData.orbitRadius = radius;
  return mesh;
}

/* ─── Node Layout ───────────────────────────────────────────── */

function getNodePositions() {
  const positions = [];
  const spacing = 3.5;
  const rowGap = 5.5;

  for (let i = 0; i < 6; i++) {
    positions.push(new THREE.Vector3(
      (i - 2.5) * spacing, rowGap / 2, Math.sin(i * 0.4) * 0.8
    ));
  }
  for (let i = 0; i < 6; i++) {
    positions.push(new THREE.Vector3(
      (2.5 - i) * spacing, -rowGap / 2, Math.sin((i + 6) * 0.4) * 0.8
    ));
  }
  return positions;
}

/* ─── Camera Path ───────────────────────────────────────────── */

function buildCameraPath(nodePositions) {
  const points = [];
  // Start: dramatic wide overview
  points.push(new THREE.Vector3(0, 1, 22));

  nodePositions.forEach((pos) => {
    // Camera zooms IN close to each node — close enough to see micro-viz details
    points.push(new THREE.Vector3(
      pos.x * 0.75,
      pos.y * 0.5,
      pos.z + 8  // Much closer (was 16)
    ));
  });

  // End: pull back
  points.push(new THREE.Vector3(0, -1, 22));
  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
}

/* ─── Main ──────────────────────────────────────────────────── */

function initPipeline() {
  const canvas = document.getElementById('pipeline-canvas');
  const wrapper = document.getElementById('pipeline-canvas-wrapper');
  if (!canvas || !wrapper) return;
  if (window.matchMedia('(max-width: 767px)').matches) return;

  const w = wrapper.clientWidth;
  const h = wrapper.clientHeight;

  /* ── Scene ── */
  const scene = new THREE.Scene();
  // Subtle fog for depth
  scene.fog = new THREE.FogExp2(0x000000, 0.012);

  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
  camera.position.set(0, 1, 22);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  /* ── Post-Processing ── */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(w / 2, h / 2), 0.9, 0.25, 0.75
  );
  composer.addPass(bloomPass);

  /* ── CSS2D ── */
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(w, h);
  Object.assign(labelRenderer.domElement.style, {
    position: 'absolute', top: '0', left: '0',
    pointerEvents: 'none', zIndex: '10',
  });
  wrapper.appendChild(labelRenderer.domElement);

  /* ── Lighting ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const keyLight = new THREE.PointLight(0xE87D14, 2.0, 60);
  keyLight.position.set(0, 10, 15);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0x00C8FF, 0.6, 50);
  fillLight.position.set(-12, -5, 10);
  scene.add(fillLight);

  /* ── Grid Floor (HUD aesthetic) ── */
  const gridHelper = new THREE.GridHelper(60, 60, 0x0A1628, 0x0A1628);
  gridHelper.position.y = -6;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.15;
  scene.add(gridHelper);

  /* ── Nodes ── */
  const nodePositions = getNodePositions();
  const nodeMeshes = [];
  const wireframes = [];
  const nodeLabels = [];
  const nodeGroups = []; // Each node's group of micro-viz elements
  const radarSweeps = []; // Radar sweep meshes per node
  const orbitSatellites = []; // Orbiting dots per node

  const nodeGeom = new THREE.IcosahedronGeometry(0.55, 2);

  STAGES.forEach((stage, i) => {
    const color = COLORS[stage.color];
    const pos = nodePositions[i];
    const group = new THREE.Group();
    group.position.copy(pos);
    scene.add(group);

    // ── Core node mesh
    const mat = new THREE.MeshStandardMaterial({
      color: color.clone().multiplyScalar(0.2),
      emissive: color,
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.2,
    });
    const mesh = new THREE.Mesh(nodeGeom, mat);
    group.add(mesh);
    nodeMeshes.push(mesh);

    // ── Wireframe shell
    const wfMat = new THREE.MeshBasicMaterial({
      color, wireframe: true, transparent: true, opacity: 0.1,
    });
    const wf = new THREE.Mesh(nodeGeom, wfMat);
    wf.scale.setScalar(1.25);
    group.add(wf);
    wireframes.push(wf);

    // ── Inner ring (always visible)
    const innerRing = createRingMesh(0.75, 0.8, color, 0.12);
    group.add(innerRing);

    // ── Outer ring (pulses on active)
    const outerRing = createRingMesh(1.1, 1.15, color, 0.06);
    group.add(outerRing);

    // ── Radar sweep (sector geometry, rotates)
    const sweepGeom = new THREE.CircleGeometry(1.3, 16, 0, Math.PI / 4);
    const sweepMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0, side: THREE.DoubleSide,
    });
    const sweep = new THREE.Mesh(sweepGeom, sweepMat);
    group.add(sweep);
    radarSweeps.push(sweep);

    // ── Orbiting satellites (2-3 per node)
    const sats = [];
    const satCount = 2 + (i % 2);
    for (let s = 0; s < satCount; s++) {
      const sat = createOrbitDot(1.0 + s * 0.35, color, 0.04);
      sat.userData.phase = (s / satCount) * Math.PI * 2;
      sat.userData.speed = 0.8 + s * 0.3;
      sat.visible = false; // Only visible when node is active
      group.add(sat);
      sats.push(sat);
    }
    orbitSatellites.push(sats);

    // ── CSS2D Label (clickable)
    const labelEl = document.createElement('div');
    labelEl.className = 'pipeline-label';
    labelEl.innerHTML = `<span style="opacity:0.4">${String(stage.id).padStart(2, '0')}</span> ${stage.label}`;
    labelEl.style.cursor = 'pointer';
    labelEl.style.pointerEvents = 'auto';
    labelEl.dataset.stageIndex = String(i);
    const labelObj = new CSS2DObject(labelEl);
    labelObj.position.set(0, -1.3, 0);
    group.add(labelObj);
    nodeLabels.push(labelEl);

    nodeGroups.push(group);
  });

  /* ── Per-Node Micro-Visualization Elements ── */
  // These are THREE objects added to each node group, animated when active

  // Step 1 (INGEST): 6 source cubes orbiting — visible size
  const ingestSources = [];
  const sourceLabels = ['WEB', 'RSS', 'TG', 'RDT', 'BSK', 'X'];
  sourceLabels.forEach((lbl, si) => {
    const cubeGeom = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const cubeMat = new THREE.MeshBasicMaterial({ color: COLORS.amber, transparent: true, opacity: 0 });
    const cube = new THREE.Mesh(cubeGeom, cubeMat);
    cube.userData.angle = (si / 6) * Math.PI * 2;
    cube.userData.radius = 2.2;
    nodeGroups[0].add(cube);
    ingestSources.push(cube);
    // Source label next to cube
    const srcEl = document.createElement('div');
    srcEl.className = 'pipeline-label';
    srcEl.style.cssText = 'font-size:8px;color:#E87D14;opacity:0;transition:opacity 0.4s;';
    srcEl.textContent = lbl;
    const srcObj = new CSS2DObject(srcEl);
    srcObj.position.set(0, -0.15, 0);
    cube.add(srcObj);
    ingestSources.push(srcEl); // Store for opacity control
  });

  // Step 3 (NER): Floating entity tags — LARGE and visible
  const nerTags = [];
  ['PERSON', 'ORG', 'LOC', 'DATE', 'GPE'].forEach((tag, ti) => {
    const tagEl = document.createElement('div');
    tagEl.className = 'pipeline-label';
    tagEl.style.cssText = 'font-size:11px;color:#00C8FF;opacity:0;transition:opacity 0.4s;background:rgba(0,200,255,0.08);padding:2px 6px;border-radius:3px;border:1px solid rgba(0,200,255,0.2);';
    tagEl.textContent = tag;
    const tagObj = new CSS2DObject(tagEl);
    tagObj.position.set(
      Math.cos(ti * 1.2) * 2.0,
      Math.sin(ti * 0.8) * 1.5 + 0.5,
      0
    );
    nodeGroups[2].add(tagObj);
    nerTags.push(tagEl);
  });

  // Step 4 (EMBED): Point cloud — large, dramatic vector space
  const embedCloud = (() => {
    const count = 200;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.0 + Math.random() * 1.2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: COLORS.cyan, size: 0.07, transparent: true, opacity: 0,
    });
    const points = new THREE.Points(geom, mat);
    nodeGroups[3].add(points);
    return points;
  })();

  // Step 7 (VISION): Bounding box wireframe — large
  const visionBox = (() => {
    const boxGeom = new THREE.BoxGeometry(3, 2.2, 0.15);
    const edges = new THREE.EdgesGeometry(boxGeom);
    const mat = new THREE.LineBasicMaterial({ color: COLORS.pink, transparent: true, opacity: 0 });
    const lineBox = new THREE.LineSegments(edges, mat);
    nodeGroups[6].add(lineBox);
    return lineBox;
  })();

  // Step 10 (CLUSTER): Mini community graph
  const clusterNodes = [];
  const clusterEdges = [];
  (() => {
    // 3 mini-clusters of 3 nodes each
    const clusters = [
      { cx: -1.5, cy: 1.0, color: COLORS.cyan, count: 4, r: 0.6 },
      { cx: 1.5, cy: 1.0, color: COLORS.amber, count: 4, r: 0.6 },
      { cx: 0, cy: -1.0, color: COLORS.pink, count: 3, r: 0.5 },
    ];
    clusters.forEach(cl => {
      const nodePositions2 = [];
      for (let n = 0; n < cl.count; n++) {
        const a = (n / cl.count) * Math.PI * 2;
        const x = cl.cx + Math.cos(a) * cl.r;
        const y = cl.cy + Math.sin(a) * cl.r;
        const dotGeom = new THREE.SphereGeometry(0.1, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: cl.color, transparent: true, opacity: 0 });
        const dot = new THREE.Mesh(dotGeom, dotMat);
        dot.position.set(x, y, 0.5);
        nodeGroups[9].add(dot);
        clusterNodes.push(dot);
        nodePositions2.push(new THREE.Vector3(x, y, 0.5));
      }
      // Intra-cluster edges
      for (let a = 0; a < nodePositions2.length; a++) {
        for (let b = a + 1; b < nodePositions2.length; b++) {
          const lineGeom = new THREE.BufferGeometry().setFromPoints([nodePositions2[a], nodePositions2[b]]);
          const lineMat = new THREE.LineBasicMaterial({ color: cl.color, transparent: true, opacity: 0 });
          const line = new THREE.Line(lineGeom, lineMat);
          nodeGroups[9].add(line);
          clusterEdges.push(line);
        }
      }
    });
  })();

  // Step 2 (TRANSLATE): Floating language codes — large styled badges
  const translateTags = [];
  ['EN', 'HI', 'ZH', 'AR', 'RU', 'UR', 'FR', 'TR'].forEach((lang, li) => {
    const el = document.createElement('div');
    el.className = 'pipeline-label';
    el.style.cssText = 'font-size:10px;color:#00C8FF;opacity:0;transition:opacity 0.4s;letter-spacing:0.15em;background:rgba(0,200,255,0.06);padding:2px 5px;border-radius:3px;border:1px solid rgba(0,200,255,0.15);';
    el.textContent = lang;
    const obj = new CSS2DObject(el);
    const angle = (li / 8) * Math.PI * 2;
    obj.position.set(Math.cos(angle) * 2.0, Math.sin(angle) * 1.5, 0);
    nodeGroups[1].add(obj);
    translateTags.push({ el, obj, angle });
  });

  // Step 5 (SENTIMENT): Gauge arc + positive/negative indicators
  const sentimentArcs = [];
  [{ start: -0.6, len: 0.8, color: 0x3FB950, label: 'POSITIVE' },
   { start: 0.3, len: 0.5, color: 0xD29922, label: 'NEUTRAL' },
   { start: 0.9, len: 0.7, color: 0xF85149, label: 'NEGATIVE' }].forEach((arc, ai) => {
    const arcGeom = new THREE.RingGeometry(1.5, 1.7, 24, 1, arc.start + Math.PI / 2, arc.len);
    const arcMat = new THREE.MeshBasicMaterial({ color: arc.color, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const arcMesh = new THREE.Mesh(arcGeom, arcMat);
    nodeGroups[4].add(arcMesh);
    sentimentArcs.push(arcMesh);
    // Label
    const el = document.createElement('div');
    el.className = 'pipeline-label';
    const labelColor = arc.color === 0x3FB950 ? '#3FB950' : arc.color === 0xD29922 ? '#D29922' : '#F85149';
    el.style.cssText = `font-size:9px;color:${labelColor};opacity:0;transition:opacity 0.4s;font-weight:600;letter-spacing:0.1em;`;
    el.textContent = arc.label;
    const labelObj = new CSS2DObject(el);
    const mid = arc.start + arc.len / 2 + Math.PI / 2;
    labelObj.position.set(Math.cos(mid) * 1.7, Math.sin(mid) * 1.7, 0);
    nodeGroups[4].add(labelObj);
    sentimentArcs.push(el); // Store el for opacity toggle
  });

  // Step 6 (RELEVANCE): Threshold line + score dots
  const relevanceDots = [];
  for (let ri = 0; ri < 15; ri++) {
    const dotGeom = new THREE.SphereGeometry(0.04, 6, 6);
    const isAbove = ri > 9; // 10-14 are above threshold
    const dotMat = new THREE.MeshBasicMaterial({
      color: isAbove ? COLORS.cyan : 0x3D4451,
      transparent: true, opacity: 0,
    });
    const dot = new THREE.Mesh(dotGeom, dotMat);
    dot.position.set((ri - 7) * 0.22, (Math.random() - 0.3) * 1.5, 0.3);
    dot.userData.baseY = dot.position.y;
    nodeGroups[5].add(dot);
    relevanceDots.push(dot);
  }
  // Threshold line
  const threshLineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1.6, 0.3, 0.3), new THREE.Vector3(1.6, 0.3, 0.3)
  ]);
  const threshLineMat = new THREE.LineDashedMaterial({ color: COLORS.amber, dashSize: 0.1, gapSize: 0.08, transparent: true, opacity: 0 });
  const threshLine = new THREE.Line(threshLineGeom, threshLineMat);
  threshLine.computeLineDistances();
  nodeGroups[5].add(threshLine);

  // Step 8 (GATES): Gate barrier lines (horizontal bars)
  const gateBarriers = [];
  for (let gi = 0; gi < 4; gi++) {
    const barGeom = new THREE.PlaneGeometry(0.1, 2.2);
    const barMat = new THREE.MeshBasicMaterial({
      color: gi < 2 ? COLORS.pink : COLORS.amber,
      transparent: true, opacity: 0, side: THREE.DoubleSide,
    });
    const bar = new THREE.Mesh(barGeom, barMat);
    bar.position.set(-1.2 + gi * 0.8, 0, 0.4);
    nodeGroups[7].add(bar);
    gateBarriers.push(bar);
    // Gate label
    const gel = document.createElement('div');
    gel.className = 'pipeline-label';
    gel.style.cssText = 'font-size:8px;color:#FF2D78;opacity:0;transition:opacity 0.4s;letter-spacing:0.1em;';
    gel.textContent = `G${gi * 3 + 1}-${Math.min(gi * 3 + 3, 11)}`;
    const gObj = new CSS2DObject(gel);
    gObj.position.set(-1.2 + gi * 0.8, -1.4, 0.4);
    nodeGroups[7].add(gObj);
    gateBarriers.push(gel);
  }

  // Step 9 (DEDUP): Two spheres that merge into one
  const dedupSpheres = [];
  for (let di = 0; di < 2; di++) {
    const dGeom = new THREE.SphereGeometry(0.35, 12, 12);
    const dMat = new THREE.MeshBasicMaterial({ color: COLORS.purple, transparent: true, opacity: 0 });
    const dMesh = new THREE.Mesh(dGeom, dMat);
    dMesh.position.set(di === 0 ? -0.8 : 0.8, 0.5, 0.4);
    dMesh.userData.startX = dMesh.position.x;
    nodeGroups[8].add(dMesh);
    dedupSpheres.push(dMesh);
  }
  // "=" sign that appears when merged
  const dedupEqEl = document.createElement('div');
  dedupEqEl.className = 'pipeline-label';
  dedupEqEl.style.cssText = 'font-size:12px;color:#7B2FBE;opacity:0;transition:opacity 0.5s;font-weight:bold;';
  dedupEqEl.textContent = '= 1';
  const dedupEqObj = new CSS2DObject(dedupEqEl);
  dedupEqObj.position.set(0, -0.6, 0.4);
  nodeGroups[8].add(dedupEqObj);

  // Step 11 (LABEL): A text label that types out
  const labelTextEl = document.createElement('div');
  labelTextEl.className = 'pipeline-label';
  labelTextEl.style.cssText = 'font-size:11px;color:#A78BFA;opacity:0;transition:opacity 0.4s;max-width:180px;text-align:center;line-height:1.4;white-space:normal;background:rgba(123,47,190,0.08);padding:4px 8px;border-radius:4px;border:1px solid rgba(123,47,190,0.2);';
  labelTextEl.textContent = '';
  const labelTextObj = new CSS2DObject(labelTextEl);
  labelTextObj.position.set(0, 1.2, 0);
  nodeGroups[10].add(labelTextObj);
  const labelFullText = 'PLA armoured movement near Depsang';
  let labelCharIdx = 0;

  // Step 12 (SIGNAL): Expanding pulse rings
  const signalRings = [];
  for (let r = 0; r < 3; r++) {
    const ring = createRingMesh(0.1, 0.15, COLORS.purple, 0);
    nodeGroups[11].add(ring);
    signalRings.push({ mesh: ring, scale: 0.1, phase: r * 1.2 });
  }

  /* ── Edge Lines with glow trails ── */
  const edgeGroups = [];
  for (let i = 0; i < nodePositions.length - 1; i++) {
    const start = nodePositions[i];
    const end = nodePositions[i + 1];
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.z += 0.8;

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const curvePoints = curve.getPoints(50);

    // Main dashed line
    const edgeGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const edgeMat = new THREE.LineDashedMaterial({
      color: COLORS[STAGES[i].color].clone().multiplyScalar(0.4),
      dashSize: 0.15, gapSize: 0.1,
      transparent: true, opacity: 0.3,
    });
    const line = new THREE.Line(edgeGeom, edgeMat);
    line.computeLineDistances();
    scene.add(line);

    // Glow line (solid, very transparent)
    const glowMat = new THREE.LineBasicMaterial({
      color: COLORS[STAGES[i].color],
      transparent: true, opacity: 0.05,
    });
    const glowLine = new THREE.Line(edgeGeom.clone(), glowMat);
    scene.add(glowLine);

    edgeGroups.push({ curve, line, glowLine });
  }

  /* ── Data Flow Particles ── */
  const particleCount = window.matchMedia('(max-width: 1024px)').matches ? 80 : 180;
  const particleGeom = new THREE.SphereGeometry(0.04, 6, 6);
  const particleMat = new THREE.MeshBasicMaterial({
    color: COLORS.amber, transparent: true, opacity: 0.85,
  });
  const particleMesh = new THREE.InstancedMesh(particleGeom, particleMat, particleCount);
  scene.add(particleMesh);

  // Per-instance color attribute
  const particleColors = new Float32Array(particleCount * 3);
  const particleData = [];
  for (let i = 0; i < particleCount; i++) {
    const edgeIdx = Math.floor(Math.random() * edgeGroups.length);
    const stageColor = COLORS[STAGES[edgeIdx].color];
    particleColors[i * 3] = stageColor.r;
    particleColors[i * 3 + 1] = stageColor.g;
    particleColors[i * 3 + 2] = stageColor.b;
    particleData.push({
      edgeIdx,
      progress: Math.random(),
      speed: 0.0015 + Math.random() * 0.003,
    });
  }
  particleMesh.instanceColor = new THREE.InstancedBufferAttribute(particleColors, 3);

  const dummy = new THREE.Object3D();

  /* ── Background: Star field + faint nebula ── */
  const starGeom = new THREE.BufferGeometry();
  const starPos = new Float32Array(500 * 3);
  const starCols = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 120;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 70;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 15;
    // Subtle color variation
    const c = Math.random() < 0.7 ? COLORS.cyan : (Math.random() < 0.5 ? COLORS.amber : COLORS.pink);
    starCols[i * 3] = c.r * 0.3;
    starCols[i * 3 + 1] = c.g * 0.3;
    starCols[i * 3 + 2] = c.b * 0.3;
  }
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeom.setAttribute('color', new THREE.BufferAttribute(starCols, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.08, transparent: true, opacity: 0.5, vertexColors: true,
  });
  scene.add(new THREE.Points(starGeom, starMat));

  /* ── Floating HUD Labels (ambient intel terms) ── */
  const hudLabels = ['/correlate', '/intercept', '/fuse', '/classify', '/surveil', '/decode'];
  hudLabels.forEach((text, i) => {
    const el = document.createElement('div');
    el.className = 'pipeline-label';
    el.style.cssText = `font-size:9px;opacity:0.12;color:${i % 2 === 0 ? '#00C8FF' : '#E87D14'}`;
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 12,
      -5 + Math.random() * -5
    );
    scene.add(obj);
  });

  /* ── Camera Path ── */
  const cameraPath = buildCameraPath(nodePositions);

  /* ── State ── */
  let activeStage = -1;
  let scrollProgress = 0;
  let pipelineActive = false;
  let paused = false;
  let time = 0;

  const detailPanel = document.getElementById('pipeline-detail');
  const detailStep = document.getElementById('detail-step');
  const detailTitle = document.getElementById('detail-title');
  const detailDesc = document.getElementById('detail-desc');
  const detailTech = document.getElementById('detail-tech');

  // Progress dots
  const progressContainer = document.getElementById('pipeline-progress');
  const progressDots = [];
  if (progressContainer) {
    STAGES.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'pipeline-progress__dot';
      dot.addEventListener('click', () => {
        const trigger = window._pipelineScrollTrigger;
        if (trigger) {
          const targetScroll = trigger.start + (trigger.end - trigger.start) * (i / 11);
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      });
      progressContainer.appendChild(dot);
      progressDots.push(dot);
    });
  }

  /* ── Micro-Viz Activation ── */
  function setMicroVizActive(index, active) {
    const t = active ? 1.0 : 0;

    // Step 1: Source cubes + labels
    if (index === 0) ingestSources.forEach(item => {
      if (item instanceof THREE.Mesh) item.material.opacity = t;
      else if (item.style) item.style.opacity = active ? '1' : '0';
    });
    // Step 2: Language tags
    if (index === 1) translateTags.forEach(tt => { tt.el.style.opacity = active ? '1' : '0'; });
    // Step 3: NER entity tags
    if (index === 2) nerTags.forEach(el => { el.style.opacity = active ? '1' : '0'; });
    // Step 4: Embed cloud
    if (index === 3) embedCloud.material.opacity = active ? 0.9 : 0;
    // Step 5: Sentiment arcs + labels
    if (index === 4) sentimentArcs.forEach(item => {
      if (item instanceof THREE.Mesh) item.material.opacity = active ? 0.7 : 0;
      else if (item.style) item.style.opacity = active ? '1' : '0';
    });
    // Step 6: Relevance dots + threshold
    if (index === 5) {
      relevanceDots.forEach(d => { d.material.opacity = active ? 0.9 : 0; });
      threshLineMat.opacity = active ? 0.7 : 0;
    }
    // Step 7: Vision bounding box
    if (index === 6) visionBox.material.opacity = active ? 0.9 : 0;
    // Step 8: Gate barriers
    if (index === 7) gateBarriers.forEach(item => {
      if (item instanceof THREE.Mesh) item.material.opacity = active ? 0.6 : 0;
      else if (item.style) item.style.opacity = active ? '1' : '0';
    });
    // Step 9: Dedup merge spheres
    if (index === 8) {
      dedupSpheres.forEach(d => { d.material.opacity = t; d.position.x = d.userData.startX; });
      dedupEqEl.style.opacity = '0';
    }
    // Step 10: Cluster graph
    if (index === 9) {
      clusterNodes.forEach(n => { n.material.opacity = t; });
      clusterEdges.forEach(e => { e.material.opacity = active ? 0.6 : 0; });
    }
    // Step 11: Typing label
    if (index === 10) {
      labelTextEl.style.opacity = active ? '1' : '0';
      if (active) { labelCharIdx = 0; labelTextEl.textContent = ''; }
    }
    // Step 12: Signal rings
    if (index === 11) signalRings.forEach(r => { r.mesh.material.opacity = active ? 0.6 : 0; });
  }

  function updateActiveStage(index) {
    if (index === activeStage) return;
    const prevStage = activeStage;
    activeStage = index;

    const stage = STAGES[index];

    // Deactivate previous micro-viz
    if (prevStage >= 0) {
      setMicroVizActive(prevStage, false);
      orbitSatellites[prevStage].forEach(s => { s.visible = false; });
      radarSweeps[prevStage].material.opacity = 0;
    }

    // Activate current
    setMicroVizActive(index, true);
    orbitSatellites[index].forEach(s => { s.visible = true; });
    radarSweeps[index].material.opacity = 0.15;

    // Node appearance — STRONG visual hierarchy
    nodeMeshes.forEach((mesh, i) => {
      const isActive = i === index;
      const dist = Math.abs(i - index);
      // Active: bright and large. Adjacent: dim. Far: nearly invisible
      mesh.material.emissiveIntensity = isActive ? 1.5 : Math.max(0.05, 0.2 - dist * 0.03);
      mesh.scale.setScalar(isActive ? 1.5 : Math.max(0.6, 1.0 - dist * 0.05));
      mesh.material.opacity = isActive ? 1 : Math.max(0.15, 0.6 - dist * 0.08);
      mesh.material.transparent = true;
    });
    wireframes.forEach((wf, i) => {
      const isActive = i === index;
      wf.scale.setScalar(isActive ? 2.0 : 1.2);
      wf.material.opacity = isActive ? 0.35 : 0.03;
    });

    // Edge glow: highlight edges leading to/from active node
    edgeGroups.forEach((eg, i) => {
      const isAdjacentEdge = i === index || i === index - 1;
      eg.line.material.opacity = isAdjacentEdge ? 0.6 : 0.2;
      eg.glowLine.material.opacity = isAdjacentEdge ? 0.15 : 0.03;
    });

    // Labels
    nodeLabels.forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });

    // Detail panel
    if (detailPanel && detailStep && detailTitle && detailDesc && detailTech) {
      detailStep.textContent = `STEP ${String(stage.id).padStart(2, '0')}`;
      const isHi = document.documentElement.lang === 'hi';
      detailTitle.textContent = isHi ? STAGE_TITLES_HI[index] : stage.title;
      detailDesc.textContent = isHi ? STAGE_DESCS_HI[index] : STAGE_DESCS[index];
      detailTech.innerHTML = stage.tech
        .map(t => `<span class="badge badge--osint" style="padding:2px 8px;font-size:10px;">${t}</span>`)
        .join('');
      if (pipelineActive) detailPanel.classList.add('active');
    }

    // Progress dots
    progressDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  /* ── ScrollTrigger ── */
  async function setupScrollTrigger() {
    const gsapModule = await import('gsap');
    const stModule = await import('gsap/ScrollTrigger');
    const gsap = gsapModule.default || gsapModule;
    const ScrollTrigger = stModule.default || stModule.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    const st = ScrollTrigger.create({
      trigger: '#pipeline-section',
      start: 'top top',
      end: '+=500%',
      pin: true,
      scrub: 1,
      snap: {
        snapTo: 1 / 11,
        duration: { min: 0.2, max: 0.5 },
        ease: 'power2.inOut',
      },
      onUpdate: (self) => {
        scrollProgress = self.progress;
        const stageIndex = Math.round(self.progress * 11);
        updateActiveStage(Math.min(stageIndex, 11));
      },
      onEnter: () => {
        pipelineActive = true;
        if (detailPanel) detailPanel.classList.add('active');
      },
      onLeave: () => {
        pipelineActive = false;
        if (detailPanel) detailPanel.classList.remove('active');
      },
      onEnterBack: () => {
        pipelineActive = true;
        if (detailPanel) detailPanel.classList.add('active');
      },
      onLeaveBack: () => {
        pipelineActive = false;
        if (detailPanel) detailPanel.classList.remove('active');
      },
    });
    window._pipelineScrollTrigger = st;
  }
  setupScrollTrigger();

  /* ── Click-to-Navigate (Labels + 3D Nodes) ── */
  function scrollToStage(stageIndex) {
    const trigger = window._pipelineScrollTrigger;
    if (!trigger) return;
    const targetScroll = trigger.start + (trigger.end - trigger.start) * (stageIndex / 11);
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }

  // CSS2D label clicks
  wrapper.addEventListener('click', (e) => {
    const label = e.target.closest('.pipeline-label');
    if (label && label.dataset.stageIndex !== undefined) {
      scrollToStage(parseInt(label.dataset.stageIndex, 10));
    }
  });

  // 3D node clicks via raycasting
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(nodeMeshes, false);
    if (hits.length > 0) {
      const hitIndex = nodeMeshes.indexOf(hits[0].object);
      if (hitIndex >= 0) scrollToStage(hitIndex);
    }
  });

  // Hover cursor change on 3D nodes
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(nodeMeshes, false);
    canvas.style.cursor = hits.length > 0 ? 'pointer' : '';
  });

  /* ── Visibility ── */
  const visObs = new IntersectionObserver(([e]) => { paused = !e.isIntersecting; }, { threshold: 0.05 });
  visObs.observe(wrapper);

  /* ── Resize ── */
  const resObs = new ResizeObserver(([e]) => {
    const { width: rw, height: rh } = e.contentRect;
    if (!rw || !rh) return;
    camera.aspect = rw / rh;
    camera.updateProjectionMatrix();
    renderer.setSize(rw, rh);
    composer.setSize(rw, rh);
    labelRenderer.setSize(rw, rh);
    bloomPass.resolution.set(rw / 2, rh / 2);
  });
  resObs.observe(wrapper);

  /* ── Animation Loop ── */
  function animate() {
    requestAnimationFrame(animate);
    if (paused) return;
    time += 0.008;

    // Camera follows path
    const pathT = Math.max(0.001, Math.min(0.999, scrollProgress));
    const camPos = cameraPath.getPointAt(pathT);
    camera.position.lerp(camPos, 0.05);

    // Smooth lookAt — look at the active node but bias toward center
    const lookIdx = Math.max(0, activeStage);
    const nodePos = nodePositions[lookIdx];
    const lookTarget = new THREE.Vector3(
      nodePos.x * 0.6,  // Bias toward center X
      nodePos.y * 0.3,  // Bias toward center Y (keeps both rows visible)
      nodePos.z
    );
    camera.lookAt(lookTarget);

    // ── Animate nodes
    nodeMeshes.forEach((mesh, i) => {
      mesh.rotation.y = time * 0.15 + i * 0.5;
      mesh.rotation.x = Math.sin(time * 0.3 + i * 0.7) * 0.06;
    });
    wireframes.forEach((wf, i) => {
      wf.rotation.y = -time * 0.1 + i * 0.5;
    });

    // ── Radar sweeps on active node
    radarSweeps.forEach((sweep, i) => {
      if (i === activeStage) {
        sweep.rotation.z = time * 2;
      }
    });

    // ── Orbit satellites
    orbitSatellites.forEach((sats, i) => {
      sats.forEach(sat => {
        if (!sat.visible) return;
        const angle = time * sat.userData.speed + sat.userData.phase;
        const r = sat.userData.orbitRadius;
        sat.position.set(
          Math.cos(angle) * r,
          Math.sin(angle) * r * 0.6,
          Math.sin(angle * 0.5) * 0.3
        );
      });
    });

    // ── Micro-viz: Step 1 — Ingest source cubes orbit
    if (activeStage === 0) {
      ingestSources.forEach((item) => {
        if (!(item instanceof THREE.Mesh)) return;
        const a = time * 0.6 + item.userData.angle;
        const r = item.userData.radius;
        item.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.5, 0.3);
        item.rotation.set(time, time * 0.7, 0);
      });
    }

    // ── Micro-viz: Step 2 — Language tags orbit slowly
    if (activeStage === 1) {
      translateTags.forEach((tt, li) => {
        const a = time * 0.3 + tt.angle;
        tt.obj.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.2, 0);
      });
    }

    // ── Micro-viz: Step 4 — Embed cloud rotation
    if (activeStage === 3) {
      embedCloud.rotation.y = time * 0.3;
      embedCloud.rotation.x = Math.sin(time * 0.2) * 0.15;
    }

    // ── Micro-viz: Step 5 — Sentiment arcs pulse
    if (activeStage === 4) {
      sentimentArcs.forEach((item, ai) => {
        if (item instanceof THREE.Mesh) {
          item.material.opacity = 0.3 + Math.sin(time * 1.5 + ai * 1.5) * 0.2;
        }
      });
    }

    // ── Micro-viz: Step 6 — Relevance dots float
    if (activeStage === 5) {
      relevanceDots.forEach((d, di) => {
        d.position.y = d.userData.baseY + Math.sin(time * 1.2 + di * 0.5) * 0.15;
      });
    }

    // ── Micro-viz: Step 7 — Vision bbox pulse
    if (activeStage === 6) {
      const s = 1 + Math.sin(time * 2) * 0.08;
      visionBox.scale.setScalar(s);
    }

    // ── Micro-viz: Step 8 — Gate barriers scan
    if (activeStage === 7) {
      gateBarriers.forEach((item, gi) => {
        if (item instanceof THREE.Mesh) {
          item.position.y = Math.sin(time * 1.5 + gi * 0.8) * 0.3;
          item.material.opacity = 0.25 + Math.sin(time * 2 + gi) * 0.15;
        }
      });
    }

    // ── Micro-viz: Step 9 — Dedup spheres merge
    if (activeStage === 8) {
      const mergeT = (Math.sin(time * 0.8) + 1) / 2; // 0 to 1 oscillation
      dedupSpheres[0].position.x = -0.8 + mergeT * 0.8;
      dedupSpheres[1].position.x = 0.8 - mergeT * 0.8;
      dedupEqEl.style.opacity = mergeT > 0.85 ? '0.9' : '0';
    }

    // ── Micro-viz: Step 10 — Cluster graph gentle motion
    if (activeStage === 9) {
      clusterNodes.forEach((n, ci) => {
        n.position.x += Math.sin(time + ci) * 0.001;
        n.position.y += Math.cos(time * 0.8 + ci * 0.5) * 0.001;
      });
    }

    // ── Micro-viz: Step 11 — Typing label
    if (activeStage === 10) {
      if (labelCharIdx < labelFullText.length && Math.floor(time * 15) % 2 === 0) {
        labelCharIdx = Math.min(labelCharIdx + 1, labelFullText.length);
        labelTextEl.textContent = labelFullText.substring(0, labelCharIdx) + (labelCharIdx < labelFullText.length ? '|' : '');
      }
    }

    // ── Micro-viz: Step 12 — Signal pulse rings
    if (activeStage === 11) {
      signalRings.forEach(r => {
        r.scale += 0.015;
        if (r.scale > 4) r.scale = 0.3;
        r.mesh.scale.setScalar(r.scale);
        r.mesh.material.opacity = Math.max(0, 0.4 * (1 - r.scale / 4));
      });
    }

    // ── Particles flow along edges
    for (let i = 0; i < particleCount; i++) {
      const p = particleData[i];
      p.progress += p.speed;
      if (p.progress >= 1) {
        p.progress = 0;
        p.edgeIdx = (p.edgeIdx + 1) % edgeGroups.length;
        // Update particle color for new edge
        const c = COLORS[STAGES[p.edgeIdx].color];
        particleColors[i * 3] = c.r;
        particleColors[i * 3 + 1] = c.g;
        particleColors[i * 3 + 2] = c.b;
        particleMesh.instanceColor.needsUpdate = true;
      }
      const pos = edgeGroups[p.edgeIdx].curve.getPointAt(p.progress);
      dummy.position.copy(pos);
      dummy.updateMatrix();
      particleMesh.setMatrixAt(i, dummy.matrix);
    }
    particleMesh.instanceMatrix.needsUpdate = true;

    // ── Light follows active node
    if (activeStage >= 0) {
      const ap = nodePositions[activeStage];
      keyLight.position.lerp(new THREE.Vector3(ap.x, ap.y + 6, ap.z + 12), 0.03);
      keyLight.intensity = 2.0 + Math.sin(time * 3) * 0.3;
    }

    // ── Grid subtle animation
    gridHelper.position.z = Math.sin(time * 0.2) * 0.5;

    composer.render();
    labelRenderer.render(scene, camera);
  }

  animate();
  // Don't call updateActiveStage here — wait for scroll trigger to activate
}

/* ─── Init ──────────────────────────────────────────────────── */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPipeline);
} else {
  initPipeline();
}
