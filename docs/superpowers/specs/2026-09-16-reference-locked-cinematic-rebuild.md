# Bad Idea Machine — Reference-Locked Cinematic Rebuild Specification

Date: 2026-09-16
Status: Approved design
Target: Chain Jam Vol. 1
Supersedes: presentation-layer assumptions in the current cinematic UI and the prior illustrated-room direction where they conflict with this document

## 1. Product Direction and Art Lock

Bad Idea Machine will use a two-surface experience:

1. **Reference-locked gallery homepage** matching the supplied reference composition as closely as practical.
2. **Immersive room gameplay** entered after the player chooses Kitchen Meltdown or Garage Mayhem.

The supplied reference image is the primary visual authority. It is not loose inspiration. The rebuild must preserve its dark premium shell, BIM branding hierarchy, room-row composition, six-state gallery treatment, expressive multiplier typography, restrained borders, editorial quotes, and yellow primary CTA language.

The following are hard rules:

- no generic Web3 dashboard styling;
- no neon casino redesign;
- no extra hero section that displaces the room gallery;
- no soft SaaS-card visual language;
- no toy-like sticker actors over photography;
- no visual shortcut where higher tiers are represented primarily by additional CSS smoke, glow, scorch, or particles;
- no implementation shortcut may override the approved visual direction merely because it is technically simpler.

**Art-direction precedence rule:** the supplied reference image and this approved specification take precedence over developer convenience. If an implementation shortcut materially changes the approved visual language, the shortcut is rejected.

## 2. Economic and Settlement Boundary

The rebuild is visual, audio, and presentation-oriented. The economic game remains unchanged.

Preserve:

- existing payout tables and multiplier math;
- 96.00% theoretical RTP per approved risk mode;
- wager validation and house-risk checks;
- Chain SDK session lifecycle;
- VRF settlement behavior;
- game-data encoding;
- domain separation between payout randomness and visual randomness;
- authoritative settlement before visual reveal;
- cancellation/refund/error handling as non-loss states;
- fairness receipt and verification flow;
- environment choice as cosmetic only.

Kitchen/Garage selection must never alter RTP, tier probability, payout, wager limit, settlement, contract state, or randomness used for economics.

The room changes. The math does not.

## 3. Player Experience Flow

### 3.1 Gallery homepage

The application opens on the gallery, not directly inside the betting UI.

Desktop hierarchy:

1. BIM header and compact navigation/control area.
2. Kitchen Meltdown section.
3. Six Kitchen cards: BEFORE, 0.00×, 1.20×, 3.00×, 10.00×, 100.00×.
4. Garage Mayhem section.
5. Six Garage cards: BEFORE, 0.00×, 1.20×, 3.00×, 10.00×, 100.00×.
6. Footer with BIM brand treatment and **CHOOSE YOUR CHAOS →** CTA.

The gallery itself is the hero. No separate oversized hero block is added.

On mobile, each environment uses a horizontal snap-scrolling card rail that preserves card proportions and image readability.

### 3.2 Entering gameplay

The player chooses Kitchen or Garage from the gallery and enters the immersive play surface.

The play surface retains the same dark shell and typography system but gives approximately 75–80% of visual emphasis to the room. Controls are compact and secondary.

Core loop:

1. Choose room.
2. Choose wager.
3. Choose risk mode.
4. Press **DO NOT PRESS**.
5. Settlement completes.
6. Deterministic room catastrophe plays.
7. The room resolves into a separately authored aftermath for the settled tier.
8. Result UI appears without obscuring the room.
9. Player may replay or return to the gallery.

During settlement, the room remains visible and the UI may show a restrained state such as **BAD DECISION PENDING…**. No full-screen loading dashboard is introduced.

## 4. Gallery Visual System

### 4.1 Typography

Use three typographic voices only:

- heavy uppercase sans-serif for BIM branding, environment names, outcome names, and primary actions;
- clean sans-serif for UI/body copy, wager, balance, and fairness information;
- expressive handwritten/brush face used sparingly for multiplier values and editorial quotes.

### 4.2 Color system

Core palette:

- near-black / blue-black background;
- warm white primary text;
- muted gray secondary text;
- thin cool blue-gray borders;
- warm yellow/gold primary CTA.

Outcome accents remain localized primarily to multiplier text and small accents:

- 0.00×: pale/neutral;
- 1.20×: vivid green;
- 3.00×: cyan/blue;
- 10.00×: purple/magenta;
- 100.00×: gold/yellow.

