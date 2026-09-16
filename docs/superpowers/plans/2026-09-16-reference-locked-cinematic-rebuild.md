# Bad Idea Machine Reference-Locked Cinematic Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Bad Idea Machine into a reference-locked gallery homepage plus immersive Kitchen/Garage gameplay with room-native object motion, physically sourced VFX/audio, and five separately authored aftermaths per environment while preserving the existing Chain settlement/economic engine.

**Architecture:** Keep `App.tsx` as the owner of Chain host state, wager/risk state, settlement, recovered rounds, and the selected environment, but split presentation into a gallery surface and a play surface. Replace the one-photo-plus-CSS-damage model with environment art manifests, room-native object assets, impact-driven choreography, and an aftermath controller that swaps to a tier-specific authored room plate only after the reveal completes. Keep payout randomness and visual randomness separated exactly as they are today.

**Tech Stack:** React 19.2, TypeScript 5.9, Vite 7.3, Vitest 3.2, Web Animations API, Web Audio API, Chain Casino SDK, Playwright 1.55 in CI visual smoke.

**Spec:** `docs/superpowers/specs/2026-09-16-reference-locked-cinematic-rebuild.md`

## Global Constraints

- The supplied reference image is the primary visual authority; it is not loose inspiration.
- No generic Web3 dashboard styling, neon casino redesign, soft SaaS-card styling, toy-like sticker actors, or extra hero section.
- Gallery desktop rows contain exactly six states: `BEFORE`, `0.00×`, `1.20×`, `3.00×`, `10.00×`, `100.00×`.
- Kitchen and Garage each require one clean master plus five independently authored aftermath masters.
- Higher tiers must not be simulated primarily through additional CSS smoke, glow, scorch, or particles.
- Every persistent visual effect must have a physical source event.
- Interactive objects must begin at believable room-native origins and leave consequences represented in the final aftermath.
- The first approximately 60–70% of choreography remains substantially shared for a fixed environment/visual seed; tier divergence belongs primarily in the terminal sequence.
- Environment choice remains cosmetic only and must not alter RTP, tier probability, payout, wager limits, settlement, contract state, or payout randomness.
- Preserve the approved 96.00% theoretical RTP and current payout tables.
- Settlement remains authoritative and completes before visual reveal.
- Cancellation/refund/error states must never be presented as gambling losses.
- The final economic result is revealed only after catastrophe presentation completes.
- Mobile preserves the same art direction and core choreography; secondary VFX may be reduced for performance, hero events may not.
- The supplied reference image and the approved spec take precedence over developer convenience.

---

## File Structure Locked by This Plan

New focused modules:

```text
src/
├── gallery/
│   ├── GalleryScreen.tsx
│   ├── EnvironmentRow.tsx
│   ├── OutcomePreviewCard.tsx
│   ├── gallery-data.ts
│   └── gallery-data.test.ts
├── play/
│   ├── GameScreen.tsx
│   ├── RoomStage.tsx
│   ├── RoomObject.tsx
│   ├── AftermathController.tsx
│   └── ResultOverlay.tsx
├── environments/
│   ├── types.ts
│   ├── index.ts
│   ├── manifests.test.ts
│   ├── kitchen/manifest.ts
│   └── garage/manifest.ts
├── audio/
│   ├── audio-manifest.ts
│   ├── audio-sequence.ts
│   ├── audio-sequence.test.ts
│   └── engine.ts
├── scene/
│   ├── impact.ts
│   ├── impact.test.ts
│   ├── scene-script.ts
│   ├── scene-script.test.ts
│   └── types.ts
└── styles/
    ├── reference-gallery.css
    ├── reference-play.css
    └── reference-room.css
```

Asset structure:

```text
public/rooms/
├── kitchen/
│   ├── gallery/{before,0x,1_2x,3x,10x,100x}.webp
│   ├── stage/clean.webp
│   ├── aftermath/{0x,1_2x,3x,10x,100x}.webp
│   └── objects/{pan,toaster,toast,kettle,cabinet-right,plates,ball,rocket,safe}.webp
└── garage/
    ├── gallery/{before,0x,1_2x,3x,10x,100x}.webp
    ├── stage/clean.webp
    ├── aftermath/{0x,1_2x,3x,10x,100x}.webp
    └── objects/{hammer,wrench,drill,saw,chain,tire,toolbox,shelf,tank,rocket,safe}.webp

public/audio/
├── kitchen/
├── garage/
├── impacts/
└── results/
```

Legacy files are retained only until replacement behavior is verified, then removed in Task 11.

---

### Task 1: Lock the environment-art manifest contract

**Files:**
- Create: `sdk/casino-sdk/examples/bad-idea-machine/src/environments/types.ts`
- Create: `sdk/casino-sdk/examples/bad-idea-machine/src/environments/kitchen/manifest.ts`
- Create: `sdk/casino-sdk/examples/bad-idea-machine/src/environments/garage/manifest.ts`
- Create: `sdk/casino-sdk/examples/bad-idea-machine/src/environments/index.ts`
- Create: `sdk/casino-sdk/examples/bad-idea-machine/src/environments/manifests.test.ts`

