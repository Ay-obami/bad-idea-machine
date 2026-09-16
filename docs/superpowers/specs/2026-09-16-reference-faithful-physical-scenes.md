# Reference-Faithful Physical Scenes

## Goal

Make Bad Idea Machine look like the approved cinematic reference: a believable, fully visible Kitchen Meltdown or Garage Mayhem room, with photographic objects moving through it during chaos and a persistent multiplier-specific photographic aftermath after settlement.

## Non-negotiable visual rules

1. The room is the hero. It must remain clearly visible in idle, reveal, and result states.
2. The live stage must use environment-native photographic imagery, not flat SVG/card artwork.
3. Animated actors may only use transparent photographic cutouts that visually belong to the room. Unsupported cartoon/SVG actors are hidden rather than shown.
4. Result damage is represented by five separately authored photographic room states per environment, one for each payout tier. CSS smoke/scorch/crack overlays may add atmosphere but may not be the primary damage mechanism.
5. The five `POSSIBLE OUTCOMES` cards use the same photographic aftermath frames that can appear in the main stage.
6. The settled room remains on its tier-specific aftermath until the player changes environment or launches again.
7. The result card must not obscure the core destruction. Keep it compact in a corner.
8. Kitchen and Garage must remain materially different physical spaces, not recolors.
9. Mobile keeps the same visual hierarchy: room first, controls second, outcome strip readable below.

## Asset contract

The fourteen authored full-room states are packed losslessly by meaning into one local `public/cinematic/scene-atlas.avif` for delivery efficiency. The atlas is a vertical sequence of fourteen equal 16:9 frames in this exact order:

0. Kitchen idle
1. Kitchen chaos
2. Kitchen result tier 0
3. Kitchen result tier 1
4. Kitchen result tier 2
5. Kitchen result tier 3
6. Kitchen result tier 4
7. Garage idle
8. Garage chaos
9. Garage result tier 0
10. Garage result tier 1
11. Garage result tier 2
12. Garage result tier 3
13. Garage result tier 4

Packing is only storage optimization: every state remains separately authored and the runtime selects exactly one frame at a time. The same result frames are used in the main stage and outcome strip.

Photographic actor cutouts live under `public/cinematic/actors/` and are keyed by exact scene actor ID, for example `kitchen-toaster.webp`, `garage-hammer.webp`.

## Stage state model

`idle` -> room uses the environment idle frame.

`arming` -> room stays on the idle frame; only HUD/arming copy changes.

`revealing` -> room crossfades into the environment chaos frame, camera movement/VFX remain subtle, and only photographic actor cutouts animate over the scene.

`result` -> room crossfades to that environment's `result tier` frame and stays there. Tier changes the final photographic room only; it does not change settlement math or the shared reveal script.

## Actor model

The existing deterministic SceneScript remains the timeline source for event timing, movement, VFX and sound. `SceneActor` renders a photographic cutout only when an exact actor asset exists. Unsupported actors remain invisible but their sound/VFX/event probe behavior still runs. Existing SVG actor artwork is not used by the live stage.

## Economics and fairness

No contract, paytable, RTP, risk-mode encoding, VRF request, settlement, or payout-tier calculation changes are allowed. Environment and scene assets remain cosmetic only.

## Testing

The browser gate must prove:

- idle room selects the correct environment idle frame;
- reveal selects the correct authored chaos frame;
- result selects exactly that environment's result frame for the settled tier and never automatically returns to idle;
- all five outcome cards select five distinct result frames;
- no `.actor-art` SVG is rendered in the live stage;
- at least one photographic actor cutout moves during a reveal;
- Kitchen and Garage both pass desktop and 390px mobile smoke tests;
- zero browser console/page errors;
- existing unit/type/build/bundle/105-round local-VRF regression remains green.

## Definition of done

A screenshot of the running game must read like the approved reference at a glance: a detailed physical room with integrated objects, cinematic chaos, and obvious persistent room damage that changes with the settled multiplier. If it still reads as icons floating over a background, it is not done.