Do not spread tier colors across full cards or major backgrounds.

### 4.3 Card structure

Each desktop row has six narrow, image-led cards. Cards use restrained corners, subtle borders, and minimal shadow.

Each card contains:

- authored room image;
- BEFORE or multiplier value;
- outcome title;
- short flavor copy.

Every card references a dedicated authored room state. Gallery cards must not be generated from one room photograph plus runtime damage overlays.

### 4.4 Quotes and footer

Approved editorial quote style:

- Kitchen: **“Same kitchen. Different levels of regret.”**
- Garage: **“Same garage. Bigger problems.”**

Footer CTA:

- **CHOOSE YOUR CHAOS →**
- supporting line: **PRESS THE BUTTON. REGRET IT IN STYLE.**

CTA styling follows the reference: warm yellow/gold, dark text, restrained shadow/glow, wide horizontal proportions, no gradient pill treatment.

## 5. Scene Architecture and Asset Model

Each environment has four asset classes.

### 5.1 Clean room master

A single clean master establishes:

- camera angle;
- perspective;
- room geometry;
- furniture layout;
- lighting direction;
- architectural proportions;
- resting object positions.

All aftermaths must remain recognizably the same room.

### 5.2 Interactive object layers

Key gameplay objects are separate room-matched transparent assets. They must visually belong to the clean room and use matching perspective, material, lighting, and shadow treatment.

Kitchen priorities:

- pan;
- toaster;
- toast;
- kettle;
- cabinet door(s);
- dishes;
- bowling/heavy ball;
- rocket;
- safe/heavy object.

Garage priorities:

- hammer;
- wrench;
- drill;
- saw/spinning tool;
- chain;
- tire;
- toolbox contents;
- shelf components;
- tank;
- rocket;
- safe/heavy object.

Where a moving object would otherwise remain visible in the background plate, the clean plate must omit that object and reconstruct it as a separate resting layer.

### 5.3 Localized destruction assets

Temporary impact-support assets may include:

- ceramic/glass shards;
- wall chips;
- wood splinters;
- metal fragments;
- sparks;
- fire;
- smoke;
- scorch marks;
- impact dust;
- dangling wires;
- broken hinges.

These support the choreography but do not substitute for authored final aftermaths.

### 5.4 Final aftermath masters

Each environment has five independent final room compositions:

- 0× failure;
- 1.2× minor;
- 3× moderate;
- 10× severe;
- 100× legendary/cinematic.

The final plate is the authoritative end-state image after choreography finishes.

The production asset structure should make this explicit, for example:

```text
public/rooms/
├── kitchen/
│   ├── gallery/
│   ├── stage/
│   ├── aftermath/
│   └── objects/
└── garage/
    ├── gallery/
    ├── stage/
    ├── aftermath/
    └── objects/
```

The application should use an environment manifest/registry rather than hardcoded one-photo damage logic.

## 6. Physical Choreography Rules

Every major animated object must satisfy four conditions:

1. **Origin:** it visibly starts where that object physically belongs in the room.
2. **Motion:** its trajectory and pivot fit the object's shape, weight, and attachment.
3. **Impact:** it collides with a believable target/location.
4. **Consequence:** that collision is reflected in the final aftermath.

### 6.1 No-source-no-effect rule

No persistent effect may appear without a physical source.

- fire must ignite from a burner, impact, electrical failure, rocket exhaust/impact, or other visible cause;
- sparks must come from contact/electrical failure;
- smoke must come from burning, venting, blast, or damaged equipment;
- debris must come from a broken source;
- architectural damage must correspond to an actual event.

If the explanation for an effect is merely “because this is a higher multiplier,” the effect fails review.

### 6.2 Shared versus terminal choreography

The first approximately 60–70% of a reveal should be substantially shared for a fixed environment/visual seed so payout is not telegraphed early.

Tier-specific choreography primarily affects the terminal sequence and finalizer.

A failure may still produce spectacular destruction. A huge win may appear to be failing mid-sequence.

### 6.3 Kitchen choreography vocabulary

Required beats include:

- toaster activation and toast projectile;
- pan leaving the actual stove/counter area;
- cabinet door hinging from its real pivot;
- dishes falling from real storage and shattering at impact;
- steam/grease-fire activity from a real source;
- bowling/heavy object movement through the scene;
- rocket crossing a large portion of the room from a believable storage origin;
- safe/heavy-object drop with meaningful crush impact.