**Interfaces:**
- Consumes: existing `EnvironmentId` and `ScenePoint` from `src/scene/types.ts`.
- Produces: `AftermathKey`, `RoomObjectAsset`, `EnvironmentArtManifest`, `getEnvironmentArt(environment)`.

- [ ] **Step 1: Write the failing manifest tests**

```ts
import { describe, expect, it } from 'vitest';
import { getEnvironmentArt } from './index';

const expectedAftermathKeys = ['failure', 'minor', 'moderate', 'severe', 'legendary'] as const;

for (const environment of ['kitchen', 'garage'] as const) {
  describe(`${environment} art manifest`, () => {
    it('has one clean plate, six gallery states, and five distinct aftermath plates', () => {
      const art = getEnvironmentArt(environment);
      expect(art.cleanPlate).toMatch(/^\/rooms\//);
      expect(Object.keys(art.gallery)).toEqual(['before', ...expectedAftermathKeys]);
      expect(Object.keys(art.aftermaths)).toEqual([...expectedAftermathKeys]);
      expect(new Set(Object.values(art.aftermaths)).size).toBe(5);
    });

    it('gives every interactive object a physical origin and pivot', () => {
      const art = getEnvironmentArt(environment);
      for (const object of art.objects) {
        expect(object.originZone.length).toBeGreaterThan(0);
        expect(object.home.x).toBeGreaterThanOrEqual(0);
        expect(object.home.x).toBeLessThanOrEqual(1000);
        expect(object.home.y).toBeGreaterThanOrEqual(0);
        expect(object.home.y).toBeLessThanOrEqual(600);
        expect(object.pivot.x).toBeGreaterThanOrEqual(0);
        expect(object.pivot.y).toBeGreaterThanOrEqual(0);
      }
    });
  });
}
```

- [ ] **Step 2: Run the new tests and verify they fail**

Run from `sdk/casino-sdk/examples/bad-idea-machine`:

```bash
npm test -- src/environments/manifests.test.ts
```

Expected: FAIL because `./index` and the manifest modules do not exist.

- [ ] **Step 3: Implement the manifest types**

```ts
import type { EnvironmentId, ScenePoint } from '../scene/types';

export type AftermathKey = 'failure' | 'minor' | 'moderate' | 'severe' | 'legendary';
export type GalleryStateKey = 'before' | AftermathKey;

export type RoomObjectAsset = Readonly<{
  id: string;
  src: string;
  home: ScenePoint;
  pivot: ScenePoint;
  originZone: string;
  zIndex: number;
  widthPct: number;
}>;

export type EnvironmentArtManifest = Readonly<{
  id: EnvironmentId;
  label: string;
  quote: string;
  subtitle: string;
  cleanPlate: string;
  gallery: Readonly<Record<GalleryStateKey, string>>;
  aftermaths: Readonly<Record<AftermathKey, string>>;
  objects: readonly RoomObjectAsset[];
}>;
```

- [ ] **Step 4: Add Kitchen and Garage manifests with exact asset paths**

Use these exact gallery/aftermath mappings:

```ts
gallery: {
  before: '/rooms/kitchen/gallery/before.webp',
  failure: '/rooms/kitchen/gallery/0x.webp',
  minor: '/rooms/kitchen/gallery/1_2x.webp',
  moderate: '/rooms/kitchen/gallery/3x.webp',
  severe: '/rooms/kitchen/gallery/10x.webp',
  legendary: '/rooms/kitchen/gallery/100x.webp',
},
aftermaths: {
  failure: '/rooms/kitchen/aftermath/0x.webp',
  minor: '/rooms/kitchen/aftermath/1_2x.webp',
  moderate: '/rooms/kitchen/aftermath/3x.webp',
  severe: '/rooms/kitchen/aftermath/10x.webp',
  legendary: '/rooms/kitchen/aftermath/100x.webp',
},
```

Mirror the paths under `/rooms/garage/` for Garage. Define the object IDs exactly as listed in the locked file structure so scene scripts and art manifests share stable IDs.

- [ ] **Step 5: Export the lookup and make the tests pass**

```ts
import type { EnvironmentId } from '../scene/types';
import { kitchenArt } from './kitchen/manifest';
import { garageArt } from './garage/manifest';

export function getEnvironmentArt(environment: EnvironmentId) {
  return environment === 'kitchen' ? kitchenArt : garageArt;
}
```

Run:

```bash
npm test -- src/environments/manifests.test.ts
npm run check-types
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/environments
git commit -m "feat: define reference-locked room art manifests"
```

---

### Task 2: Produce and validate the locked room-art package

