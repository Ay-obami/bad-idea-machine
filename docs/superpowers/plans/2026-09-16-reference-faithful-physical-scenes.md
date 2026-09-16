# Reference-Faithful Physical Scenes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dark-photo-plus-SVG presentation with authored photographic room states and photographic moving actors that match the approved cinematic reference.

**Architecture:** Keep App/session/VRF/economic boundaries unchanged. Replace `CinematicBackdrop` with a room-file selector driven by `environment + phase + tier`; keep SceneScript timing, but render only photographic actor cutouts in `SceneActor`. OutcomeStrip reuses the exact five authored result files used by the main stage.

**Tech Stack:** React, TypeScript, CSS, Web Animations API, Vite, Playwright/Chromium, Chain casino SDK simulator.

**Spec:** `docs/superpowers/specs/2026-09-16-reference-faithful-physical-scenes.md`

## Global Constraints

- No changes to `BadIdeaMachineGame.sol`, `badIdea.ts`, paytables, RTP, risk encoding, VRF, or payout settlement.
- Live stage may not render SVG actor artwork.
- Five distinct authored result files per environment are mandatory.
- Existing deterministic SceneScript remains authoritative for reveal timing/event ordering.
- Production assets must be self-hosted.

---

### Task 1: Import authored photographic room and actor assets

**Files:**
- Add: `sdk/casino-sdk/examples/bad-idea-machine/public/cinematic/kitchen/{idle,chaos,result-0,result-1,result-2,result-3,result-4}.webp`
- Add: `sdk/casino-sdk/examples/bad-idea-machine/public/cinematic/garage/{idle,chaos,result-0,result-1,result-2,result-3,result-4}.webp`
- Add: `sdk/casino-sdk/examples/bad-idea-machine/public/cinematic/actors/*.webp`

- [ ] Upload the approved fourteen room-state WebPs and photographic actor cutouts.
- [ ] Verify files are non-empty and no remote runtime URL is introduced.
- [ ] Commit `feat: add authored cinematic room states`.

### Task 2: Add explicit room-file mapping and tests

**Files:**
- Modify: `src/scene/visual-state.ts`
- Modify: `src/scene/visual-state.test.ts`

**Produces:**
- `roomPlateFor(environment, phase, tier?) => string`
- `actorPhotoFor(actorId) => string | undefined`

- [ ] Add failing tests asserting exact idle/chaos/result paths and five distinct result paths per environment.
- [ ] Add failing tests asserting known photographic actor IDs resolve and unsupported IDs do not.
- [ ] Implement the mapping with local `/cinematic/...` paths only.
- [ ] Run focused tests and commit.

### Task 3: Replace CSS damage compositor with authored room files

**Files:**
- Modify: `src/components/CinematicBackdrop.tsx`
- Replace/trim: `src/styles/cinematic-stage.css`

- [ ] Render exactly one authored room-state file for the current state.
- [ ] Reveal may use a brief crossfade/zoom and light atmospheric treatment, but remove primary scorch/crack/debris fake-damage layers.
- [ ] Result phase binds to `result-{tier}.webp` and persists.
- [ ] Compact mode uses the same exact result files for outcome cards.
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

### Task 5: Guarantee a photographic moving actor in every scene and simplify overlays

**Files:**
- Modify: `src/scene/scene-script.ts`
- Modify: `src/scene/scene-script.test.ts`
- Modify: `src/components/EnvironmentStage.tsx`
- Modify: `src/styles/cinematic-stage.css`

- [ ] Add regression tests that every generated script contains at least one actor with a photographic cutout.
- [ ] Preserve all existing tier-ambiguity and duration invariants while enforcing that presentation-only guarantee.
- [ ] Keep HUD compact/translucent, reduce VFX coverage, and keep the room visible.
- [ ] Make result card smaller and position it away from primary destruction.
- [ ] Run tests/build/typecheck and commit.

### Task 6: Bind outcome strip directly to authored aftermath files

**Files:**
- Modify: `src/components/OutcomeStrip.tsx`
- Modify: `src/styles/cinematic-shell.css`

- [ ] Ensure each card displays its exact result file.
- [ ] Preserve real multiplier text from selected risk mode.
- [ ] Keep selected `YOUR DAMAGE` marker after settlement.
- [ ] Ensure five cards remain readable on desktop and scroll/stack cleanly on mobile.
- [ ] Run tests/typecheck and commit.

### Task 7: Strengthen Chromium visual contract

**Files:**
- Modify: `.github/workflows/visual-smoke.yml`

- [ ] Assert Kitchen idle/reveal/result use `/cinematic/kitchen/idle.webp`, `/chaos.webp`, and `/result-{tier}.webp`.
- [ ] Assert Garage idle/reveal/result use equivalent Garage files.
- [ ] Assert all five outcome cards use five distinct result files.
- [ ] Assert `.actor-art` SVG count is zero and at least one `.actor-photo` physically moves during reveal.
- [ ] Repeat core checks at 390px mobile.
- [ ] Capture `kitchen-idle`, `kitchen-chaos`, `kitchen-result`, `garage-idle`, `garage-chaos`, `garage-result`, and mobile screenshots.
- [ ] Commit.

### Task 8: Full economic and production regression

- [ ] Run game unit tests and typecheck.
- [ ] Compile simulator contract and run SDK tests.
- [ ] Build and audit production bundle.
- [ ] Run 105 real local-VRF settlements.
- [ ] Confirm `BadIdeaMachineGame.sol` and `badIdea.ts` have zero diff from `main`.
- [ ] Manually inspect screenshots side-by-side with the approved reference; reject if the room is obscured or actors look pasted/cartoonish.

### Task 9: Merge and deploy only after visual approval gates

- [ ] Merge branch to `main` only after exact-head CI + visual smoke are green.
- [ ] Verify merged `main` again.
- [ ] Publish/deploy the exact verified main artifact.
- [ ] Probe public `/`, `/game.manifest.json`, representative room-state assets, and actor assets for HTTP 200.