### 6.4 Garage choreography vocabulary

Required beats include:

- hammer/wrench movement from bench/pegboard/tool storage;
- tool ricochet with metal-on-metal consequence;
- drill/saw movement or spin-off event;
- tire rolling with visible rotation and believable deflection;
- chain swing/snap/fall on a curved path;
- shelf collapse around real support points, with contents responding;
- tank vent/hiss as an event, not a payout signal;
- rocket traversal from a visible origin;
- safe/heavy-object impact that deforms a believable target zone.

### 6.5 Camera behavior

Allowed:

- restrained impact shake;
- subtle punch-in on major collision;
- light parallax;
- brief impact bloom/flash;
- gentle recovery drift.

Rejected:

- continuous screen shake;
- aggressive zoom spam;
- camera motion that hides the physical action;
- effects so strong the player cannot see what actually broke.

The room is the star.

## 7. Tier-Specific Art Direction

Visual severity is not a simple monotonic payout meter. The 0× state can be highly destructive because the joke is that everything went wrong and nothing paid.

### 7.1 Kitchen

#### Clean

Warm, cinematic, lived-in kitchen with clear stove, upper cabinetry, counter space, toaster/kettle/dishes, refrigerator, central work area, visible depth, and believable absurd-danger storage.

#### 0× — catastrophic wreck / failure

- heavy stove-area scorch;
- broken/open upper cabinet;
- another cabinet hanging crooked;
- ceramic debris across floor;
- pan displaced far from stove;
- toaster overturned or lodged absurdly;
- damaged counter edge;
- localized smoke staining;
- refrigerator dent/scorch;
- damaged overhead fixture;
- broad debris accumulation;
- major walls still standing.

Mood: **Everything broke and you still got nothing.**

#### 1.2× — localized minor success

- one cabinet open/partially damaged;
- toaster displaced;
- limited broken dishes;
- localized scorch;
- minor pan impact mark;
- small debris field;
- one appliance visibly affected;
- architecture largely intact.

Mood: **Bad idea, surprisingly manageable.**

#### 3× — moderate destruction

- multiple cabinets damaged/open;
- dishes shattered across central floor;
- cracked counter section;
- pan lodged/displaced into another region;
- expanded stove/fire damage;
- hood/microwave damage;
- refrigerator visibly affected;
- displaced hanging fixture;
- soot and debris across several zones.

Mood: **This is now an insurance claim.**

#### 10× — severe room damage

- several cabinet sections missing/detached;
- major stove-zone damage;
- hood bent/partly removed;
- upper wall or ceiling damage;
- large debris field;
- refrigerator moved/partly damaged;
- one cabinet/shelf run collapsed;
- exposed wall material;
- broken lighting/fixture;
- embedded/lodged objects.

Mood: **The kitchen technically exists.**

#### 100× — absurd cinematic devastation

- major ceiling breach/collapse;
- large wall opening or blast path;
- most upper cabinetry destroyed;
- central work surface heavily deformed;
- devastated stove zone;
- dense debris;
- exterior light through structural breach where composition supports it;
- multi-surface fire/smoke damage;
- large embedded object;
- visible rocket aftermath;
- safe/heavy-impact crush zone;
- exposed framing/pipes/wiring.

The room remains identifiable as the same kitchen.

### 7.2 Garage

#### Clean

Dense workshop with workbench, pegboard, tools, drill/saw, toolbox, shelving, tire route, chain, tank, metal cabinet, open floor path, absurd rocket storage, and believable heavy-object impact zones.

#### 0× — catastrophic wreck / failure

- partly wrecked workbench;
- emptied toolbox;
- scattered tools;
- detached chain;
- tire lodged awkwardly;
- localized spark/blackening zone;
- damaged shelf;
- dented cabinet;
- one destroyed machine/tool;
- smoke and heavy debris;
- structure mostly intact.

Mood: **The workshop lost the fight.**

#### 1.2× — localized minor damage

- displaced tools;
- small bench damage;
- one tire out of position;
- fallen chain/cable;
- small burn/impact mark;
- broken shelf bracket;
- partially spilled toolbox;
- limited debris;
- architecture almost untouched.

Mood: **You can probably clean this up before anyone notices.**

#### 3× — moderate destruction

- partly emptied tool wall;
- partially collapsed shelf;
- visible tire path through displaced objects;
- drill/saw damage;
- badly marked bench;
- loose chain;
- dented/open cabinet;
- shifted/vented tank;
- metal debris;
- localized smoke/soot.

