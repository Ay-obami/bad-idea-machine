# Bad Idea Machine — Dual Environment Scene Rebuild Specification

Date: 2026-09-16
Status: Approved design addendum
Target: Chain Jam Vol. 1
Supersedes: visual presentation and outcome-to-animation assumptions in Sections 9–11 of `2026-09-15-bad-idea-machine-design.md`

## 1. Product Direction

Bad Idea Machine must stop presenting the catastrophe as a board of cards/stations. The primary play surface becomes a full illustrated environment in which physical objects move through space, collide, ignite, fall, ricochet, and trigger other objects.

Players choose one of two cosmetic environments before a round:

- **Kitchen Meltdown** — absurd domestic/appliance chaos with fire, steam, ceramics, pans, cabinets, toaster projectiles, a cat, rockets, and a falling safe.
- **Garage Mayhem** — heavier industrial chaos with tools, tires, chains, shelves, sparks, motors, rockets, a tank, and a falling safe.

Environment choice is cosmetic only. It must never change RTP, payout tier probabilities, wager limits, settlement, contract state, or VRF usage.

## 2. Non-Negotiable Economic Boundary

The following remain unchanged from the approved design:

- exactly 96.00% theoretical RTP for Controlled, Send It, and Absolutely Not;
- the existing Solidity contract and Chain SDK settlement flow;
- domain separation between payout randomness and visual randomness;
- the authoritative payout is settled before the visual reveal;
- the host outcome is revealed only after presentation completes;
- SDK-reported cancellation/refund/error states must never be presented as gambling losses.

No scene component may import wager math or derive an economic outcome.

## 3. Player Loop

1. Choose wager.
2. Choose risk mode.
3. Choose chaos environment: Kitchen Meltdown or Garage Mayhem.
4. Press **DO NOT PRESS**.
5. Chain settlement determines the immutable outcome.
6. The selected environment plays a 4.7–6.2 second deterministic catastrophe generated from the cosmetic visual seed.
7. The result card appears only after the catastrophe finishes.
8. **WHAT WENT WRONG?** remains available with fairness/session details.
9. The player can immediately replay or switch environments.

Environment controls lock during an active round. The environment used for a round is stored on the round object so switching after settlement cannot change the running reveal.

## 4. Presentation Ambiguity Rule

The previous idea that higher payouts visibly travel farther through the machine is retired.

The visual reveal must not encode payout tier in early route length, actor count, scene depth, or obvious survival progress. For a fixed visual seed and environment, tiers 0–4 should produce the same early choreography. Tier may influence only the terminal result/finalizer after the shared catastrophe has already obscured the outcome.

A failure may reach the Bad Idea Core. A huge win may appear to be failing midway. The player should not be able to infer the multiplier before the final reveal from how many objects have activated.

## 5. Visual Style

Art direction remains **1950s industrial safety manual + mad scientist laboratory + polished 2D cartoon**, but expressed as a room rather than a control dashboard.

Requirements:

- full-scene composition rather than card grid;
- illustrated SVG/CSS actors and props, not emoji;
- physical-looking trajectories across meaningful screen distance;
- foreground, midground, and background depth;
- impacts produce scene reactions, not just glow/shake on one object;
- at least one unmistakable large-motion beat per round;
- at least one visible fire/blast beat and one debris/smoke beat per round;
- no photorealistic generated art, no generic neon/Web3 dashboard styling, no heavy 3D engine.

## 6. Scene Coordinate System

Both environments use a normalized logical stage of `1000 x 600` units. Actor positions, paths, impact points, and VFX origins are expressed in logical stage coordinates and scaled responsively into the rendered viewport.

The scene engine owns conversion between logical coordinates and CSS transforms. Animation data must not depend on current pixel viewport dimensions.

Desktop target: landscape stage with controls beside it.
Mobile target: the same logical stage letterboxed/scaled above compact controls, preserving actor paths and collision composition.

## 7. Shared Scene Engine

The scene engine is data-driven and environment-agnostic.

### EnvironmentId

```ts
export type EnvironmentId = 'kitchen' | 'garage';
```

### ScenePoint

```ts
export type ScenePoint = Readonly<{ x: number; y: number }>;
```

### SceneActorDefinition

```ts
export type SceneActorDefinition = Readonly<{
  id: string;
  kind: string;
  home: ScenePoint;
  rotation: number;
  scale: number;
  zIndex: number;
  ariaLabel: string;
}>;
```

### MotionKeyframe

```ts
export type MotionKeyframe = Readonly<{
  at: number; // 0..1
  x: number;
  y: number;
  rotation: number;
  scale?: number;
}>;
```

### SceneEvent