**Files:**
- Create all paths under `public/rooms/kitchen/**` and `public/rooms/garage/**` defined above.
- Create: `sdk/casino-sdk/examples/bad-idea-machine/scripts/verify-room-assets.mjs`
- Modify: `sdk/casino-sdk/examples/bad-idea-machine/package.json`

**Interfaces:**
- Consumes: the exact asset paths from Task 1 and the approved reference screenshot/art spec.
- Produces: every referenced room and object asset plus `npm run verify-room-assets`.

- [ ] **Step 1: Create the asset verifier before generating art**

```js
import { access, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const required = [
  ...['kitchen', 'garage'].flatMap(room => [
    ...['before', '0x', '1_2x', '3x', '10x', '100x'].map(name => `public/rooms/${room}/gallery/${name}.webp`),
    `public/rooms/${room}/stage/clean.webp`,
    ...['0x', '1_2x', '3x', '10x', '100x'].map(name => `public/rooms/${room}/aftermath/${name}.webp`),
  ]),
  ...['pan','toaster','toast','kettle','cabinet-right','plates','ball','rocket','safe'].map(name => `public/rooms/kitchen/objects/${name}.webp`),
  ...['hammer','wrench','drill','saw','chain','tire','toolbox','shelf','tank','rocket','safe'].map(name => `public/rooms/garage/objects/${name}.webp`),
];

for (const relative of required) {
  const path = resolve(relative);
  await access(path);
  const info = await stat(path);
  if (info.size < 8_000) throw new Error(`${relative} is suspiciously small (${info.size} bytes)`);
}
console.log(`Verified ${required.length} room assets.`);
```

Add to `package.json`:

```json
"verify-room-assets": "node scripts/verify-room-assets.mjs"
```

- [ ] **Step 2: Run the verifier and confirm it fails before assets exist**

```bash
npm run verify-room-assets
```

Expected: FAIL on the first missing `/public/rooms/...` asset.

- [ ] **Step 3: Generate the two clean masters first, using the supplied reference as the visual anchor**

Use the reference image as an image-edit/generation reference and preserve its camera language. Generate Kitchen first, approve it visually, then derive all Kitchen damage states from that exact master; repeat for Garage. Use this exact art direction in the generation request:

```text
Create a high-detail cinematic room plate for Bad Idea Machine that matches the supplied reference image's premium dark-game art direction. Preserve a fixed wide camera, realistic perspective, warm practical lighting, grounded materials, and believable room geometry. The room must look like a real environment prepared for physical slapstick destruction, not a neon casino, not a Web3 dashboard, not a cartoon sticker scene. Keep major architecture and camera framing stable because five future aftermath states will be derived from this exact master.
```

Kitchen must visibly include a stove/range, hood, upper cabinets, countertop, toaster, kettle, dishes, refrigerator, central work area, and credible absurd storage zones for a rocket and heavy falling object. Garage must visibly include a workbench, pegboard/tools, drill/saw, toolbox, shelving, tire, chain, tank, metal cabinet, open floor path, rocket storage, and heavy-object impact zone.

- [ ] **Step 4: Derive five aftermath masters from each approved clean master, never as independent rooms**

For each environment, use the exact tier damage brief from Spec §7. The generation/edit request must include:

```text
Edit this exact room master. Do not change camera position, lens, room proportions, lighting direction, or core furniture identity. Apply only the specified physical consequences. The result must look like the same room after the event, with structural/object changes baked into the artwork. Do not simulate severity mainly with extra smoke, color grading, glow, or particles.
```

Produce `0x`, `1_2x`, `3x`, `10x`, `100x` full-resolution aftermath files. Gallery images are crops/optimized derivatives of these same approved states, not separately invented scenes.

- [ ] **Step 5: Extract room-native interactive objects from the clean masters**

For every object path in Task 1, create a transparent WebP whose perspective, material, light direction, and resting pose match the clean room. Where an object is extracted, the stage clean plate must be retouched so that object is absent from the plate and can be placed back at its `home` position without duplication.

- [ ] **Step 6: Run validation and stop for visual approval before continuing**

```bash
npm run verify-room-assets
```

Expected: `Verified 44 room assets.`

Then compare the 12 gallery states side-by-side against the approved reference. Do not proceed if camera geometry drifts, the cards look like unrelated rooms, 100× is merely 10× plus smoke, or room-native object sprites look pasted-on.

- [ ] **Step 7: Commit**

```bash
git add public/rooms scripts/verify-room-assets.mjs package.json
git commit -m "art: add authored kitchen and garage room states"
```

---

### Task 3: Build the reference-locked gallery as the actual landing page

**Files:**
- Create: `src/gallery/gallery-data.ts`
- Create: `src/gallery/gallery-data.test.ts`
- Create: `src/gallery/OutcomePreviewCard.tsx`
- Create: `src/gallery/EnvironmentRow.tsx`
- Create: `src/gallery/GalleryScreen.tsx`
- Create: `src/styles/reference-gallery.css`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `getEnvironmentArt()` and `EnvironmentId`.
- Produces: `GalleryScreen({ onChoose(environment) })` and `AppView = 'gallery' | 'play'` behavior.