Mood: **Someone definitely heard that.**

#### 10× — severe destruction

- major shelf collapse;
- bench partly destroyed;
- scattered/embedded tools;
- deformed metal cabinet;
- tire-impact damage;
- chain across floor;
- damaged/displaced tank;
- wall/ceiling damage;
- broken lighting;
- heavy debris;
- smoke haze/exposed structure.

Mood: **Do not call the landlord.**

#### 100× — cinematic workshop annihilation

- major wall breach;
- ceiling damage;
- shelving obliterated;
- workbench destroyed;
- cabinet partly crushed;
- large machinery displaced;
- visible rocket path;
- embedded tools;
- absurd final tire position;
- chain draped through wreckage;
- tank displaced;
- dense metal debris;
- exposed beams/wiring;
- large safe/heavy-object crush zone.

The garage remains recognizably the same garage.

## 8. Damage Continuity Model

Every final artwork should have a structured continuity record containing at minimum:

- destroyed objects;
- displaced objects;
- surviving objects where relevant;
- damaged zones;
- persistent debris/effects;
- architectural changes.

Example shape:

```ts
{
  environment: 'kitchen',
  tier: 3,
  destroyed: ['upper-cabinet-right', 'dish-stack', 'range-hood'],
  displaced: ['pan', 'toaster'],
  damagedZones: ['stove-wall', 'center-counter', 'upper-right-ceiling'],
  persistentFx: ['soot-stove-wall', 'ceramic-debris-center']
}
```

This record exists to enforce continuity between choreography and final art. If an animated object destroys a zone that is pristine in the aftermath, the aftermath fails review.

## 9. Scene Engine Migration

The current settlement lifecycle remains. Presentation becomes a focused subsystem.

Recommended top-level structure:

```text
App
├── GalleryScreen
└── GameScreen
    ├── GameHeader
    ├── RoomStage
    ├── GameControls
    ├── ResultOverlay
    └── FairnessReceipt
```

`App` owns Chain/round state, wager, risk mode, environment, and high-level view state. Room rendering, destruction, gallery layout, audio composition, and aftermath art live in dedicated modules.

### 9.1 Environment manifests

Each room exposes a manifest containing:

- gallery assets;
- clean stage plate;
- aftermath plate mapping;
- interactive object definitions;
- impact zones;
- audio palette.

The current one-room-photo-plus-damage-CSS model must be removed from production use.

### 9.2 Object model

Production actors should support at minimum:

- asset path;
- home transform;
- pivot point;
- origin zone;
- z-index;
- room-specific perspective/scale data.

Structural actors such as cabinet doors and shelves must rotate/collapse around believable attachment pivots rather than their visual center.

The existing generic SVG actor artwork may remain only as a test/fallback resource if useful; it must not define the final production look.

### 9.3 Impact model

Use centralized impact metadata to drive VFX, audio, camera response, debris, and persistent damage.

Conceptual shape:

```ts
type ImpactEvent = {
  point: ScenePoint;
  materialA: Material;
  materialB: Material;
  strength: 1 | 2 | 3 | 4;
  effect: 'spark' | 'shatter' | 'fire' | 'dust' | 'debris';
};
```

The same physical impact should not be independently approximated by unrelated VFX and audio systems.

### 9.4 Aftermath transition

At the terminal catastrophe beat, use cinematic obstruction to transition from the interactive clean-room composition to the tier-specific authored final plate.

Preferred pattern:

```text
impact
→ flash / local debris / smoke
→ authored aftermath appears beneath obstruction
→ smoke/debris clears
→ final room remains visible
→ result UI appears
```

This is intentional cinematic sleight of hand and is preferable to simulating every structural change dynamically.

## 10. Audio Direction and Architecture

The existing event-timing concept remains, but production audio should move away from oscillator/noise-led arcade sound toward authored material-based foley.

### 10.1 Sound hierarchy

Four levels:

1. ambient room tone;
2. object movement;
3. impact;
4. hero/structural event.

Small events must not compete with major impacts.

### 10.2 Kitchen palette

Include representative families for:

- toaster spring/pop;
- light toast/object hit;
- pan scrape/clang;
- cabinet creak/slam;
- wood break;
- plate rattle;
- ceramic/glass shatter;
- kettle/steam hiss;
- burner/grease ignition;
- electrical crack;
- refrigerator impact;
- rolling/thumping heavy ball;
- rocket ignition/flyby/impact;
- safe fall/heavy impact;
- debris settling;
- fire/steam aftermath ambience.

