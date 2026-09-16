# Reference-Faithful Physical Scenes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dark-photo-plus-SVG presentation with authored photographic room states and photographic moving actors that match the approved cinematic reference.

**Architecture:** Keep App/session/VRF/economic boundaries unchanged. Replace `CinematicBackdrop` with a room-plate selector driven by `environment + phase + tier`; keep SceneScript timing, but render only photographic actor cutouts in `SceneActor`. OutcomeStrip reuses the exact five authored result plates used by the main stage.

**Tech Stack:** React, TypeScript, CSS, Web Animations API, Vite, Playwright/Chromium, Chain casino SDK simulator.

**Spec:** `docs/superpowers/specs/2026-09-16-reference-faithful-physical-scenes.md`

## Global Constraints

- No changes to `BadIdeaMachineGame.sol`, `badIdea.ts`, paytables, RTP, risk encoding, VRF, or payout settlement.
- Live stage may not render SVG actor artwork.
- Main result imagery must come from distinct `result-0.webp` … `result-4.webp` files.
- Existing deterministic SceneScript remains authoritative for reveal timing/event ordering.
- Production assets must be self-hosted.

---

### Task 1: Import authored photographic room and actor assets

**Files:**
- Add: `sdk/casino-sdk/examples/bad-idea-machine/public/cinematic/kitchen/{idle,chaos,result-0,result-1,result-2,result-3,result-4,after-heavy}.webp`
- Add: `sdk/casino-sdk/examples/bad-idea-machine/public/cinematic/garage/{idle,chaos,result-0,result-1,result-2,result-3,result-4,after-heavy}.webp`
- Add: `sdk/casino-sdk/examples/bad-idea-machine/public/cinematic/actors/*.webp`

- [ ] Upload the already-approved optimized WebP assets.
- [ ] Verify every file is non-empty and no remote runtime URL is introduced.
- [ ] Commit `feat: add authored cinematic room states`.

### Task 2: Add explicit room-state mapping and tests

**Files:**
- Modify: `src/scene/visual-state.ts`
- Modify: `src/scene/visual-state.test.ts`

**Produces:**
- `roomPlateFor(environment, phase, tier?) => string`
- `actorPhotoFor(actorId) => string | undefined`

- [ ] Add failing tests asserting idle/chaos/result paths and five distinct result paths per environment.
- [ ] Add failing tests asserting known photographic actor IDs resolve and unsupported IDs do not.
- [ ] Implement the mapping with local `/cinematic/...` paths only.
- [ ] Run the focused tests and commit.

### Task 3: Replace CSS damage compositor with authored room plates

**Files:**
- Modify: `src/components/CinematicBackdrop.tsx`
- Replace/trim: `src/styles/cinematic-stage.css`

- [ ] Update backdrop to render exactly one authored room image for the current state.
- [ ] Reveal may use a brief crossfade/zoom and light atmospheric overlay, but remove primary scorch/crack/debris fake-damage layers.
- [ ] Result phase must bind to `result-{tier}.webp` and persist.
- [ ] Compact mode must use the same result plates for outcome cards.
- [ ] Run typecheck/tests and commit.

### Task 4: Replace live SVG actor artwork with photographic cutouts

**Files:**
- Modify: `src/components/SceneActor.tsx`
- Modify: `src/components/scenes/ActorArtwork.tsx`
- Modify: `src/styles/cinematic-actors.css`

- [ ] Add a failing unit/source assertion that live actor rendering no longer produces `.actor-art` SVG output.
- [ ] Render `<img class="actor-photo">` for exact actor IDs that have authored cutouts.
- [ ] Unsupported actor IDs render no visible artwork while retaining event/audio/VFX behavior.
- [ ] Preserve deterministic Web Animations movement path and data hooks.
- [ ] Tune per-actor sizing/shadow so objects sit naturally in the photographed room.
- [ ] Run tests/typecheck and commit.

### Task 5: Simplify stage overlays so the room stays dominant

**Files:**
- Modify: `src/components/EnvironmentStage.tsx`
- Modify: `src/styles/cinematic-stage.css`

- [ ] Keep HUD compact and translucent.
- [ ] Reduce VFX opacity/coverage; do not black out the room.
- [ ] Make result card smaller and position it away from the primary destruction area.
- [ ] Keep event probe hidden and diagnostic only.
- [ ] Run build/typecheck and commit.

### Task 6: Bind outcome strip directly to authored aftermaths

**Files:**
- Modify: `src/components/OutcomeStrip.tsx`
- Modify: `src/styles/cinematic-shell.css`

- [ ] Ensure each card displays its exact `result-{tier}.webp` plate.
- [ ] Preserve real multiplier text from the selected risk mode.
- [ ] Keep selected `YOUR DAMAGE` marker after settlement.
- [ ] Ensure five cards remain readable on desktop and horizontally scroll/stack cleanly on mobile.
- [ ] Run tests/typecheck and commit.

### Task 7: Strengthen Chromium visual contract

**Files:**
- Modify: `.github/workflows/visual-smoke.yml`

- [ ] Assert Kitchen idle uses `/cinematic/kitchen/idle.webp`.
- [ ] Assert Kitchen reveal uses `/cinematic/kitchen/chaos.webp`.
- [ ] Assert result uses `/cinematic/kitchen/result-{tier}.webp` and is not idle.
- [ ] Assert all five outcome cards use five distinct result assets.
- [ ] Assert `.actor-art` SVG count is zero and at least one `.actor-photo` physically moves during reveal.
- [ ] Repeat core checks for Garage and 390px mobile.
- [ ] Capture `kitchen-idle`, `kitchen-chaos`, `kitchen-result`, `garage-idle`, `garage-chaos`, `garage-result`, and mobile screenshots.
- [ ] Commit.

### Task 8: Full economic and production regression

- [ ] Run game unit tests and typecheck.
- [ ] Compile simulator contract and run SDK tests.
- [ ] Build and audit production bundle.
- [ ] Run 105 real local-VRF settlements.
- [ ] Confirm `BadIdeaMachineGame.sol` and `badIdea.ts` have zero diff from `main`.
- [ ] Manually inspect final screenshots side-by-side with the approved reference; reject if the room is obscured or actors look pasted/cartoonish.

### Task 9: Merge and deploy only after visual approval gates

- [ ] Merge branch to `main` only after exact-head CI + visual smoke are green.
- [ ] Verify merged `main` again.
- [ ] Publish/deploy the exact verified main artifact.
- [ ] Probe public `/`, `/game.manifest.json`, authored room assets, and actor assets for HTTP 200.