- [ ] **Step 1: Write data tests that lock the six-card order and reference copy**

```ts
import { describe, expect, it } from 'vitest';
import { galleryRows } from './gallery-data';

it('locks reference gallery ordering and multiplier labels', () => {
  for (const row of galleryRows) {
    expect(row.cards.map(card => card.multiplier)).toEqual(['BEFORE', '0.00×', '1.20×', '3.00×', '10.00×', '100.00×']);
  }
});

it('locks the approved editorial quotes', () => {
  expect(galleryRows.find(row => row.environment === 'kitchen')?.quote).toBe('Same kitchen. Different levels of regret.');
  expect(galleryRows.find(row => row.environment === 'garage')?.quote).toBe('Same garage. Bigger problems.');
});
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- src/gallery/gallery-data.test.ts
```

Expected: FAIL because `gallery-data.ts` does not exist.

- [ ] **Step 3: Implement gallery data from environment manifests**

Use five aftermath keys in this exact order:

```ts
const cards = [
  ['before', 'BEFORE'],
  ['failure', '0.00×'],
  ['minor', '1.20×'],
  ['moderate', '3.00×'],
  ['severe', '10.00×'],
  ['legendary', '100.00×'],
] as const;
```

Use short copy from the approved design; do not invent additional sections or marketing panels.

- [ ] **Step 4: Implement the gallery components**

`GalleryScreen` must render exactly two environment rows and one footer CTA. `OutcomePreviewCard` must render the authored image directly with `<img src={card.image}>`; it must not derive visual damage via CSS classes.

```tsx
export function OutcomePreviewCard({ card }: { card: GalleryCard }) {
  return (
    <article className={`gallery-card gallery-card--${card.key}`} data-gallery-state={card.key}>
      <img src={card.image} alt="" className="gallery-card__image" />
      <div className="gallery-card__body">
        <strong className="gallery-card__multiplier">{card.multiplier}</strong>
        <h3>{card.title}</h3>
        <p>{card.copy}</p>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Make gallery the initial `App` view without breaking recovered rounds**

Add:

```ts
type AppView = 'gallery' | 'play';
const [view, setView] = useState<AppView>('gallery');
```

`onChoose(environment)` sets the environment and then `setView('play')`. When a pending host round is recovered or any round becomes active, force `setView('play')` so an in-flight economic state is never hidden behind the gallery.

- [ ] **Step 6: Implement reference-locked desktop/mobile CSS**

Desktop: six narrow cards per row, dark shell, thin cool borders, warm-white type, localized tier colors, wide yellow CTA. Mobile: horizontal snap-scrolling card rails; do not squeeze six cards into a tiny grid.

- [ ] **Step 7: Run checks and commit**

```bash
npm test -- src/gallery/gallery-data.test.ts
npm run check-types
npm run build
git add src/gallery src/styles/reference-gallery.css src/App.tsx src/styles.css
git commit -m "feat: make reference gallery the landing experience"
```

---

### Task 4: Split the immersive play surface from `App.tsx`

**Files:**
- Create: `src/play/GameScreen.tsx`
- Create: `src/styles/reference-play.css`
- Modify: `src/App.tsx`
- Modify: `src/components/ControlPanel.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: existing round state, control props, `EnvironmentPhase`, fairness receipt, mute state.
- Produces: `GameScreen` as pure presentation; `App.tsx` remains economic/orchestration owner.

- [ ] **Step 1: Add a focused rendering test around view transitions using a pure helper**

Create in `App.tsx` or a small co-located helper:

```ts
export function visibleView(requested: 'gallery' | 'play', roundInFlight: boolean) {
  return roundInFlight ? 'play' : requested;
}
```

Test that `visibleView('gallery', true) === 'play'` and `visibleView('gallery', false) === 'gallery'`.

- [ ] **Step 2: Move current game-shell JSX into `GameScreen` without changing settlement callbacks**

`GameScreen` receives all values and callbacks explicitly. It must not import `useCasinoHost`, payout math, or settlement helpers.

- [ ] **Step 3: Keep controls compact and subordinate to the room**

Desktop CSS target: room gets 75–80% of visual emphasis; controls remain a compact rail. Keep `DO NOT PRESS` as the primary launch copy. Keep `WHAT WENT WRONG?` available after settlement.

- [ ] **Step 4: Add Back-to-gallery behavior only when no round is in flight**

During active rounds, hide/disable gallery navigation. After result, Back to Gallery clears presentation state only; it must not mutate settled economics.

- [ ] **Step 5: Run checks and commit**

```bash
npm test
npm run check-types
npm run build
git add src/play/GameScreen.tsx src/styles/reference-play.css src/App.tsx src/components/ControlPanel.tsx src/styles.css
git commit -m "refactor: separate gallery and immersive play surfaces"
```