### 10.3 Garage palette

Include representative families for:

- wrench/hammer drops and clangs;
- tool ricochet;
- drill/saw motor and spin-down;
- chain tension/snap;
- tire roll/bounce;
- toolbox spill;
- shelf strain/collapse;
- cabinet impact;
- tank hiss/resonance;
- electric sparks;
- rocket ignition/flyby/impact;
- safe/heavy impact;
- metal debris/room rumble;
- workshop aftermath ambience.

### 10.4 Event synchronization

Sound timing must be authored relative to motion/impact, not merely fired when an animation starts.

Example sequence:

```text
0ms    pan begins moving
250ms  pan leaves stove
940ms  pan hits cabinet      → metal/wood impact
1010ms cabinet reacts         → wood/hinge response
1220ms plates begin falling
1560ms plates hit floor       → ceramic shatter
```

Major events should use layered sound design rather than one sample or increased global volume.

### 10.5 Spatial treatment

Use subtle stereo placement and room-specific response. Kitchen should feel brighter/shorter; Garage slightly darker/heavier with longer metallic tail. Full 3D audio is unnecessary.

### 10.6 Variation and determinism

Sound families should provide multiple variants. The cosmetic visual seed may deterministically select variants so repeated rounds avoid obvious repetition without affecting economics.

### 10.7 Result and aftermath audio

Do not switch into slot-machine jingles. Use restrained result stings after the room settles, followed by tier/environment-appropriate aftermath ambience such as fire crackle, electrical sparking, metal creak, tank hiss, steam, or debris settling.

## 11. Responsive and Accessibility Rules

### 11.1 Mobile

- preserve the same artistic language;
- keep room-first hierarchy;
- move controls below the stage;
- preserve major choreography;
- keep key impact zones inside a mobile-safe focal area;
- reduce only secondary particle/debris density where performance requires it;
- never replace authored aftermaths with simplified mobile-only effects.

### 11.2 Reduced motion

For reduced-motion users:

- shorten camera shake;
- reduce parallax and secondary debris motion;
- preserve understandable event sequence and final aftermath;
- never make result comprehension depend on animation or audio alone.

### 11.3 Audio controls

- respect browser autoplay restrictions;
- audio begins only after interaction;
- retain immediate mute/unmute;
- game/result comprehension must not depend on sound.

## 12. Asset Production Workflow

Create assets in this order:

1. lock clean Kitchen master;
2. derive all five Kitchen aftermaths from that exact master;
3. validate camera/perspective/furniture continuity;
4. lock clean Garage master;
5. derive all five Garage aftermaths from that exact master;
6. extract/build room-matched interactive object layers from the same source art;
7. create localized destruction/VFX assets;
8. produce gallery crops from the approved room states.

Do not independently generate all twelve gallery images as unrelated compositions. That risks geometry, furniture, perspective, and lighting drift.

Gallery previews and playable aftermaths should come from the same underlying art direction so the gallery honestly previews the game.

## 13. Asset Rejection Rules

Reject an asset if:

- room identity changes unintentionally;
- camera angle or lens feel changes unnecessarily;
- furniture changes design between tiers without a damage reason;
- damage does not correspond to choreography;
- destruction is primarily an increase in smoke/brightness;
- perspective/material treatment makes an actor look pasted on;
- it drifts toward cartoon, neon, sci-fi, generic Web3, or casino-dashboard language;
- 100× is merely 10× with more smoke;
- 0× is visually boring because it is a losing outcome.

## 14. Migration Sequence

Implement in controlled phases:

1. **Gallery fidelity:** build the reference-matched gallery first and review it before continuing.
2. **Environment manifests:** introduce structured room/asset registries without changing economics.
3. **Clean immersive rooms:** replace the current play backdrop with approved clean room stages.
4. **Room-matched major actors:** migrate the highest-value physical objects first.
5. **Impact/VFX synchronization:** anchor effects to real impact points.
6. **Authored aftermath system:** replace CSS damage tiers with dedicated final plates.
7. **Production sound:** replace synthesized prototype character with material-based foley.
8. **Polish:** camera behavior, mobile choreography, transition quality, loading/performance.
9. **Legacy removal:** delete conflicting old presentation code after replacement is verified.

Economic tests must remain green throughout.

## 15. Performance Strategy

The build is asset-heavy, so loading must be staged.

Initial page:

