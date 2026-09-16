# Dual Environment Scene Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the station-card presentation with two switchable, full-scene animated environments—Kitchen Meltdown and Garage Mayhem—where real illustrated actors move across the room while preserving the existing Chain SDK, VRF, payout, and 96% RTP behavior.

**Architecture:** Keep `App.tsx` as the economic/session boundary and replace `MachineStage`/`route.ts` with a data-driven scene system. `buildSceneScript(environment, tier, visualSeed)` generates deterministic cosmetic events; `EnvironmentStage` renders scene decor, actors, VFX, and result overlay; environment-specific configs supply actor homes, paths, sounds, and flavor while sharing one renderer/timeline engine.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Vitest 3, CSS transforms/animations, inline SVG, Web Audio API, Chain Casino SDK, viem.

**Spec:** `docs/superpowers/specs/2026-09-16-dual-environment-scene-rebuild.md`

## Global Constraints

- Keep the existing Solidity contract and Chain SDK settlement flow unchanged.
- Keep exactly 96.00% theoretical RTP for all three risk modes.
- Environment choice is cosmetic only and must never enter contract `gameData`.
- `visualSeed` is the only randomness source for presentation.
- Reveal duration must remain between 4,700 and 6,200 ms.
- Shared early choreography must not encode payout tier.
- Use a normalized logical scene size of 1000 × 600.
- No 3D engine and no per-frame React state loop.
- Prefer inline SVG/CSS actors and transform/opacity animation.
- Preserve standalone static build, Chain embed compatibility, manifest, widget, build audit, and 105-round local-VRF gate.
- Production `main` stays untouched until the rebuild branch passes unit, type, build, VRF, and Chromium visual gates.

---

## File Structure

### Create

- `sdk/casino-sdk/examples/bad-idea-machine/src/scene/types.ts` — shared scene/environment/event types.
- `sdk/casino-sdk/examples/bad-idea-machine/src/scene/random.ts` — deterministic byte/random helpers for visual scripting.
- `sdk/casino-sdk/examples/bad-idea-machine/src/scene/environments.ts` — Kitchen/Garage actor definitions and environment metadata.
- `sdk/casino-sdk/examples/bad-idea-machine/src/scene/scene-script.ts` — deterministic catastrophe script generator.
- `sdk/casino-sdk/examples/bad-idea-machine/src/scene/scene-script.test.ts` — ambiguity, determinism, movement, hazard, duration tests.
- `sdk/casino-sdk/examples/bad-idea-machine/src/scene/audio-plan.ts` — environment-specific sound-plan builder.
- `sdk/casino-sdk/examples/bad-idea-machine/src/scene/audio-plan.test.ts` — sound differentiation/intensity tests.
- `sdk/casino-sdk/examples/bad-idea-machine/src/components/EnvironmentStage.tsx` — timeline/render coordinator replacing `MachineStage`.
- `sdk/casino-sdk/examples/bad-idea-machine/src/components/SceneActor.tsx` — positioned/moving actor renderer.
- `sdk/casino-sdk/examples/bad-idea-machine/src/components/SceneVfx.tsx` — deterministic impact VFX.
- `sdk/casino-sdk/examples/bad-idea-machine/src/components/scenes/KitchenScene.tsx` — kitchen decor and actor SVGs.
- `sdk/casino-sdk/examples/bad-idea-machine/src/components/scenes/GarageScene.tsx` — garage decor and actor SVGs.
- `sdk/casino-sdk/examples/bad-idea-machine/src/components/scenes/ActorArtwork.tsx` — shared actor artwork switch for moving objects.
- `sdk/casino-sdk/examples/bad-idea-machine/src/styles/environment-stage.css` — stage/layout/actor motion/VFX styles.
- `sdk/casino-sdk/examples/bad-idea-machine/src/styles/kitchen.css` — kitchen-specific scene/decor styles.
- `sdk/casino-sdk/examples/bad-idea-machine/src/styles/garage.css` — garage-specific scene/decor styles.

### Modify

- `sdk/casino-sdk/examples/bad-idea-machine/src/App.tsx` — store selected environment and per-round environment, call `buildSceneScript`, render `EnvironmentStage`.
- `sdk/casino-sdk/examples/bad-idea-machine/src/components/ControlPanel.tsx` — add Chaos Type selector.
- `sdk/casino-sdk/examples/bad-idea-machine/src/components/FairnessReceipt.tsx` — show environment and catastrophe summary instead of station route.
- `sdk/casino-sdk/examples/bad-idea-machine/src/lib/audio.ts` — execute new environment sound cues while preserving mute/prime/result behavior.
- `sdk/casino-sdk/examples/bad-idea-machine/src/styles.css` — import new scene styles.
- `sdk/casino-sdk/examples/bad-idea-machine/src/styles/bad-idea.css` — retain shell/control/result styles; remove machine-board dependencies after migration.
- `.github/workflows/visual-smoke.yml` — validate Kitchen/Garage motion, fire/blast, mobile clipping, and result timing.
- `README.md` — describe dual environments.
- `sdk/casino-sdk/examples/bad-idea-machine/SUBMISSION.md` — update judge-facing pitch and controls.