---

### Task 5: Replace generic SVG actors with room-native objects and transform-based motion

**Files:**
- Create: `src/play/RoomObject.tsx`
- Create: `src/play/RoomStage.tsx`
- Create: `src/styles/reference-room.css`
- Modify: `src/components/EnvironmentStage.tsx`
- Modify: `src/scene/types.ts`
- Modify: `src/scene/environments.ts`

**Interfaces:**
- Consumes: `EnvironmentArtManifest.objects`, existing `SceneEvent.path`, normalized 1000×600 coordinates.
- Produces: room-native object rendering using asset sprites and stable data attributes for visual tests.

- [ ] **Step 1: Extend actor definitions with art-manifest IDs rather than visual kinds**

Add an `assetId` and keep existing actor IDs stable where possible:

```ts
export type SceneActorDefinition = Readonly<{
  id: string;
  assetId: string;
  home: ScenePoint;
  rotation: number;
  scale: number;
  zIndex: number;
  ariaLabel: string;
}>;
```

- [ ] **Step 2: Write a test that every scripted actor resolves to an environment object asset**

For each environment definition, assert `getEnvironmentArt(environment).objects.some(object => object.id === actor.assetId)`.

- [ ] **Step 3: Implement `RoomObject` with `translate3d` motion and origin-aware pivot**

Build keyframes from normalized coordinates into transforms rather than animating `left/top` continuously:

```ts
const frames = event.path.map(frame => ({
  offset: frame.at,
  transform: `translate3d(${frame.x / 10}%, ${frame.y / 6}%, 0) translate(-50%, -50%) rotate(${frame.rotation}deg) scale(${frame.scale ?? actor.scale})`,
}));
```

Set `transformOrigin` from the manifest pivot for hinged/swinging actors.

- [ ] **Step 4: Render the clean room plate plus room-native object layers**

`RoomStage` renders `art.cleanPlate` as the room background and places each room-native sprite at its rest transform. Do not render `ActorArtwork.tsx` in production paths.

- [ ] **Step 5: Verify the six hero actors per room visibly move from physical origins**

Kitchen minimum: pan, toaster/toast, cabinet-right, plates, rocket, safe. Garage minimum: hammer/wrench, tire, chain, shelf, rocket, safe.

- [ ] **Step 6: Run tests/checks and commit**

```bash
npm test -- src/environments/manifests.test.ts src/scene/scene-script.test.ts
npm run check-types
npm run build
git add src/play/RoomObject.tsx src/play/RoomStage.tsx src/styles/reference-room.css src/components/EnvironmentStage.tsx src/scene/types.ts src/scene/environments.ts
git commit -m "feat: animate room-native objects from physical origins"
```

---

### Task 6: Make impacts the single source of VFX, sound timing, and persistent consequences

**Files:**
- Create: `src/scene/impact.ts`
- Create: `src/scene/impact.test.ts`
- Modify: `src/scene/types.ts`
- Modify: `src/scene/scene-script.ts`
- Modify: `src/components/SceneVfx.tsx`

**Interfaces:**
- Produces: `ImpactEvent` with point, materials, strength, effect, `atMs`, and `persistentDamage`.

- [ ] **Step 1: Add the impact type and failing validation tests**

```ts
export type Material = 'metal' | 'wood' | 'ceramic' | 'glass' | 'masonry' | 'appliance';
export type ImpactEffect = 'spark' | 'shatter' | 'fire' | 'dust' | 'debris' | 'blast';
export type ImpactEvent = Readonly<{
  atMs: number;
  point: ScenePoint;
  materialA: Material;
  materialB: Material;
  strength: 1 | 2 | 3 | 4;
  effect: ImpactEffect;
  persistentDamage: readonly string[];
}>;
```

Test that all `fire`, `spark`, `shatter`, `debris`, and `blast` VFX emitted by a scene script correspond to an impact event with a valid point.

- [ ] **Step 2: Extend `SceneEvent` with explicit impacts**

```ts
impacts: readonly ImpactEvent[];
```

Remove any VFX decision that is based only on tier/intensity without a spatial source.

- [ ] **Step 3: Update scene-script generation so hero events carry exact impact times and consequences**

Example pattern:

```ts
impacts: [{
  atMs: Math.round(durationMs * 0.82),
  point: { x: 640, y: 230 },
  materialA: 'metal',
  materialB: 'wood',
  strength: 2,
  effect: 'debris',
  persistentDamage: ['upper-cabinet-right-dented'],
}],
```

- [ ] **Step 4: Refactor `SceneVfx` to render only from active impacts**

