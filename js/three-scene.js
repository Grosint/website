/**
 * GROSINT — Shared Three.js Scene Factory
 *
 * Extracts duplicated boilerplate from app.js, anveshak-pipeline.js,
 * and drishti-graph.js into reusable factory functions.
 */

// Re-export Three.js core and addons used across all scenes
export * from 'three';
export { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
export { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
export { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
export { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector2,
  ACESFilmicToneMapping,
  FogExp2,
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

/**
 * Creates a complete Three.js scene with optional bloom, film grain, CSS2D labels, and fog.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} options
 * @param {number}  [options.fov=50]
 * @param {number}  [options.pixelRatio]            — defaults to min(devicePixelRatio, 1.5)
 * @param {Object|false} [options.bloom]            — false to skip bloom entirely
 * @param {number}  [options.bloom.strength=0.9]
 * @param {number}  [options.bloom.radius=0.25]
 * @param {number}  [options.bloom.threshold=0.75]
 * @param {boolean} [options.filmGrain=false]        — add FilmPass after bloom
 * @param {number}  [options.filmGrainIntensity=0.2]
 * @param {Object|false} [options.fog]               — false to skip fog
 * @param {number}  [options.fog.density=0.012]
 * @param {number}  [options.toneMapping]            — THREE toneMapping constant
 * @param {number}  [options.exposure=1.2]
 * @param {HTMLElement} [options.labelParent]         — element to append CSS2DRenderer to (defaults to canvas.parentElement)
 * @param {boolean} [options.labels=true]            — whether to create CSS2DRenderer
 * @param {boolean} [options.antialias=true]
 * @param {number}  [options.width]                  — override width (defaults to parent width)
 * @param {number}  [options.height]                 — override height (defaults to parent height)
 *
 * @returns {{ scene, camera, renderer, composer, bloomPass, labelRenderer }}
 *   composer and bloomPass are null when bloom is false.
 *   labelRenderer is null when labels is false.
 */
export function createScene(canvas, options = {}) {
  const parent = options.labelParent || canvas.parentElement;
  const w = options.width  || parent.clientWidth;
  const h = options.height || parent.clientHeight;

  const fov       = options.fov ?? 50;
  const pr        = options.pixelRatio ?? Math.min(window.devicePixelRatio, 1.5);
  const antialias = options.antialias ?? true;
  const exposure  = options.exposure ?? 1.2;
  const wantBloom = options.bloom !== false;
  const wantLabels = options.labels !== false;

  // Scene
  const scene = new Scene();

  if (options.fog !== false && options.fog) {
    const density = (typeof options.fog === 'object') ? (options.fog.density ?? 0.012) : 0.012;
    scene.fog = new FogExp2(0x000000, density);
  }

  // Camera
  const camera = new PerspectiveCamera(fov, w / h, 0.1, options.far ?? 500);

  // Renderer
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias });
  renderer.setSize(w, h);
  renderer.setPixelRatio(pr);

  if (options.toneMapping !== undefined) {
    renderer.toneMapping = options.toneMapping;
  } else if (wantBloom) {
    renderer.toneMapping = ACESFilmicToneMapping;
  }
  renderer.toneMappingExposure = exposure;

  // Post-processing
  let composer = null;
  let bloomPass = null;

  if (wantBloom) {
    const bloomOpts = (typeof options.bloom === 'object') ? options.bloom : {};
    const strength  = bloomOpts.strength  ?? 0.9;
    const radius    = bloomOpts.radius    ?? 0.25;
    const threshold = bloomOpts.threshold ?? 0.75;

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    bloomPass = new UnrealBloomPass(new Vector2(w / 2, h / 2), strength, radius, threshold);
    composer.addPass(bloomPass);

    if (options.filmGrain) {
      const intensity = options.filmGrainIntensity ?? 0.2;
      composer.addPass(new FilmPass(intensity, false));
    }
  }

  // CSS2D label renderer
  let labelRenderer = null;

  if (wantLabels) {
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(w, h);
    Object.assign(labelRenderer.domElement.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      pointerEvents: 'none',
      zIndex: '10',
    });
    parent.appendChild(labelRenderer.domElement);
  }

  return { scene, camera, renderer, composer, bloomPass, labelRenderer };
}

/**
 * Creates an IntersectionObserver that calls `callback(isVisible)` when the
 * element enters or leaves the viewport.
 *
 * @param {HTMLElement} element
 * @param {function(boolean): void} callback
 * @param {number} [threshold=0.05]
 * @returns {IntersectionObserver}
 */
export function createVisibilityObserver(element, callback, threshold = 0.05) {
  const obs = new IntersectionObserver(([entry]) => {
    callback(entry.isIntersecting);
  }, { threshold });
  obs.observe(element);
  return obs;
}

/**
 * Creates a ResizeObserver that keeps camera, renderer, composer, bloomPass,
 * and labelRenderer in sync with the observed element's size.
 *
 * @param {HTMLElement} element           — element to observe for size changes
 * @param {Object}      targets
 * @param {PerspectiveCamera} targets.camera
 * @param {WebGLRenderer}     targets.renderer
 * @param {EffectComposer}    [targets.composer]
 * @param {UnrealBloomPass}   [targets.bloomPass]
 * @param {CSS2DRenderer}     [targets.labelRenderer]
 * @param {function}          [targets.onResize] — optional callback(width, height) for extra logic
 * @returns {ResizeObserver}
 */
export function createResizeHandler(element, targets) {
  const { camera, renderer, composer, bloomPass, labelRenderer, onResize } = targets;
  const obs = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    if (composer) composer.setSize(width, height);
    if (bloomPass) bloomPass.resolution.set(width / 2, height / 2);
    if (labelRenderer) labelRenderer.setSize(width, height);
    if (onResize) onResize(width, height);
  });
  obs.observe(element);
  return obs;
}

/**
 * Async helper that imports GSAP + ScrollTrigger, creates a pinned scroll
 * trigger with snap, and calls the provided lifecycle hooks.
 *
 * @param {string} triggerId  — CSS selector or element ID (e.g. '#pipeline-section')
 * @param {Object} options
 * @param {string} [options.end='+=500%']
 * @param {number} options.snapCount          — number of snap divisions (e.g. 11 for 12 stages)
 * @param {number} [options.scrub=1]
 * @param {function} [options.onUpdate]       — receives ScrollTrigger self
 * @param {function} [options.onEnter]
 * @param {function} [options.onLeave]
 * @param {function} [options.onEnterBack]
 * @param {function} [options.onLeaveBack]
 *
 * @returns {Promise<ScrollTrigger|null>}  — the ScrollTrigger instance, or null on failure
 */
export async function setupScrollPin(triggerId, options = {}) {
  let gsap, ScrollTrigger;
  try {
    const gsapModule = await import('gsap');
    const stModule = await import('gsap/ScrollTrigger');
    gsap = gsapModule.default || gsapModule;
    ScrollTrigger = stModule.default || stModule.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
  } catch {
    // GSAP failed to load — caller should handle fallback
    return null;
  }

  const snapCount = options.snapCount ?? 11;

  const st = ScrollTrigger.create({
    trigger: triggerId,
    start: 'top top',
    end: options.end ?? '+=500%',
    pin: true,
    scrub: options.scrub ?? 1,
    snap: {
      snapTo: 1 / snapCount,
      duration: { min: 0.2, max: 0.5 },
      ease: 'power2.inOut',
    },
    onUpdate:    options.onUpdate,
    onEnter:     options.onEnter,
    onLeave:     options.onLeave,
    onEnterBack: options.onEnterBack,
    onLeaveBack: options.onLeaveBack,
  });

  return st;
}