### Remove after migration passes

- `sdk/casino-sdk/examples/bad-idea-machine/src/components/MachineStage.tsx`
- `sdk/casino-sdk/examples/bad-idea-machine/src/lib/route.ts`
- `sdk/casino-sdk/examples/bad-idea-machine/src/lib/route.test.ts`
- `sdk/casino-sdk/examples/bad-idea-machine/src/styles/chaos.css`
- `sdk/casino-sdk/examples/bad-idea-machine/src/styles/chaos-max.css`

---

### Task 1: Introduce the Scene Type System

**Files:**
- Create: `src/scene/types.ts`
- Create: `src/scene/random.ts`
- Test: `src/scene/scene-script.test.ts`

**Interfaces:**
- Produces: `EnvironmentId`, `ScenePoint`, `SceneActorDefinition`, `MotionKeyframe`, `SceneEvent`, `SceneFinalizer`, `SceneScript`, deterministic byte helpers.

- [ ] **Step 1: Write the failing type/utility tests**

Create the initial test file with deterministic helper assertions:

```ts
import { describe, expect, it } from 'vitest';
import type { Hex } from 'viem';
import { visualByte, visualU16 } from './random';

const SEED = `0x${'00112233445566778899aabbccddeeff'.repeat(2)}` as Hex;

describe('scene visual randomness helpers', () => {
  it('reads visual bytes deterministically with wrapping', () => {
    expect(visualByte(SEED, 0)).toBe(0x00);
    expect(visualByte(SEED, 1)).toBe(0x11);
    expect(visualByte(SEED, 32)).toBe(0x00);
  });

  it('builds deterministic unsigned 16-bit values', () => {
    expect(visualU16(SEED, 0)).toBe(0x0011);
    expect(visualU16(SEED, 2)).toBe(0x2233);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run from `sdk/casino-sdk`:

```bash
npm --prefix examples/bad-idea-machine test -- scene/scene-script.test.ts
```

Expected: FAIL because `scene/random.ts` does not exist.

- [ ] **Step 3: Add the shared types**

Implement exactly:

```ts
export type EnvironmentId = 'kitchen' | 'garage';
export type ScenePoint = Readonly<{ x: number; y: number }>;
export type SceneHazard = 'sparks' | 'fire' | 'smoke' | 'debris' | 'blast' | 'alarm' | 'steam' | 'shards';
export type SceneAction = 'launch' | 'drop' | 'swing' | 'roll' | 'ricochet' | 'ignite' | 'explode' | 'collapse' | 'vent' | 'shatter' | 'near-miss';
export type SceneIntensity = 1 | 2 | 3;

export type SceneActorDefinition = Readonly<{
  id: string;
  kind: string;
  home: ScenePoint;
  rotation: number;
  scale: number;
  zIndex: number;
  ariaLabel: string;
}>;

export type MotionKeyframe = Readonly<{
  at: number;
  x: number;
  y: number;
  rotation: number;
  scale?: number;
}>;

export type SceneEvent = Readonly<{
  id: string;
  actorId: string;
  action: SceneAction;
  startMs: number;
  durationMs: number;
  path: readonly MotionKeyframe[];
  impact?: ScenePoint;
  hazard: SceneHazard;
  intensity: SceneIntensity;
  decoy: boolean;
  effectSeed: number;
  soundCue: string;
}>;

export type SceneFinalizer = Readonly<{
  tier: 0 | 1 | 2 | 3 | 4;
  label: string;
  flavor: string;
  impact?: ScenePoint;
}>;

export type SceneScript = Readonly<{
  environment: EnvironmentId;
  durationMs: number;
  events: readonly SceneEvent[];
  finalizer: SceneFinalizer;
}>;
```

- [ ] **Step 4: Implement deterministic seed helpers**

Use `hexToBytes` from viem and wrap indices modulo 32. `visualU16(seed, i)` returns `(byte(i) << 8) | byte(i + 1)`.

- [ ] **Step 5: Run focused test and typecheck**

```bash
npm --prefix examples/bad-idea-machine test -- scene/scene-script.test.ts
npm --prefix examples/bad-idea-machine run check-types
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add sdk/casino-sdk/examples/bad-idea-machine/src/scene
git commit -m "feat: add scene animation type system"
```

---

### Task 2: Define Kitchen and Garage Environments

**Files:**
- Create: `src/scene/environments.ts`
- Modify/Test: `src/scene/scene-script.test.ts`

**Interfaces:**
- Produces: `EnvironmentDefinition`, `ENVIRONMENTS`, `getEnvironmentDefinition(environment)`.
- Consumes: `EnvironmentId`, `SceneActorDefinition`, `ScenePoint`.

- [ ] **Step 1: Add failing environment-definition tests**

Add tests asserting:

```ts
import { getEnvironmentDefinition } from './environments';

