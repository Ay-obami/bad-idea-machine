# Reference-Faithful Physical Scenes

## Goal

Make Bad Idea Machine look like the approved cinematic reference: a believable, fully visible Kitchen Meltdown or Garage Mayhem room, with photographic objects moving through it during chaos and a persistent multiplier-specific photographic aftermath after settlement.

## Non-negotiable visual rules

1. The room is the hero. It must remain clearly visible in idle, reveal, and result states.
2. The live stage must use environment-native photographic imagery, not flat SVG/card artwork.
3. Animated actors may only use transparent photographic cutouts that visually belong to the room. Unsupported cartoon/SVG actors are hidden rather than shown.
4. Result damage is represented by five separately authored photographic room states per environment, one for each payout tier. CSS smoke/scorch/crack overlays may add atmosphere but may not be the primary damage mechanism.
5. The five `POSSIBLE OUTCOMES` cards use the same photographic aftermath files that can appear in the main stage.
6. The settled room remains on its tier-specific aftermath until the player changes environment or launches again.
7. The result card must not obscure the core destruction. Keep it compact in a corner.
8. Kitchen and Garage must remain materially different physical spaces, not recolors.
9. Mobile keeps the same visual hierarchy: room first, controls second, outcome strip readable below.

## Asset contract

Each environment ships seven local room-state assets:

- `public/cinematic/kitchen/idle.webp`
- `public/cinematic/kitchen/chaos.webp`
- `public/cinematic/kitchen/result-0.webp` through `result-4.webp`
- `public/cinematic/garage/idle.webp`
- `public/cinematic/garage/chaos.webp`
- `public/cinematic/garage/result-0.webp` through `result-4.webp`

Every result file is separately authored. The runtime selects exactly one room-state file at a time, and the outcome strip reuses the same result files as the main stage.

Photographic actor cutouts live under `public/cinematic/actors/` and are keyed by exact scene actor ID, for example `kitchen-toaster.webp`, `garage-hammer.webp`.

## Stage state model

`idle` -> room uses `idle.webp`.

`arming` -> room stays on `idle.webp`; only HUD/arming copy changes.

`revealing` -> room crossfades into `chaos.webp`, camera movement/VFX remain subtle, and only photographic actor cutouts animate over the scene.

`result` -> room crossfades to `result-{tier}.webp` and stays there. Tier changes the final photographic room only; it does not change settlement math or the shared reveal script.

## Actor model

The existing deterministic SceneScript remains the timeline source for event timing, movement, VFX and sound. `SceneActor` renders a photographic cutout only when an exact actor asset exists. Unsupported actors remain invisible but their sound/VFX/event probe behavior still runs. Existing SVG actor artwork is not used by the live stage.

## Economics and fairness

No contract, paytable, RTP, risk-mode encoding, VRF request, settlement, or payout-tier calculation changes are allowed. Environment and scene assets remain cosmetic only.

## Testing

The browser gate must prove:

- idle room uses the environment-specific authored `idle.webp`;
- reveal switches to the authored `chaos.webp`;
- result switches to exactly `result-{tier}.webp` and never back to idle automatically;
- all five outcome cards point to five distinct result files;
- no `.actor-art` SVG is rendered in the live stage;
- at least one photographic actor cutout moves during a reveal;
- Kitchen and Garage both pass desktop and 390px mobile smoke tests;
- zero browser console/page errors;
- existing unit/type/build/bundle/105-round local-VRF regression remains green.

## Definition of done

A screenshot of the running game must read like the approved reference at a glance: a detailed physical room with integrated objects, cinematic chaos, and obvious persistent room damage that changes with the settled multiplier. If it still reads as icons floating over a background, it is not done.
