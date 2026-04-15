# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Compile CSS (watch mode during development)
npm run dev

# Production build (minified, autoprefixed)
npm run build
```

There are no tests and no linter configured.

## Architecture

This is a **static marketing website** with no build step for HTML or JS — only the CSS is compiled.

### CSS Pipeline

`css/style.css` is the entry point, importing all partials in order via `postcss-import`. PostCSS (with Tailwind + Autoprefixer) compiles it to `dist/style.css`, which is what every HTML page loads.

CSS is split into purpose-specific partials:
- `tokens.css` — single source of truth for all CSS custom properties (colours, spacing, typography, z-index, animations, glows). **Never hardcode values in other files — always reference a token.**
- `components.css` — reusable component patterns (`.btn`, `.card-3d`, `.hud-*`, etc.)
- `hud.css` — HUD/military-aesthetic elements (classification bar, reticles, scan lines, radar)
- `animations.css` — `@keyframes` definitions
- `three-d.css` — CSS 3D transform utilities for card tilt effects
- `layout.css` — container, section, and grid utilities
- `typography.css` — heading/body/mono type styles

Tailwind is used for utility classes; its theme is extended in `tailwind.config.js` to alias the CSS custom properties (so Tailwind classes like `bg-bg-surface` resolve to `var(--color-bg-surface)`).

### JS (`js/app.js`)

Single ES module loaded via `<script type="module">` in each HTML page. Uses Three.js (loaded via CDN importmap, not bundled). Contains:
- **`initBackgroundScene()`** — ambient particle field rendered behind all page content
- **`initHeroScene()`** — full Three.js scene on the homepage hero canvas: radar sweep, crosshair reticles, eagle wireframe, floating intel labels, bloom post-processing
- Scroll reveal via `IntersectionObserver` (`.reveal`, `.reveal-stagger`, `.border-trace` classes)
- 3D card tilt via mouse/touch events on `[data-tilt]` elements
- Sticky nav with mobile hamburger toggle

Three.js is loaded via importmap pointing to `unpkg.com`, not installed as a local package.

### HTML Pages

- `index.html` — homepage (loads the full Three.js hero + background scenes)
- `about.html` — company/mission page
- `contact.html` — contact page
- `products/grosint.html` — SMINT product page
- `products/anveshak.html` — Anveshak product page
- `products/drishti.html` — Drishti product page

Product pages reference `../dist/style.css` and `../assets/` (one level up). The homepage and top-level pages reference `./dist/style.css` and `./assets/`.

### Design System

The aesthetic is a dark military/HUD theme. Key brand colours defined in `tokens.css`:
- Cyan (`#00C8FF`) — primary neon, data/reticle elements
- Amber (`#E87D14`) — brand/saffron, radar/eagle elements
- Pink (`#FF2D78`) — secondary neon, crosshair accents
- Purple (`#7B2FBE`) — Drishti product accent