it('uses materially different kitchen and garage actor sets', () => {
  const kitchen = getEnvironmentDefinition('kitchen');
  const garage = getEnvironmentDefinition('garage');
  const kitchenKinds = new Set(kitchen.actors.map(actor => actor.kind));
  const garageKinds = new Set(garage.actors.map(actor => actor.kind));

  expect(kitchenKinds.has('toaster')).toBe(true);
  expect(kitchenKinds.has('kettle')).toBe(true);
  expect(garageKinds.has('drill')).toBe(true);
  expect(garageKinds.has('tire')).toBe(true);
  expect(kitchenKinds.has('drill')).toBe(false);
  expect(garageKinds.has('kettle')).toBe(false);
});

it('places every actor inside the 1000x600 logical stage', () => {
  for (const id of ['kitchen', 'garage'] as const) {
    for (const actor of getEnvironmentDefinition(id).actors) {
      expect(actor.home.x).toBeGreaterThanOrEqual(0);
      expect(actor.home.x).toBeLessThanOrEqual(1000);
      expect(actor.home.y).toBeGreaterThanOrEqual(0);
      expect(actor.home.y).toBeLessThanOrEqual(600);
    }
  }
});
```

- [ ] **Step 2: Run and verify RED**

Expected failure: missing `environments.ts`.

- [ ] **Step 3: Implement `EnvironmentDefinition` and actor homes**

Use:

```ts
export type EnvironmentDefinition = Readonly<{
  id: EnvironmentId;
  label: string;
  shortLabel: string;
  actors: readonly SceneActorDefinition[];
  impactZones: Readonly<Record<string, ScenePoint>>;
  ambientCue: string;
}>;
```

Kitchen actor IDs/kinds must include:

`kitchen-toaster`, `kitchen-toast`, `kitchen-cat`, `kitchen-pan`, `kitchen-kettle`, `kitchen-cabinet`, `kitchen-plates`, `kitchen-fan`, `kitchen-ball`, `kitchen-rocket`, `kitchen-safe`, `kitchen-core`.

Garage actor IDs/kinds must include:

`garage-hammer`, `garage-wrench`, `garage-drill`, `garage-saw`, `garage-chain`, `garage-fan`, `garage-tire`, `garage-ball`, `garage-rocket`, `garage-tank`, `garage-toolbox`, `garage-shelf`, `garage-safe`, `garage-core`.

Choose stable home points matching the design zones. Keep large traveling actors away from control-panel boundaries.

- [ ] **Step 4: Run tests/typecheck and commit**

```bash
npm --prefix examples/bad-idea-machine test -- scene/scene-script.test.ts
npm --prefix examples/bad-idea-machine run check-types
git add sdk/casino-sdk/examples/bad-idea-machine/src/scene
git commit -m "feat: define kitchen and garage scene actors"
```

---

### Task 3: Replace Station Routes with Deterministic Scene Scripts

**Files:**
- Create: `src/scene/scene-script.ts`
- Modify: `src/scene/scene-script.test.ts`

**Interfaces:**
- Produces:

```ts
buildSceneScript(environment: EnvironmentId, tier: OutcomeTier, visualSeed: Hex): SceneScript
sceneDurationMs(script: SceneScript): number
catastropheSummary(script: SceneScript): readonly string[]
```

- [ ] **Step 1: Add RED tests for the required invariants**

Tests must iterate at least 64 deterministic seeds across both environments and all five tiers and assert:

```ts
expect(script.durationMs).toBeGreaterThanOrEqual(4700);
expect(script.durationMs).toBeLessThanOrEqual(6200);
expect(script.events.length).toBeGreaterThanOrEqual(8);
expect(script.events.length).toBeLessThanOrEqual(12);
expect(new Set(script.events.map(event => event.actorId)).size).toBeGreaterThanOrEqual(4);
expect(script.events.some(event => event.decoy)).toBe(true);
expect(script.events.some(event => event.hazard === 'fire' || event.hazard === 'blast')).toBe(true);
expect(script.events.some(event => ['debris', 'smoke', 'steam', 'shards'].includes(event.hazard))).toBe(true);
```

Add a meaningful-motion helper:

```ts
function travel(event: SceneEvent) {
  const first = event.path[0];
  const last = event.path.at(-1)!;
  return { dx: Math.abs(last.x - first.x), dy: Math.abs(last.y - first.y) };
}
```

Assert at least one event has `dx >= 350 || dy >= 180`.

- [ ] **Step 2: Add the payout-ambiguity regression test**

For the same `environment + visualSeed`, build tier 0 and tier 4 scripts and compare all non-finalizer data:

```ts
expect(failure.events).toEqual(huge.events);
expect(failure.durationMs).toBe(huge.durationMs);
expect(failure.finalizer.tier).toBe(0);
expect(huge.finalizer.tier).toBe(4);
```

This test is mandatory: no later change may reintroduce tier-coded route length.

- [ ] **Step 3: Run tests and verify RED**

Expected: missing `buildSceneScript`.

- [ ] **Step 4: Implement a seeded event-template deck**

Create separate Kitchen and Garage event-template arrays inside `scene-script.ts` or focused local helpers. Each template specifies actor, action, start/end/control points, hazard candidates, sound cue, and optional impact zone.

Use seed bytes to:

1. shuffle templates;
2. choose 8–12 events;
3. guarantee required hazard categories by injecting one fire/blast and one debris/smoke/steam/shards template when needed;
4. mark 1–3 events as decoys;
5. choose target total duration 4,700–6,200 ms;
6. distribute event start times with controlled overlaps so at least one pair may overlap but the final event completes by `durationMs`;
7. derive `effectSeed` from deterministic seed bytes;
8. choose only the `SceneFinalizer` from tier.

Do not use `Math.random()` anywhere in scene generation.

- [ ] **Step 5: Implement environment-specific finalizers**

Failure and win copy must differ by environment but not affect event choreography. Example labels:

- Kitchen failure: `TOTAL CHAOS. ZERO DINNER.`
- Garage failure: `WORKSHOP DESTROYED. PROFIT MISSING.`
- Huge Kitchen: `CATASTROPHICALLY EDIBLE SUCCESS`
- Huge Garage: `INDUSTRIAL-GRADE BAD DECISION`

- [ ] **Step 6: Run focused tests, full app tests, typecheck, commit**

```bash
npm --prefix examples/bad-idea-machine test -- scene/scene-script.test.ts
npm --prefix examples/bad-idea-machine test
npm --prefix examples/bad-idea-machine run check-types
git add sdk/casino-sdk/examples/bad-idea-machine/src/scene
git commit -m "feat: generate deterministic environment catastrophes"
```

---

### Task 4: Build Environment Artwork as Actual Scene Objects

**Files:**
- Create: `src/components/scenes/KitchenScene.tsx`
- Create: `src/components/scenes/GarageScene.tsx`
- Create: `src/components/scenes/ActorArtwork.tsx`

**Interfaces:**
- Produces:

```ts
KitchenScene(): JSX.Element
GarageScene(): JSX.Element
ActorArtwork({ kind }: { kind: string }): JSX.Element
```

- [ ] **Step 1: Implement static room composition first**

Kitchen SVG/CSS decor must visibly include counter, cabinets, stove/burner, microwave/hood, fridge, sink, shelves, hanging utensils/pans, and warning hardware.

Garage decor must visibly include workbench, pegboard, shelves, metal cabinet, tire/rack area, cables, tool silhouettes, floor markings, and industrial warning hardware.

Static decor must use `aria-hidden="true"`; moving actors receive meaningful labels through `SceneActor`.

- [ ] **Step 2: Implement illustrated actor artwork**

`ActorArtwork` must render recognizable inline SVG/CSS silhouettes for every environment actor kind. The critical requirement is immediate object identity: toaster must read as toaster, hammer as hammer, rocket as rocket, safe as safe, tire as tire, drill as drill.

Do not render the actor as a text label inside a card.

- [ ] **Step 3: Add stable test hooks**

Every scene root exposes:

```html
<div data-environment="kitchen">...</div>
<div data-environment="garage">...</div>
```

Every moving actor later exposes `data-scene-actor="<actor-id>"`.

- [ ] **Step 4: Typecheck and commit**

```bash
npm --prefix examples/bad-idea-machine run check-types
git add sdk/casino-sdk/examples/bad-idea-machine/src/components/scenes
git commit -m "feat: add kitchen and garage scene artwork"
```

---

### Task 5: Build the Actor Motion and VFX Renderer

**Files:**
- Create: `src/components/SceneActor.tsx`
- Create: `src/components/SceneVfx.tsx`
- Create: `src/styles/environment-stage.css`

**Interfaces:**
- `SceneActor` consumes actor definition + current event + timeline revision.
- `SceneVfx` consumes the currently started scene events and renders deterministic particles at their impact coordinates.

- [ ] **Step 1: Implement logical-coordinate positioning**

Actor home position maps to:

```ts
left: `${actor.home.x / 10}%`;
top: `${actor.home.y / 6}%`;
```

Transforms must use `translate(-50%, -50%) rotate(...) scale(...)` so points represent actor centers.

- [ ] **Step 2: Generate Web Animation keyframes from `SceneEvent.path`**

Build keyframes like:

```ts
const frames = event.path.map(frame => ({
  offset: frame.at,
  left: `${frame.x / 10}%`,
  top: `${frame.y / 6}%`,
  transform: `translate(-50%, -50%) rotate(${frame.rotation}deg) scale(${frame.scale ?? actor.scale})`,
}));
```

Call `element.animate(frames, { duration: event.durationMs, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'forwards' })` at event start. Cancel animations/reset actor homes when script/round changes.

- [ ] **Step 3: Implement impact-local VFX**

`SceneVfx` must generate particles from `effectSeed`, never `Math.random()`. Spawn origin is `event.impact` or the final path point. Fire, smoke, steam, sparks, shards, debris, and blast each get visually different CSS classes.

- [ ] **Step 4: Add camera-impact attributes**

When intensity 3 impact/blast starts, set a stage class/data attribute such as `data-camera-impact="3"` for a short CSS shake. Do not shake continuously.

- [ ] **Step 5: Typecheck and commit**

```bash
npm --prefix examples/bad-idea-machine run check-types
git add sdk/casino-sdk/examples/bad-idea-machine/src/components/SceneActor.tsx sdk/casino-sdk/examples/bad-idea-machine/src/components/SceneVfx.tsx sdk/casino-sdk/examples/bad-idea-machine/src/styles/environment-stage.css
git commit -m "feat: animate physical scene actors and impacts"
```

---

### Task 6: Build `EnvironmentStage` Timeline Coordinator

**Files:**
- Create: `src/components/EnvironmentStage.tsx`

**Interfaces:**

```ts
export type ScenePhase = 'idle' | 'arming' | 'revealing' | 'result';