Use impact coordinates for flame, spark, shard, blast, dust, and debris origins. Keep particle counts bounded; no full-screen random smoke source.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- src/scene/impact.test.ts src/scene/scene-script.test.ts
npm run check-types
git add src/scene/impact.ts src/scene/impact.test.ts src/scene/types.ts src/scene/scene-script.ts src/components/SceneVfx.tsx
git commit -m "feat: drive room consequences from physical impacts"
```

---

### Task 7: Enforce shared early choreography and tier-specific terminal sequences

**Files:**
- Modify: `src/scene/scene-script.ts`
- Modify: `src/scene/scene-script.test.ts`

**Interfaces:**
- Produces: `buildSharedSequence(environment, visualSeed)` and `buildTerminalSequence(environment, tier, visualSeed)` composed by `buildSceneScript`.

- [ ] **Step 1: Add failing anti-telegraphing tests**

For each environment and one fixed visual seed, build all five tiers. Compare events whose `startMs < durationMs * 0.6` and assert the actor/action/start ordering is identical across tiers.

```ts
const prefix = script.events
  .filter(event => event.startMs < script.durationMs * 0.6)
  .map(event => [event.actorId, event.action, event.startMs]);
```

- [ ] **Step 2: Split generation into shared and terminal builders**

```ts
export function buildSceneScript(environment: EnvironmentId, tier: OutcomeTier, visualSeed: Hex): SceneScript {
  const shared = buildSharedSequence(environment, visualSeed);
  const terminal = buildTerminalSequence(environment, tier, visualSeed);
  return finalizeScript(environment, tier, [...shared, ...terminal]);
}
```

- [ ] **Step 3: Lock required hero choreography**

Kitchen shared vocabulary includes toaster/toast, pan, cabinet/dishes, and a sourced fire/steam beat. Garage shared vocabulary includes tool movement, tire, chain, and shelf strain. Rocket/safe/heavy terminal events may vary by tier but must remain plausible and visually substantial even for 0×.

- [ ] **Step 4: Run scene tests and commit**

```bash
npm test -- src/scene/scene-script.test.ts
npm run check-types
git add src/scene/scene-script.ts src/scene/scene-script.test.ts
git commit -m "feat: hide payout tier behind shared catastrophe choreography"
```

---

### Task 8: Replace CSS damage escalation with authored aftermath control

**Files:**
- Create: `src/play/AftermathController.tsx`
- Create: `src/play/ResultOverlay.tsx`
- Modify: `src/play/RoomStage.tsx`
- Modify: `src/components/EnvironmentStage.tsx`
- Modify: `src/scene/visual-state.ts`
- Modify: `src/scene/visual-state.test.ts`

**Interfaces:**
- Consumes: settled `OutcomeTier`, environment manifest, phase, script duration.
- Produces: exact aftermath plate selection and result visibility only after the room has transitioned.

- [ ] **Step 1: Rename/align visual-state semantics with the approved aftermath keys**

Map tiers exactly:

```ts
const AFTERMATHS = ['failure', 'minor', 'moderate', 'severe', 'legendary'] as const;
```

Keep multiplier/payout helpers unchanged.

- [ ] **Step 2: Update tests to assert one distinct authored path per tier**

Resolve each tier through `getEnvironmentArt(environment).aftermaths[aftermathKeyForTier(tier)]` and assert five unique paths per environment.

- [ ] **Step 3: Implement `AftermathController`**

The component must keep the clean/composited room visible during `revealing`. At the terminal obstruction point, preload and reveal the exact aftermath image. Expose `onAftermathVisible()` so the result overlay appears only after the authored plate is visible.

- [ ] **Step 4: Implement a compact `ResultOverlay`**

The overlay shows the actual settled multiplier and flavor copy but leaves most of the aftermath visible. It must not cover the room with a full-screen card.

- [ ] **Step 5: Remove production dependence on `CinematicBackdrop` damage classes**

No tier result may be represented through `.cinematic-backdrop--damage-*` as the authoritative final state.

- [ ] **Step 6: Run checks and commit**

```bash
npm test -- src/scene/visual-state.test.ts
npm run check-types
npm run build
git add src/play/AftermathController.tsx src/play/ResultOverlay.tsx src/play/RoomStage.tsx src/components/EnvironmentStage.tsx src/scene/visual-state.ts src/scene/visual-state.test.ts
git commit -m "feat: reveal authored aftermath plates per settled tier"
```

---

### Task 9: Replace synthesized mayhem with sample-driven, impact-timed audio

**Files:**
- Create: `src/audio/audio-manifest.ts`
- Create: `src/audio/audio-sequence.ts`
- Create: `src/audio/audio-sequence.test.ts`
- Create: `src/audio/engine.ts`
- Modify: `src/lib/audio.ts`
- Modify: `src/scene/types.ts`
- Create sample assets under `public/audio/**`

**Interfaces:**
- Consumes: SceneEvent impacts, environment, visual seed.
- Produces: deterministic `AudioCue[]` scheduled at actual event/impact times.

- [ ] **Step 1: Define audio sequence types and tests**

```ts
export type AudioCue = Readonly<{
  sample: string;
  atMs: number;
  gain: number;
  pan: number;
  playbackRate: number;
}>;
```

Tests must assert: same seed/event => same sample variants; Kitchen/Garage use different families; impact cues occur at the matching `ImpactEvent.atMs`; no cue gain exceeds `1`.

- [ ] **Step 2: Build explicit sound-family manifests**

Kitchen minimum families: toaster pop, pan scrape/clang, cabinet slam, ceramic shatter, steam hiss, grease flare, bowling roll/thump, rocket ignition/flyby/impact, safe impact, debris tail, fire aftermath.

Garage minimum families: wrench/hammer clang, drill motor/spin-down, saw spin, chain tension/snap, tire roll/bounce, toolbox spill, shelf strain/collapse, tank hiss, metal cabinet impact, rocket, safe impact, heavy metal debris, workshop aftermath.

Each family gets at least two variants where repetition would otherwise be obvious.

- [ ] **Step 3: Add licensed/original sample assets and deterministic variant selection**

Store samples only under the approved directories. Normalize files to short browser-friendly `.ogg` or `.mp3` assets. Do not use untracked remote URLs at runtime.

- [ ] **Step 4: Implement `engine.ts` with Web Audio scheduling, gain, panning, and buffer caching**

Keep current mute/prime behavior. Use panning derived from impact `x` coordinate:

```ts
const pan = Math.max(-0.65, Math.min(0.65, (impact.point.x - 500) / 500));
```

- [ ] **Step 5: Keep oscillator/noise synthesis only as a safe fallback**

`src/lib/audio.ts` becomes a compatibility facade over the new engine. Production scene cues should resolve to sample assets first.

- [ ] **Step 6: Add aftermath ambience lifecycle**

Start environment/tier-appropriate ambience only after aftermath becomes visible; stop it on replay, room switch, mute, or gallery return.

- [ ] **Step 7: Run tests and commit**

```bash
npm test -- src/audio/audio-sequence.test.ts src/lib/audio.test.ts
npm run check-types
npm run build
git add src/audio src/lib/audio.ts src/scene/types.ts public/audio
git commit -m "feat: synchronize production foley with physical room impacts"
```

---

### Task 10: Add strict visual-regression and mobile choreography gates

**Files:**
- Create: `sdk/casino-sdk/examples/bad-idea-machine/scripts/visual-regression.mjs`
- Modify: `.github/workflows/visual-smoke.yml`
- Modify: `sdk/casino-sdk/examples/bad-idea-machine/package.json`

**Interfaces:**
- Produces screenshot artifacts and structural visual assertions for gallery, clean rooms, chaos, and aftermaths.

- [ ] **Step 1: Move inline Playwright logic into a reusable script**

Add package script:

```json
"visual-regression": "node scripts/visual-regression.mjs"
```

The script must capture at 1440×900 and 390×844.

- [ ] **Step 2: Assert the gallery contract before any gameplay checks**

Require exactly two environment rows, six cards in each, the exact multiplier sequence, the exact Kitchen/Garage quotes, and the `CHOOSE YOUR CHAOS` CTA. Assert `.station`, old outcome-strip layout, and generic old cinematic-damage cards are absent from the gallery.

- [ ] **Step 3: Capture clean room and hero-action frames**

Capture:

```text
visual-smoke/gallery-desktop.png
visual-smoke/gallery-mobile.png
visual-smoke/kitchen-clean.png
visual-smoke/kitchen-chaos.png
visual-smoke/kitchen-result.png
visual-smoke/garage-clean.png
visual-smoke/garage-chaos.png
visual-smoke/garage-result.png
```

During chaos, verify at least one hero actor crosses >=18px between samples, every active flame/spark/shard/blast has a `data-impact-source`, and no result overlay exists before reveal completion.

- [ ] **Step 4: Validate authored aftermath paths**

For each tier/environment, use deterministic demo hooks or exposed test query params to force the presentation tier without altering economic code; verify the resulting `<img>` source equals the manifest path for that tier. Do not fake payouts in production state—the test hook may select presentation fixtures only when `import.meta.env.DEV`.

- [ ] **Step 5: Preserve mobile composition**

At 390px, assert no primary control escapes viewport and major room-stage actor origins remain within the visible stage safe area. Gallery cards must horizontal-scroll/snap rather than compress into six columns.

- [ ] **Step 6: Update workflow to run the script and upload screenshots**

Keep Node 22 and Playwright 1.55.0. Replace the current embedded Node block with `npm --prefix examples/bad-idea-machine run visual-regression`.

- [ ] **Step 7: Commit**

```bash
git add scripts/visual-regression.mjs package.json ../../../../.github/workflows/visual-smoke.yml
git commit -m "test: lock reference art direction with visual regression"
```

---

### Task 11: Retire conflicting legacy presentation code

**Files:**
- Delete after verifying zero imports:
  - `src/components/CinematicBackdrop.tsx`
  - `src/components/scenes/ActorArtwork.tsx`
  - `src/styles/cinematic-actors.css`
  - obsolete damage-only rules in `src/styles/cinematic-stage.css`
- Potentially delete `src/components/OutcomeStrip.tsx` if the play result no longer uses it.
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: all replacement modules from Tasks 3–10.
- Produces: one coherent visual system with no dormant competing art path.

- [ ] **Step 1: Search for legacy imports/classes and record the expected zero-use list**

```bash
rg "CinematicBackdrop|ActorArtwork|cinematic-backdrop--damage|OutcomeStrip" src
```

Expected before cleanup: only known legacy references.

- [ ] **Step 2: Remove each legacy import/use and then delete the dead file**

Do not remove `OutcomeStrip.tsx` until `rg` confirms it has no production consumer.

- [ ] **Step 3: Remove old CSS imports/rules that can reintroduce smoke-as-damage or SVG-sticker styling**

Keep only generic tokens that are still used by the reference gallery/play system.

- [ ] **Step 4: Verify the old presentation cannot render**

```bash
rg "cinematic-backdrop--damage|actor-art|station" src || true
npm run check-types
npm run build
```

Expected: no production matches for retired art patterns; build passes.

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "chore: remove superseded cinematic presentation system"
```

---

### Task 12: Full economic, build, simulation, visual, and art-direction verification

**Files:**
- Modify only if a verification failure reveals a scoped bug.
- Update: `README.md` and `sdk/casino-sdk/examples/bad-idea-machine/SUBMISSION.md` only after verification passes.

**Interfaces:**
- Consumes: completed rebuild.
- Produces: verified submission-ready mainline with documentation matching the actual experience.

- [ ] **Step 1: Run all Bad Idea Machine unit tests**

```bash
cd sdk/casino-sdk/examples/bad-idea-machine
npm test
```

Expected: all tests pass, including paytable/RTP, manifest, scene, visual-state, audio, and asset tests.

- [ ] **Step 2: Verify TypeScript and production build**

```bash
npm run check-types
npm run verify-room-assets
npm run build
npm run verify-build
```

Expected: all commands succeed.

- [ ] **Step 3: Run deterministic flow simulation**

```bash
npm run simulate
```

Expected: settlement/economic simulations pass without environment affecting outcomes.

- [ ] **Step 4: Run the full SDK-level test/build commands used by the repo**

From `sdk/casino-sdk`:

```bash
npm test
npm run build:bad-idea
```

Expected: SDK and example remain green.

- [ ] **Step 5: Run local Playwright visual regression**

Build/serve the standalone demo, install Playwright 1.55.0 if needed, then:

```bash
npm run visual-regression
```

Review every generated screenshot against the supplied reference and the spec. Reject the build if the gallery drifts, actors read as stickers, effects lack sources, or aftermaths look like one room with escalating overlays.

- [ ] **Step 6: Perform the explicit art-direction acceptance review**

Confirm all 14 completion criteria from Spec §16, especially:

```text
- landing page closely matches the supplied reference
- Kitchen/Garage clean rooms belong to the same visual universe
- major props visibly belong to those rooms
- five aftermaths per environment are separately art-directed
- 0× remains visually satisfying
- 100× is structurally different from 10×
- animation consequences agree with final aftermath art
- mobile preserves the same artistic language
- Chain economics remain unchanged
```

Do not proceed to documentation if any item fails.

- [ ] **Step 7: Update public docs to describe the actual shipped architecture**

README/SUBMISSION wording must state: reference-locked gallery → room selection → immersive catastrophe → authored aftermath; environment is cosmetic only; settlement precedes presentation; room-native physical object movement and synchronized foley are presentation only.

- [ ] **Step 8: Final verification after docs only**

```bash
npm test
npm run check-types
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add README.md sdk/casino-sdk/examples/bad-idea-machine/SUBMISSION.md
git commit -m "docs: document reference-locked cinematic game experience"
```

---

## Plan Self-Review Results

**Spec coverage:** Gallery composition, strict art lock, clean masters, five authored aftermaths per room, room-native actors, physical origins/pivots, impact-sourced VFX, shared early choreography, tier terminal choreography, sample-driven sound, aftermath ambience, mobile layout, performance-safe bounded effects, error/economic separation, legacy retirement, and visual regression are each mapped to explicit tasks.

**Placeholder scan:** No `TBD`, `TODO`, “implement later”, unspecified test requests, or unnamed interfaces remain. Asset production uses the exact approved per-tier briefs from the spec and exact target paths.

**Type consistency:** `EnvironmentArtManifest`, `AftermathKey`, `RoomObjectAsset`, `ImpactEvent`, `AudioCue`, `getEnvironmentArt`, `AftermathController`, and the gallery/play surface boundaries are introduced before downstream tasks consume them.

**Execution rule:** Do not collapse the visual approval checkpoints. In particular, Task 2 room masters/aftermaths and Task 3 gallery must be visually reviewed before deeper choreography work proceeds; the user explicitly requires strict adherence to the approved art direction.