- load gallery thumbnails only.

After selecting an environment:

- load that environment's clean stage and critical actor assets;
- lazy-load the unselected environment.

When a round begins:

- preload that environment's aftermath plates and required audio;
- cache decoded audio buffers after first load where practical.

Use WebP/AVIF where appropriate, preserve visible texture quality, and avoid aggressive compression that introduces banding or muddy debris/metal detail.

Primary motion should favor compositor-friendly transforms. Avoid expensive whole-screen animated filters and excessive DOM-particle counts.

## 16. Error Isolation

Visual/audio failures must never trap an already-settled wager.

- audio failure does not block visuals;
- secondary VFX failure does not block choreography;
- optional asset failure does not block settlement/reveal;
- if a tier-specific aftermath fails to load, use a safe environment-specific authored fallback and still reveal the settled economic result.

Economic state is never dependent on successful media playback.

## 17. Testing and Visual QA

### 17.1 Required visual baselines

Capture reference screenshots for:

- gallery desktop;
- gallery mobile;
- Kitchen clean;
- Garage clean;
- all five Kitchen aftermaths;
- all five Garage aftermaths;
- representative mid-chaos Kitchen frame;
- representative mid-chaos Garage frame.

### 17.2 Gallery acceptance

The gallery fails visual review if it no longer closely resembles the approved reference in:

- overall dark tone;
- header balance;
- room-section hierarchy;
- six-card structure;
- image dominance;
- multiplier typography;
- quote treatment;
- yellow CTA hierarchy;
- restrained borders/shadows.

### 17.3 Physical-event acceptance

Every major event is reviewed for:

- correct origin;
- believable motion;
- believable impact;
- persistent consequence.

### 17.4 Aftermath uniqueness

Each environment's five aftermaths must be structurally distinct in multiple dimensions such as:

- object presence;
- furniture position;
- architecture;
- debris arrangement;
- impact damage;
- scorch/burn location;
- collapse geometry.

### 17.5 Choreography determinism

For fixed environment, visual seed, and tier, the scene remains deterministic. Shared early choreography should remain substantially common across tiers for the same seed; terminal sequences may diverge.

### 17.6 Audio QA

Review:

- impact synchronization;
- material correctness;
- Kitchen/Garage sonic distinction;
- mix hierarchy;
- no clipping;
- no arcade-tone dominance;
- 100× gains scale through layering, not simple volume increase;
- aftermath ambience persists after action.

### 17.7 Economic regressions

Automated coverage must continue to prove:

- environment does not change payout;
- environment is not encoded economically;
- tier calculation remains unchanged;
- RTP remains unchanged;
- visual seed remains cosmetic;
- payout settles before reveal;
- recovered rounds resolve correctly;
- cancellation/error/refund states are not presented as losses;
- result reveal waits for presentation completion.

## 18. Review Gates

Implementation is reviewed in six gates:

1. **Gallery:** does it actually look like the supplied reference?
2. **Clean rooms:** do Kitchen and Garage belong to the same artistic universe as the gallery?
3. **Physical object motion:** do moving objects look like pieces of the actual rooms?
4. **Aftermaths:** could any tier be mistaken for “same room + more smoke”? If yes, reject it.
5. **Audio:** does every important sound correspond to visible physical action?
6. **Full round:** does pristine room → catastrophe → authored aftermath feel continuous?

Do not continue to later polish while an earlier gate is materially wrong.

## 19. Definition of Finished

The rebuild is complete only when all of the following are true:

1. The landing/gallery page closely matches the supplied reference.
2. Kitchen and Garage each have one convincing clean environment.
3. Major animated props visually belong to those environments.
4. Chaos is driven by actual room-object motion, not detached overlay gimmicks.
5. Fire, smoke, sparks, debris, and structural damage have physical sources.
6. Each environment has five independently art-directed aftermaths.
7. Animation consequences match those aftermaths.
8. Kitchen and Garage have distinct synchronized production sound.
9. 0× remains visually satisfying.
10. 100× is structurally and compositionally distinct from 10×, not merely more intense effects.
11. Mobile preserves the same artistic language and core choreography.
12. Economic logic and Chain settlement behavior remain unchanged.
13. Visual regression coverage protects the approved art direction.
14. Conflicting old presentation code is removed after replacement is verified.
15. The final result UI leaves the authored room visible as the main visual reward.

A passing build must satisfy both technical correctness and art-direction fidelity. Passing unit tests alone is not sufficient for completion.