type Props = {
  environment: EnvironmentId;
  riskMode: RiskMode;
  phase: ScenePhase;
  script: SceneScript | null;
  tier?: OutcomeTier;
  multiplierBps?: number;
};
```

- [ ] **Step 1: Render selected room and all actors at home in idle state**

Render `KitchenScene` or `GarageScene` as decor, then render all environment actor definitions with `SceneActor`.

- [ ] **Step 2: Advance timeline by event boundaries only**

On `revealing`, schedule timers at each `event.startMs`; when an event starts, add its ID to an active/started set and call the audio cue. Do not update position on requestAnimationFrame.

- [ ] **Step 3: Render decoys indistinguishably from primary events**

Decoy is metadata for testing/script generation; visually it must still look like a real accident. Never label a decoy as `FALSE ALARM` during the reveal.

- [ ] **Step 4: Render result only in `result` phase**

Use the existing multiplier formatting semantics. The result overlay should sit over the room only after script completion.

- [ ] **Step 5: Add deterministic reset**

When phase returns to idle/arming or script changes, cancel timers/animations, clear VFX, and return actors to homes.

- [ ] **Step 6: Typecheck and commit**

```bash
npm --prefix examples/bad-idea-machine run check-types
git add sdk/casino-sdk/examples/bad-idea-machine/src/components/EnvironmentStage.tsx
git commit -m "feat: coordinate environment catastrophe timeline"
```

---

### Task 7: Add Chaos Type Selection and Persist It

**Files:**
- Modify: `src/components/ControlPanel.tsx`
- Modify: `src/App.tsx`

**Interfaces:**

Add to `ControlPanel`:

```ts
environment: EnvironmentId;
onEnvironmentChange: (environment: EnvironmentId) => void;
```

- [ ] **Step 1: Add a failing component-level behavior test if an existing React test harness is introduced; otherwise enforce via browser smoke in Task 11**

The selector labels must be exactly:

- `KITCHEN MELTDOWN`
- `GARAGE MAYHEM`

- [ ] **Step 2: Add environment state in `App.tsx`**

Initialize with:

```ts
const [environment, setEnvironment] = useState<EnvironmentId>(() => {
  const saved = localStorage.getItem('bad-idea-environment');
  return saved === 'garage' ? 'garage' : 'kitchen';
});
```

Guard `localStorage` for non-browser evaluation if necessary.

Persist changes in an effect.

- [ ] **Step 3: Lock selector while round is active**

Reuse `controlsLocked` in `ControlPanel`; environment buttons receive `disabled={controlsLocked}`.

- [ ] **Step 4: Store environment on each Round**

Extend `Round`:

```ts
environment: EnvironmentId;
script: SceneScript | null;
```

Host/demo round opening snapshots the selected environment. Recovered rounds use current cosmetic selection.

- [ ] **Step 5: Keep environment out of `encodeGameData`**

`hostApi.openSession` must continue calling `encodeGameData(mode)` exactly. Add a source comment stating the environment is intentionally not encoded economically.

- [ ] **Step 6: Run existing economic tests/typecheck and commit**

```bash
npm --prefix examples/bad-idea-machine test -- lib/badIdea.test.ts
npm --prefix examples/bad-idea-machine run check-types
git add sdk/casino-sdk/examples/bad-idea-machine/src/App.tsx sdk/casino-sdk/examples/bad-idea-machine/src/components/ControlPanel.tsx
git commit -m "feat: let players choose chaos environment"
```

---

### Task 8: Integrate Scene Scripts into Settlement Without Changing Economics

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/FairnessReceipt.tsx`

