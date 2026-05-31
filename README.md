# Arsip Naskah Lontar — Digital Archive

> Prototype v0.3 — Immersive Next.js + React Three Fiber + GSAP

This README provides comprehensive context about the `lontar-archivev2` project architecture, stack, and goals, particularly for onboarding AI assistants or new developers.

## 🎯 Project Objective
**Arsip Naskah Lontar** is a digital archiving web platform prototype designed to preserve and showcase ancient Nusantara manuscripts (specifically Sunda Kuno / Kaganga on Lontar leaves). The project aims to provide an **immersive, premium, and interactive** museum-like experience using 3D rendering and scroll-driven animations.

## 🛠️ Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS 3 + Vanilla CSS (`globals.css`)
- **Typography:** DM Mono (monospace, for metadata/labels) + Playfair Display (serif, for headings) via Google Fonts.
- **3D Rendering:**
  - **Vanilla Three.js** — Used in homepage scenes (`HeroScene.tsx`, `ArtifactScene.tsx`) for procedural leaf geometry.
  - **React Three Fiber (`@react-three/fiber` v8)** + **Drei (`@react-three/drei` v9)** — Used in the Koleksi system for declarative 3D cards and GLB model viewer with OrbitControls.
- **Animations:** GSAP + GSAP ScrollTrigger for initial load reveals, stagger effects, and scroll-based parallax.

## 📂 Project Structure

```text
src/
├── app/
│   ├── globals.css             # Base styles, CSS variables (--charcoal, --warm, --bone, --border), cursor, koleksi card styles
│   ├── layout.tsx              # Root layout + metadata
│   ├── page.tsx                # Landing page (Hero, Ticker, Manifesto, Collection preview, Artifact, Footer)
│   ├── baca/                   # Lontar reader page (aksara annotation viewer)
│   ├── viewer/                 # 3D Lontar viewer page (vanilla Three.js)
│   └── koleksi/
│       ├── page.tsx            # Collection index — grid of artifact cards with 3D rotating previews
│       └── [slug]/
│           └── page.tsx        # Artifact detail — two-column: 3D viewer (left) + metadata panel (right)
├── components/
│   ├── CustomCursor.tsx        # Custom cursor (dot + ring follower, expands on hover)
│   ├── HeroScene.tsx           # Three.js canvas — floating lontar leaves behind hero text
│   ├── ArtifactScene.tsx       # Three.js canvas — 5-leaf lontar stack with binding cords
│   ├── LontarReader.tsx        # Interactive manuscript reader with word-level annotations
│   ├── LontarViewer.tsx        # Full-page lontar 3D viewer
│   ├── CardPreview.tsx         # [R3F] Rotating wireframe thumbnail for collection cards
│   └── ModelViewer.tsx         # [R3F] Full 3D viewer — loads .glb, OrbitControls, hotspots, loading screen
├── data/
│   ├── lontarPages.ts          # Lontar manuscript page data (aksara, annotations, phrases)
│   └── koleksi.ts              # Artifact collection seed data (2 artifacts with hotspots)
└── hooks/
    └── useGSAPAnimations.ts    # Centralized GSAP ScrollTrigger animations for landing page
```

```text
public/
└── models/
    └── [slug].glb              # Place 3D model files here, named to match artifact slug
```

## 🎨 Design System

### CSS Variables (`globals.css`)
| Variable      | Value              | Usage                        |
|---------------|--------------------|------------------------------|
| `--bone`      | `#F0EDE6`          | Background color             |
| `--charcoal`  | `#111110`          | Primary text, cursor, fills  |
| `--warm`      | `#8C8A85`          | Secondary text, labels       |
| `--border`    | `rgba(17,17,16,0.15)` | Borders, dividers         |

### Typography Pairing
- **Headings:** Playfair Display — serif, weight 400 (italic) / 900 (bold)
- **Labels & Metadata:** DM Mono — monospace, 9px, uppercase, letter-spacing 0.2em+
- **Body:** DM Mono — 11-12px, line-height 2.2

### UI Patterns
- **Hover fill:** Cards use `::before` pseudo-element with `scaleY(0→1)` transition from bottom (dark charcoal fills up)
- **Scroll reveal:** Elements start with `opacity: 0; transform: translateY(20-30px)` and animate in via GSAP ScrollTrigger at `start: 'top 70%'`
- **Custom cursor:** Dot (8px) follows instantly, ring (32px) follows with lerp (0.12). Ring expands to 52px on link/button hover.

## 📄 Routes

| Route                | Type      | Description                                    |
|----------------------|-----------|------------------------------------------------|
| `/`                  | Static    | Landing page — Hero, Manifesto, Collection preview, Artifact, Footer |
| `/baca`              | Static    | Lontar manuscript reader with aksara annotations |
| `/viewer`            | Static    | 3D lontar leaf viewer (vanilla Three.js)       |
| `/koleksi`           | Static    | Collection index — artifact cards with 3D previews |
| `/koleksi/[slug]`    | Dynamic   | Artifact detail — 3D viewer + metadata panel   |

## 🧠 Architecture & Implementation Details

### 1. SSR Handling for Three.js
Three.js relies on the browser `window` object. All 3D components are imported via `next/dynamic` with `{ ssr: false }` to prevent hydration mismatch:
```tsx
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), { ssr: false })
```

### 2. Koleksi System (`/koleksi`)
- **Data layer:** `src/data/koleksi.ts` — TypeScript interfaces (`Artifact`, `Hotspot`) with seed data for 2 artifacts.
- **Collection page:** Grid of cards, each with a `<CardPreview>` R3F canvas showing a rotating wireframe (dodecahedron for objects, box for manuscripts).
- **Detail page:** Two-column layout inspired by museum collection sites.
  - **Left:** Full-height `<ModelViewer>` — attempts to load `/models/[slug].glb` via `useGLTF`, falls back to wireframe placeholder if 404.
  - **Right:** Metadata panel with bilingual description toggle (ID/EN), metadata list, and 3 hotspot annotation buttons.
  - **Hotspots:** Clickable spheres in 3D space that display tooltip labels. Selecting a hotspot from the panel highlights it on the model.
  - **Responsive:** Switches to stacked (vertical) layout at `≤768px`.

### 3. GSAP Animation Pattern
All pages follow the same reveal pattern:
```ts
gsap.to('.element', {
  opacity: 1, y: 0, duration: 0.9,
  stagger: 0.15, ease: 'power3.out',
  scrollTrigger: { trigger: '.container', start: 'top 70%' },
})
```

## 🚀 Next Steps

### Immediate: Add Real 3D Models
1. Place `.glb` files in `public/models/` matching the artifact `slug` (e.g., `sepatu-koku.glb`, `daun-lontar-01.glb`)
2. The `ModelViewer` component auto-detects and loads them — no code changes needed
3. Adjust hotspot `position: [x, y, z]` values in `koleksi.ts` to match actual model geometry

### Future Enhancements
- Admin panel for artifact CRUD with drag-to-place hotspot positioning
- Search & filter on the collection page
- ML-based aksara detection for automated annotations
- Photogrammetry pipeline integration (scan → `.glb` → auto-publish)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open browser
http://localhost:3000
```
