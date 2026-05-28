# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Compile CSS (watch mode during development)
npm run dev

# Production build (minified via cssnano, autoprefixed)
npm run build

# Validate Hindi translations — reports missing/orphaned keys
npm run validate-i18n
```

There are no tests and no linter configured.

## Architecture

This is a **static marketing website** for Grosint's sovereign intelligence platform suite. No build step for HTML or JS — only the CSS is compiled via PostCSS. Deployed on Vercel.

### Products

Three products, each with a dedicated product page:
- **Grosint SMINT** (`products/grosint.html`) — identifier-to-intelligence platform (phone/email lookup). Cyan theme.
- **Anveshak** (`products/anveshak.html`) — AI-powered OSINT analysis platform. Amber theme. Has a Three.js 3D scroll-driven pipeline visualization.
- **Drishti** (`products/drishti.html`) — sovereign intelligence fusion platform (flagship). Purple theme. Has a Three.js 3D entity resolution graph.

### CSS Pipeline

`css/style.css` is the entry point, importing all partials in order via `postcss-import`. PostCSS (with Tailwind + Autoprefixer + cssnano) compiles it to `dist/style.css`.

CSS partials (import order matters):
1. `tokens.css` — **single source of truth** for all CSS custom properties (colours, spacing, typography, z-index, animations, glows). **Never hardcode values — always reference a token.**
2. `reset.css` — browser reset
3. `typography.css` — heading/body/mono type styles
4. `layout.css` — container, section, and grid utilities
5. `animations.css` — `@keyframes` definitions
6. `three-d.css` — CSS 3D transform utilities for card tilt effects
7. `hud.css` — HUD/military-aesthetic elements (reticles, scan lines, radar, preloader)
8. `components.css` — reusable component patterns (`.btn`, `.card`, `.badge`, `.navbar`, `.footer`, `.hero`, `.cta-card`, etc.)
9. `utilities.css` — utility classes extracted from repeated inline styles (`.flex-center`, `.gap-*`, `.badge--padded-sm`, `.sub-centered`, etc.)
10. `anveshak.css` — product-page-specific styles (pipeline, tabs, moat cards, case studies, timeline, ingestion grid, stats bar, lang toggle). Shared across all product pages despite the name.
11. Tailwind directives (`@tailwind base/components/utilities`)

Tailwind is configured in `tailwind.config.js` to scan `./*.html`, `./products/*.html`, and `./js/**/*.js` for class usage.

### JavaScript Modules

All JS loaded as ES modules via `<script type="module">`. CDN dependencies via `<script type="importmap">`.

**Shared modules (loaded on every page):**
- `js/app.js` — preloader, Lenis smooth scroll, GSAP scroll reveals, navbar, HUD cursor, scroll progress, 3D card tilt, background particle scene, homepage hero Three.js scene
- `js/i18n.js` — bilingual EN/HI toggle. Uses `data-i18n` attributes on HTML elements. Hindi strings stored in a flat `HI` object. Persists language choice in localStorage.

**Shared utilities:**
- `js/three-scene.js` — **Three.js factory** shared by all 3D scenes. Exports: `createScene()`, `createVisibilityObserver()`, `createResizeHandler()`, `setupScrollPin()`. Eliminates boilerplate duplication.
- `js/anveshak-tabs.js` — tab switching + accordion logic. Reused by all product pages (not Anveshak-specific despite the name).
- `js/casepdf-shared.js` — premium PDF case study generator (jsPDF loaded lazily from CDN). Light theme, ministry-grade formatting, branded per product.

**Product-specific modules:**
- `js/anveshak-pipeline.js` — 3D scroll-driven 12-stage pipeline visualization with per-node micro-visualizations. Uses `three-scene.js` factory.
- `js/anveshak-moat.js` — technical moat mini-visualizations (Three.js dot clouds, Canvas 2D graphs). Lazy-loaded when moat cards are opened.
- `js/drishti-graph.js` — 3D entity resolution graph with 7 domain clusters. Uses `three-scene.js` factory.
- `js/anveshak-casepdf.js`, `js/grosint-casepdf.js`, `js/drishti-casepdf.js` — case study data for each product. Call `casepdf-shared.js` for PDF generation.

**CDN dependencies (via importmap):**
- Three.js 0.165.0 (unpkg.com) — only loaded on pages with 3D scenes (index, anveshak, drishti). Stripped from about.html and contact.html.
- GSAP 3.12.7 + ScrollTrigger (jsdelivr) — loaded on all pages
- Lenis 1.1.18 (jsdelivr) — smooth scroll, loaded on all pages
- jsPDF 2.5.2 (jsdelivr) — lazy-loaded only when user clicks "Download PDF". Has SRI integrity hash.

### HTML Pages

- `index.html` — homepage (Three.js hero + background scenes, product suite, sovereign pillars, pipeline, domain tiles, CTA)
- `about.html` — company/mission page (no Three.js)
- `contact.html` — contact page (no Three.js)
- `products/grosint.html` — SMINT product (source grid, lookup flow, 5 case studies with PDF download)
- `products/anveshak.html` — Anveshak product (3D pipeline, source grid, 6 moat cards, 5 case studies with PDF download)
- `products/drishti.html` — Drishti product (3D entity graph, 7 domain cards, 5 case studies with PDF download)

Product pages reference `../dist/style.css` and `../assets/` (one level up). Top-level pages reference `./dist/style.css` and `./assets/`.

### Bilingual Support (EN/HI)

Every page has a language toggle button (`.lang-toggle`). Text elements use `data-i18n="key.name"` attributes. Hindi translations are in `js/i18n.js` (`HI` object, 500+ keys). For elements with inner HTML (lists, formatted text), use `data-i18n-html` instead of `data-i18n`.

Pipeline step descriptions in Three.js scenes use separate Hindi arrays (`STAGE_TITLES_HI`, `STAGE_DESCS_HI`) and check `document.documentElement.lang === 'hi'` at render time.

Run `npm run validate-i18n` to check for missing translations.

### Case Studies & PDF Downloads

Each product page has 5 tab-switchable operational case studies targeting specific LEAs (MI, IAF, Police, Cyber, MEA for Anveshak; Police, NIA, Border, Cyber, CI for Grosint; Navy, RAW, Coast Guard, NTRO, MEA for Drishti).

Each case study has a "Download Case Study (PDF)" button. PDFs are generated client-side using jsPDF with:
- Light theme (white background, for print)
- Product-branded header bar (amber/cyan/purple)
- "FOR OFFICIAL USE ONLY" classification
- Contact page with phone, WhatsApp, website, email
- Product suite overview (3 cards)
- Disclaimer about hypothetical scenarios

### Design System

Dark military/HUD aesthetic. Key brand colours in `tokens.css`:
- **Cyan** (`#00C8FF`) — primary neon, data/reticle elements, Grosint product
- **Amber** (`#E87D14`) — brand/saffron, radar/eagle, Anveshak product
- **Pink** (`#FF2D78`) — secondary neon, crosshair accents
- **Purple** (`#7B2FBE`) — Drishti product accent
- **Green** (`#3FB950`) — success/status indicators