**Interfaces:**
- Consumes `buildSceneScript`, `sceneDurationMs`, `catastropheSummary`.

- [ ] **Step 1: Replace visual route creation**

Host resolution becomes conceptually:

```ts
const visualSeed = visualSeedFromRandomness(randomness);
const script = buildSceneScript(round.environment, tier, visualSeed);
```

Demo resolution uses the same builder.

- [ ] **Step 2: Replace reveal timer source**

Use `sceneDurationMs(round.script)` instead of `routeDurationMs(round.route)` before `revealOutcome`.

- [ ] **Step 3: Render `EnvironmentStage` instead of `MachineStage`**

Pass round-specific environment during an active/result round and current selection while idle.

- [ ] **Step 4: Update fairness receipt metadata**

Add `environment` and `catastropheSummary(script)` to the receipt. Keep session ID, request ID, transaction hash, wager, payout, multiplier, and verification unchanged.

- [ ] **Step 5: Add regression test ensuring economics ignore environment**

In `badIdea.test.ts` or `scene-script.test.ts`, for fixed risk/randomness verify payout outcome is identical regardless of chosen environment; only scripts differ.

- [ ] **Step 6: Run app tests/typecheck and commit**

```bash
npm --prefix examples/bad-idea-machine test
npm --prefix examples/bad-idea-machine run check-types
git add sdk/casino-sdk/examples/bad-idea-machine/src/App.tsx sdk/casino-sdk/examples/bad-idea-machine/src/components/FairnessReceipt.tsx
git commit -m "feat: reveal settled outcomes through room catastrophes"
```

