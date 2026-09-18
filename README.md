# Hilmy Febrian — Portfolio

A Next.js App Router + TypeScript portfolio about manufacturing digitalization.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3113. `npm run build` creates a static export in `out/`.
Deploy with Vercel's Next.js preset or serve `out/` with any static host.

## Architecture

- `components/Experience.tsx`: one layout-level, lazy-loaded canvas, Lenis,
  GSAP ScrollTrigger, WebGL/reduced-motion fallback, progress and stage labels.
- `components/SceneCanvas.tsx`: deterministic GPU particle morph, spline camera,
  procedural factory and robot arms, GLSL connection pulses, dashboard overlay.
- `lib/scroll.ts`: one mutable scroll value read by both scene and DOM effects.
- `components/Portfolio.tsx`: semantic content, native accessible project dialogs,
  mobile navigation, Framer Motion reveals.
- `lib/content.ts`: editable projects, experience, and skills.

The four-section narrative drives progress 0–1. The canvas stays mounted for the
whole document and becomes ambient behind the later content. Canvas is clamped
to DPR 2 (1.25 on mobile); particles reduce from 5,200 to 1,800 on small/low-core
devices. Reduced-motion users get the static blueprint background with shorter
story sections, no WebGL or smooth-scroll loop. Rendering failures preserve HTML.

## Content notes

The download serves the original CV supplied by the owner, unchanged, as a DOCX.
Project cards name the systems and summarize their features; the detail dialogs
describe implementation, workflows, and impact using the CV and owner-provided
project descriptions. Project visuals are illustrative architecture diagrams,
not production screenshots. Estimated TCH savings and projected group-wide savings
are stated separately; projected financial outcomes remain labeled.

Fonts load through Google Fonts with local sans-serif fallbacks. No external 3D
models, paid services, credentials, backend, or private production data required.

## Validation

```sh
npm run typecheck
npm run build
```

Manually verify desktop/mobile, the four scroll stages, project dialogs with
keyboard/Escape, anchor links, reduced motion, and no-WebGL fallback. Frame-rate
targets require measurement on actual target hardware; a successful build is not
proof of 60fps.

## Research

- https://tympanus.net/codrops/2021/07/13/rock-the-stage-with-a-smooth-webgl-shader-transformation-on-scroll/
- https://tympanus.net/codrops/2022/01/05/crafting-scroll-based-animations-in-three-js/
- https://r3f.docs.pmnd.rs/advanced/scaling-performance

The shaders and factory geometry are authored for this project; no tutorial scene
or downloaded model is embedded.