### Content Guidelines

- **Use diplomatic marketing language** — never expose specific library/package names (no "NLLB-200", "spaCy", "VADER", "YOLOv8", "Ollama qwen2:7b" etc.). Say "custom-built translation engine", "proprietary entity extraction", "sovereign AI", "local LLM".
- **No internal module numbers** (M1, M2, etc.) — use customer-facing capability names.
- **Case studies are operational** — real-world field scenarios with named operations, timelines, and outcomes. Not technical pipeline descriptions.
- **Stats should be customer-relevant** — "ANY Open Source", "<10s Alert Latency", "0 Cloud Dependencies" rather than internal metrics like "12 Pipeline Stages".

### Deployment

Deployed on Vercel. `vercel.json` configures:
- Immutable cache headers for `/dist/`, `/js/`, `/assets/` (1 year)
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- Build command: `npm run build`

### Performance Notes

- Fonts loaded async (`media="print" onload="this.media='all'"`) to avoid render-blocking
- Critical CSS and app.js preloaded via `<link rel="preload">`
- Three.js stripped from pages that don't need it (about, contact)
- jsPDF loaded lazily only on PDF download click
- Three.js scenes pause via IntersectionObserver when off-screen
- Mobile (< 768px): Three.js scenes replaced with CSS animated timeline fallback
- Pixel ratio capped at 1.5 for all WebGL renderers
- CSS minified via cssnano in production build