---

### Task 9: Rebuild Audio Around Environment Events

**Files:**
- Create: `src/scene/audio-plan.ts`
- Create: `src/scene/audio-plan.test.ts`
- Modify: `src/lib/audio.ts`

**Interfaces:**

```ts
export type SoundLayer = Readonly<{
  kind: 'tone' | 'noise';
  frequency?: number;
  durationMs: number;
  gain: number;
  delayMs: number;
  waveform?: OscillatorType;
}>;

export function buildEventSoundPlan(environment: EnvironmentId, event: SceneEvent): readonly SoundLayer[];
```

- [ ] **Step 1: Write RED tests**

Assert the same hazard/intensity produces different Kitchen/Garage plans and intensity 3 produces at least as many layers / higher aggregate gain than intensity 1.

- [ ] **Step 2: Implement environment palettes**

Kitchen cue families: toaster pop, pan clang, ceramic shards, steam hiss, appliance buzz, flare, cat accent, rocket, safe crash.

Garage cue families: hammer/metal clang, wrench ricochet, drill motor, chain snap, tire thump, shelf collapse, tank hiss, rocket, safe crash.

- [ ] **Step 3: Adapt `audio.ts`**

Preserve:

- `isMachineMuted`
- `setMachineMuted`
- `primeAudio`
- `playResultSound`

Replace station-specific playback with:

```ts
playSceneEventSound(environment: EnvironmentId, event: SceneEvent): void
```

- [ ] **Step 4: Run audio tests/typecheck and commit**

```bash
npm --prefix examples/bad-idea-machine test -- scene/audio-plan.test.ts
npm --prefix examples/bad-idea-machine run check-types
git add sdk/casino-sdk/examples/bad-idea-machine/src/scene/audio-plan.ts sdk/casino-sdk/examples/bad-idea-machine/src/scene/audio-plan.test.ts sdk/casino-sdk/examples/bad-idea-machine/src/lib/audio.ts
git commit -m "feat: add environment-specific catastrophe audio"
```

---

### Task 10: Finish Scene Styling and Responsive Composition

**Files:**
- Create: `src/styles/kitchen.css`
- Create: `src/styles/garage.css`
- Modify: `src/styles/environment-stage.css`
- Modify: `src/styles.css`
- Modify: `src/styles/bad-idea.css`

- [ ] **Step 1: Import the new styles**

`styles.css` imports tokens, existing shell/control styles, then environment-stage, kitchen, and garage styles.

- [ ] **Step 2: Give the stage dominant desktop space**

Desktop `.game-layout` should allocate roughly `minmax(0, 1fr) 320px` with the scene receiving the majority of width. Stage aspect ratio should approximate 5:3 and scale down without clipping.