```ts
export type SceneEvent = Readonly<{
  id: string;
  actorId: string;
  action: 'launch' | 'drop' | 'swing' | 'roll' | 'ricochet' | 'ignite' | 'explode' | 'collapse' | 'vent' | 'shatter' | 'near-miss';
  startMs: number;
  durationMs: number;
  path: readonly MotionKeyframe[];
  impact?: ScenePoint;
  hazard: 'sparks' | 'fire' | 'smoke' | 'debris' | 'blast' | 'alarm' | 'steam' | 'shards';
  intensity: 1 | 2 | 3;
  decoy: boolean;
  effectSeed: number;
  soundCue: string;
}>;
```

### SceneScript

```ts
export type SceneScript = Readonly<{
  environment: EnvironmentId;
  durationMs: number;
  events: readonly SceneEvent[];
  finalizer: SceneFinalizer;
}>;
```

The engine renders actor motion from these structures; route generation never mutates the DOM directly.

## 8. Kitchen Meltdown Environment

The kitchen is a cluttered cartoon kitchen/lab hybrid.

### Static zones

- left counter: toaster, kettle, knife block, cutting board;
- center counter: pan, bowls, unstable switch, cat route;
- stove/fire zone: burners, grease pan, hood/microwave;
- upper storage: cabinets, mugs, plates, absurd bowling-ball storage;
- right utility zone: sink, fridge, rocket crate, safe impact area.

### Required actors

- toaster
- toast projectile
- cat
- frying pan
- kettle
- cabinet door
- plate/shard source
- fan/vent
- bowling ball
- rocket
- safe
- Bad Idea Core indicator

### Required catastrophe vocabulary

- toaster launches across/through the scene;
- toast can ricochet into another actor;
- cat traverses a visible path rather than only vibrating in place;
- pan swings or flies;
- cabinet opens violently and ejects props;
- steam and grease-fire beats;
- rocket crosses a large percentage of scene width;
- bowling ball rolls/drops through the room;
- safe falls through the upper scene and impacts furniture/counter;
- finalizer may briefly create suspicious calm before result reveal.

### Sound palette

Toaster pop, appliance hum, microwave buzz, pan clang, cabinet slam, ceramic shatter, kettle/steam hiss, grease flare, cat reaction, rolling ball, rocket blast, heavy safe impact.

## 9. Garage Mayhem Environment

The garage is a cluttered industrial workshop.

### Static zones

- workbench: hammer, drill, wrench, saw, toolbox;
- pegboard/tool wall: hanging tools, chain, extension cable;
- center floor: tire route, bowling/heavy-object route, fan, oil/spark zone;
- rack/shelf: crates, rocket tube, tank, spare parts;
- heavy-impact zone: metal cabinet, vice bench, safe landing area.

### Required actors

- hammer
- wrench
- drill
- circular saw or spinning tool
- chain
- fan
- tire
- bowling ball/heavy ball
- rocket
- pressure/propane-style tank
- toolbox
- collapsing shelf
- safe
- Bad Idea Core indicator

### Required catastrophe vocabulary

- hammer swings through visible space;
- wrench/tool ricochets;
- drill or motor can spin off the bench;
- tire rolls/bounces across the floor;
- chain snaps and crosses the frame;
- shelf visibly collapses;
- tank vents/hisses as a decoy without implying payout;
- rocket crosses the workshop;
- safe destroys or deforms the impact zone;
- sparks, metal debris, and smoke dominate the sound/visual palette.

### Sound palette

Hammer clang, wrench ricochet, drill/motor whine, chain snap, metal shelf collapse, tire thumps, fan motor, tank hiss, rocket blast, toolbox spill, heavy safe impact.

## 10. Environment Selection

The controls expose a two-option segmented selector:

- **Kitchen Meltdown**
- **Garage Mayhem**

The selection persists locally as a cosmetic preference only. It is not sent to the contract and is not included in `gameData`.

During a round:

- the selector is locked;
- the `Round` object stores the chosen `EnvironmentId`;
- recovered Chain rounds use the locally selected environment if no round-specific selection survived refresh, because environment has no economic meaning;
- changing the selector after a result affects only the next round.

## 11. Scene Script Generation

`visualSeed` is the sole random input to visual scripting. The selected environment chooses which actor/path library is used.

The builder signature is:

```ts
export function buildSceneScript(
  environment: EnvironmentId,
  tier: OutcomeTier,
  visualSeed: Hex,
): SceneScript;
```

The tier is accepted only for the terminal finalizer. Shared catastrophe event count, early actor order, major hazard coverage, and total reveal duration are derived from `visualSeed + environment`, not from tier.

Every generated script must satisfy:

- duration between 4,700 and 6,200 ms;
- 8–12 events;
- at least 4 distinct moving actors;
- at least one event traverses >= 35% of stage width or >= 30% of stage height;
- contains fire or blast;
- contains debris, smoke, steam, or shards;
- contains at least one decoy event;
- terminal result begins only after the final event;
- identical `environment + visualSeed` yields deterministic shared events for all payout tiers.

Kitchen and Garage scripts must not be mere color reskins: they use different actors, route templates, impact zones, hazard mixes, and sound cues.

## 12. Motion and Animation

Scene actors use CSS transforms driven by declarative keyframes generated from `SceneEvent.path`. No physics library is required for the jam build.

The scene renderer may use CSS custom properties or Web Animations API, but the authoritative timeline is JavaScript data so tests can inspect it.

Requirements:

- moving objects travel between actual scene coordinates;
- an actor may leave its home position and return/reset after round completion;
- simultaneous decoy events are allowed;
- camera shake is driven by impact intensity, not by every event;
- background props can react through small local animations, but primary action comes from actor movement;
- result/reset must restore a clean deterministic scene state without page reload.

## 13. VFX

The shared VFX layer supports:

- sparks
- embers
- smoke plumes
- fire tongues/bursts
- steam
- debris chunks
- ceramic/glass-style shards
- dust
- flash/shockwave rings

VFX spawn around scene impact coordinates rather than arbitrary global positions. Effect particles are deterministic from `effectSeed` so screenshots/tests are reproducible.

## 14. Audio

The existing procedural Web Audio approach remains acceptable and is extended into environment-specific cue plans. No large audio bundle is required.

Audio requirements:

- environment ambient bed at low gain;
- per-event cue keyed by `soundCue`;
- intensity controls number/gain of impact/noise layers;
- kitchen and garage have materially different timbres;
- mute preference remains persistent;
- autoplay restrictions are handled by priming audio on user interaction;
- result sting remains separate from catastrophe sounds.

## 15. Result and Fairness UI

The result card overlays the environment only after the scene script is complete. It must not hide most of the scene before that point.

`FairnessReceipt` remains the source of session/request/randomness verification details. Its visual-route field should become a compact catastrophe summary such as actor/action labels rather than the obsolete station progression.

The environment used for the round is shown in the receipt as cosmetic metadata.

## 16. Responsive Requirements

Desktop:

- environment receives roughly 70–80% of visual attention;
- controls remain compact and adjacent;
- action is composed inside the scene, not under the control panel.

Mobile:

- scene appears above controls;
- logical stage scales without changing routes;
- environment selector remains reachable before launch;
- during reveal, scene receives most of the viewport height;
- no important actor, result card, or fire/blast finalizer is clipped at 390px wide.

## 17. Performance Requirements

- no 3D engine;
- prefer inline SVG/CSS actor components and small generated shapes;
- avoid large sprite sheets;
- lazy-load only environment assets that are genuinely heavy;
- production bundle audit remains in CI;
- animation should use transforms/opacity where possible;
- no per-frame React state loop; state advances at event boundaries and CSS/Web Animations handle interpolation.

## 18. Testing Requirements

Unit tests must verify:

- environment selection is cosmetic and never changes payout calculations;
- scene script determinism;
- tier ambiguity for shared early events;
- duration/event-count/hazard coverage constraints;
- both environments use distinct actor sets;
- every script contains meaningful screen-traversing movement;
- audio plans differ by environment and scale with intensity.

Browser smoke tests must verify on Chromium:

- Kitchen and Garage can each render idle;
- environment selector switches the scene before a round;
- active actor actually changes transform/position during reveal;
- visible fire/blast exists during a reveal;
- at least one decoy/background event occurs;
- result waits until scene completion;
- desktop and 390px mobile screenshots render without clipping;
- no console errors.

The existing contract/manifest/build/105-round real local-VRF gates remain mandatory and unchanged.

## 19. Migration Rule

`MachineStage.tsx` and the station-card CSS are transitional code. The rebuild must replace them with the new environment scene components rather than layering more effects on top of the card system.

`route.ts` may temporarily coexist while migration tests are introduced, but the final build should use `scene-script.ts` for presentation. Obsolete station-specific CSS and code should be removed once both environments and browser gates pass.

## 20. Definition of Done

The rebuild is done when:

1. a first-time player sees an actual kitchen or garage environment, not a board of cards;
2. selecting the environment materially changes actors, sound, and choreography;
3. toasters, hammers, rockets, balls, tires, safe, etc. visibly travel through the scene;
4. fire, smoke, debris, and impacts happen at meaningful scene locations;
5. early reveal choreography does not reveal payout tier;
6. all economic/VRF tests still pass unchanged;
7. both desktop and mobile browser smoke gates pass;
8. production build can replace the current Vercel deployment without changing the Chain contract or manifest integration shape.