- [ ] **Step 3: Mobile layout**

At <=820px, stack scene above controls. At <=480px, preserve a minimum useful scene height and compress labels/control gaps rather than shrinking moving actors to illegibility.

- [ ] **Step 4: Make environment identities unmistakable**

Kitchen: warm cream/orange fire light, tile/cabinet silhouettes, domestic clutter.

Garage: steel/charcoal/cool work lights, caution stripe accents, pegboard/workbench silhouettes.

Do not implement this as only a color variable swap.

- [ ] **Step 5: Ensure large trajectories remain visible**

Use `overflow: hidden` only at the outer stage boundary; actor/VFX layers themselves must allow traversal throughout the logical room. Rocket/safe/tire paths should cross obvious scene distance.

- [ ] **Step 6: Build/typecheck and commit**

```bash
npm --prefix examples/bad-idea-machine run check-types
npm --prefix examples/bad-idea-machine run build
git add sdk/casino-sdk/examples/bad-idea-machine/src/styles.css sdk/casino-sdk/examples/bad-idea-machine/src/styles
git commit -m "feat: style responsive kitchen and garage stages"
```

---

### Task 11: Upgrade Chromium Visual Smoke to Prove Real Movement

**Files:**
- Modify: `.github/workflows/visual-smoke.yml`

**Interfaces:**
- Produces screenshot artifact containing idle Kitchen, active Kitchen, active Garage, result, and 390px mobile active scene.

- [ ] **Step 1: Add browser assertions for environment switching**

The smoke script must click Garage and assert `[data-environment="garage"]` exists, then Kitchen and assert `[data-environment="kitchen"]` exists.

- [ ] **Step 2: Assert an actor actually moves**

During a reveal, sample `getBoundingClientRect()` for the current `[data-scene-actor]`, wait 150–250 ms, sample again, and fail if both center coordinates are unchanged by less than 8px total.

- [ ] **Step 3: Assert substantial motion exists in the script DOM state**

Expose current event metadata as test-only data attributes on the stage such as `data-event-actor`, `data-event-hazard`, `data-event-intensity`. Require at least one active event with fire/blast and one with a decoy marker during the sampled round.

- [ ] **Step 4: Assert result timing**

While stage reports `data-phase="revealing"`, `.result-card` must not exist. After reveal completion it must exist.

- [ ] **Step 5: Capture screenshots**

Required files:

- `kitchen-idle.png`
- `kitchen-chaos.png`
- `garage-chaos.png`
- `result.png`
- `mobile-kitchen-chaos.png`
- `mobile-garage-chaos.png`

- [ ] **Step 6: Keep console-error gate**

Any uncaught page error or console error fails the job.

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/visual-smoke.yml
git commit -m "test: verify moving environment catastrophes in browser"
```

---

### Task 12: Remove the Card/Station Presentation Completely

**Files:**
- Remove: `src/components/MachineStage.tsx`
- Remove: `src/lib/route.ts`
- Remove: `src/lib/route.test.ts`
- Remove: `src/styles/chaos.css`
- Remove: `src/styles/chaos-max.css`
- Modify: imports in `src/App.tsx`, `src/styles.css`, tests/docs.

- [ ] **Step 1: Search for obsolete symbols before deletion**

Search for `MachineStage`, `buildVisualRoute`, `RouteStep`, `MachineStation`, `station--`, `machine__rail`, `chaos-max.css`, and `chaos.css`.

- [ ] **Step 2: Delete only after zero runtime dependencies remain**

Keep fairness/economic utilities in `badIdea.ts` untouched.

- [ ] **Step 3: Run full frontend tests/typecheck/build**

```bash
npm --prefix examples/bad-idea-machine test
npm --prefix examples/bad-idea-machine run check-types
npm --prefix examples/bad-idea-machine run build
npm --prefix examples/bad-idea-machine run verify-build
```

Expected: PASS with no obsolete asset references.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove station board presentation"
```

---

### Task 13: Run Economic/VRF Regression Gates

**Files:**
- No economic source changes expected.
- Inspect only if a regression appears.

- [ ] **Step 1: Compile the simulator contracts**

From `sdk/casino-sdk` run the same command used by `.github/workflows/bootstrap-sdk.yml`.

Expected: `BadIdeaMachineGame.sol` compiles unchanged.

- [ ] **Step 2: Run SDK and Bad Idea Machine tests**

```bash
npm test
npm --prefix examples/bad-idea-machine test
```

Expected: all tests pass.

- [ ] **Step 3: Run type/build/audit**

```bash
npm --prefix examples/bad-idea-machine run check-types
npm --prefix examples/bad-idea-machine run build
npm --prefix examples/bad-idea-machine run verify-build
```

- [ ] **Step 4: Run the real local-VRF settlement soak**

Run the existing CI simulation path with 105 wagers / 35 per risk mode. Expected output must still contain:

`PASS 105 real local-VRF settlements independently recomputed from stored randomness`

- [ ] **Step 5: Confirm no Solidity/economic diff**

Before review, verify `git diff main...HEAD -- sdk/casino-sdk/simulator/contracts/BadIdeaMachineGame.sol sdk/casino-sdk/examples/bad-idea-machine/src/lib/badIdea.ts` is empty unless an explicitly reviewed non-economic import/test-only change is necessary.

- [ ] **Step 6: Commit only if verification support files changed**

Use `test: preserve economic gates for scene rebuild`.

---

### Task 14: Update Judge-Facing Documentation and Submission Copy

**Files:**
- Modify: `README.md`
- Modify: `sdk/casino-sdk/examples/bad-idea-machine/README.md`
- Modify: `sdk/casino-sdk/examples/bad-idea-machine/SUBMISSION.md`
- Modify: `ELIGIBILITY.md` if visual evidence paths changed.

- [ ] **Step 1: Replace station-board language**

Describe the game as one economic machine with two selectable disaster environments.

- [ ] **Step 2: Document cosmetic environment guarantee**

State plainly that Kitchen/Garage selection does not alter RTP or probabilities.

- [ ] **Step 3: Update the pitch**

Judge-facing summary should explain that the player chooses how reckless to be and what kind of room to destroy, then watches a deterministic scene catastrophe reveal a Chain-VRF-settled result.

- [ ] **Step 4: Update verification commands/screenshots**

Reference the new visual smoke artifact names.

- [ ] **Step 5: Commit**

```bash
git add README.md ELIGIBILITY.md sdk/casino-sdk/examples/bad-idea-machine/README.md sdk/casino-sdk/examples/bad-idea-machine/SUBMISSION.md
git commit -m "docs: describe dual environment bad idea machine"
```

---

### Task 15: Final Review, PR, and Production Handoff

**Files:**
- Review all branch changes.

- [ ] **Step 1: Run final exact-head verification**

Require green:

- contract compile;
- SDK tests;
- Bad Idea Machine tests;
- typecheck;
- production build;
- bundle/manifest/widget audit;
- 105-round real local-VRF soak;
- Chromium Kitchen/Garage desktop/mobile visual smoke.

- [ ] **Step 2: Inspect the screenshots manually**

Reject the build if the screenshots still visually read as cards/nodes, if the main objects remain in corners, or if rocket/safe/tire/toaster/hammer movement is not obvious in still-frame composition.

- [ ] **Step 3: Open a PR**

Title: `feat: rebuild Bad Idea Machine as dual environment chaos game`

PR body must explicitly state:

- no contract/paytable/RTP changes;
- Kitchen and Garage are cosmetic choices;
- early scene choreography is payout-ambiguous;
- exact CI/VRF/visual evidence.

- [ ] **Step 4: Review the PR diff**

Confirm economic files are unchanged and obsolete station presentation is removed.

- [ ] **Step 5: Merge only after exact-head gates pass**

Use a normal merge commit or repository-standard merge strategy. Do not force-update `main`.

- [ ] **Step 6: Redeploy the exact verified `main` build**

Keep Vercel Deployment Protection disabled for the public jam URL. Probe `/` and `/game.manifest.json` anonymously and verify HTTP 200.

- [ ] **Step 7: Run a public production browser check**

Verify Kitchen/Garage selection, a complete round, sound toggle, result reveal, receipt, and mobile layout on the stable URL before updating/submitting the jam entry.

---

## Self-Review

### Spec coverage

- Dual Kitchen/Garage environments: Tasks 2, 4, 7, 10.
- Actual moving physical objects: Tasks 3–6, 11.
- Fire/smoke/debris/blasts at scene locations: Tasks 3, 5, 11.
- Environment-specific sound: Task 9.
- Environment selection cosmetic only: Tasks 7, 8, 13.
- Payout ambiguity: Task 3 regression test and Task 11 browser timing checks.
- Mobile/desktop: Tasks 10–11.
- Existing Chain/RTP/VRF guarantees: Task 13.
- Removal of station-card UI: Task 12.
- Public deployment/submission readiness: Tasks 14–15.

### Placeholder scan

No implementation task depends on a `TBD`, `TODO`, or unspecified interface. Actor IDs, core type signatures, commands, test invariants, and browser gates are defined above.

### Type consistency

- `EnvironmentId`, `SceneEvent`, `SceneScript`, and `SceneFinalizer` are defined once in Task 1.
- `buildSceneScript(environment, tier, visualSeed)` is the single presentation builder used from Task 3 onward.
- `EnvironmentStage` consumes `SceneScript`; `App.tsx` owns settlement and round environment.
- Audio consumes the same `EnvironmentId + SceneEvent` model and cannot influence scene or economics.
