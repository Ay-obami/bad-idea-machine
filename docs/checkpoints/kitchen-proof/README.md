# Checkpoint 2: kitchen visual proof

Status: **preview ready; browser quality gate pending**. This is deliberately one connected visual sequence, not the complete kitchen game or a production release.

Open `/?scene=kitchen-proof` on this branch's Vercel deployment. The page is lazy-loaded and standalone only: an iframe cannot enter it. The normal two-room game, contract, paytables, host bridge, manifest and widget are unchanged.

## What to inspect

1. **Intact:** one toaster, supported by the countertop; plates on the cabinet shelf; matching lighting and one continuous room. The door starts attached at its right edge.
2. **Start the accident:** the spring pops the toast into the door's lower edge. The already-loose lower hinge gives way; the door hangs from its upper hinge and knocks the plates left, off their shelf.
3. **Plate impact / Aftermath:** shards stay on the counter, the door stays displaced, and the bread lands. There is no full-room image replacement.
4. **Reset / Replay:** reset reconstructs the intact room. Repeated playback follows the same contact points. The slider and five frame buttons expose the actual renderer's clock.
5. **390 px / 360 px:** these controls narrow the art frame for composition inspection; they do **not** emulate a mobile browser. Also inspect the whole page on a real narrow viewport. Reduced motion skips playback to the final state and retains manual frame inspection.

## Evidence and limits

- [Asset review](asset-review.webp): legacy clean plate (upper left), legacy toaster (upper right), legacy cabinet (lower left), new assembled room (lower right). Old plate has a baked-in toaster and degraded detail; old door has cutout contamination. None is reused in this proof.
- [Contact sheet](contact-sheet.webp): intact, launch, toast contact, door contact, plate fall, aftermath. Rendered from `KitchenRoom`, not a separately authored mockup.
- [Motion sample](motion.mp4): 4.04 seconds, 24 fps, 1000×600, no sound. Offline rendering of the same frame function and SVG composition. This demonstrates authored motion, **not measured browser performance**.
- 68 tests across 16 files pass, including dependency-order/cycle/missing-event/invalid-time rejection, duplicate-safe damage, exact contact boundaries, skipped-frame aftermath and reset.
- TypeScript, Vite production build, bundle and room-asset validation pass. The two new WebP files total 193,690 bytes. The entire room-art directory is 2,097,180 bytes within the unchanged 2,100,000-byte guardrail.
- Browser playback, full responsive page layout, runtime loading/retry, reduced-motion behavior and performance still require the deployed preview. The available browser cannot reach the local development server. Offline frames do not close those gates.
- This is an authored 2.5D motion proof. It is not a physics simulation. The single failing hinge is the premise; further physically convincing variation, five outcomes, audio and integration belong to checkpoint 3.

## Implementation

`room-model.ts` defines room geometry and causal events. `compileRoomTimeline` resolves dependencies by completion time, rejecting ambiguous/invalid graphs. `roomStateAt` derives durable damage even if animation frames are skipped. `kitchenFrame` is a pure time sampler. `KitchenRoom` renders one 1000×600 SVG coordinate system; no independently cropped background or props. Silhouette masks, fixed depth order, hinge pivot and surface shadows are explicit.

`KitchenProof` owns a cancellable animation clock, replay/reset/seek controls and bounded artwork loading with retry. It contains no money or SDK actions. The proof module and assets are requested only on the preview URL. The existing `RoomStage`/`EnvironmentStage` remain unchanged until this rendering approach passes the quality gate; this follows the approved plan's “full game integration not claimed yet” boundary.

To regenerate self-contained SVG inspection frames from the production component:

```sh
cd sdk/casino-sdk/examples/bad-idea-machine
node scripts/render-kitchen-proof.mjs /absolute/output/directory --frames
```

The optional `--frames` emits 97 frames at 24 fps. Offline rasterization used Sharp and FFmpeg available in the authoring environment. Some SVG rasterizers cannot decode embedded WebP: the evidence pipeline converted the embedded images to PNG before rasterization; browsers use the original WebP assets.

## Art provenance

Authored September 17, 2026 with the built-in image-generation tool. These are newly generated assets, not enlargements of the degraded originals. The original high-resolution generated files remain in the authoring workspace; the optimized project-bound files are:

- `public/rooms/kitchen/proof/room.webp` — 1500×900, 91,248 bytes.
- `public/rooms/kitchen/proof/objects.webp` — 1152×768, 102,442 bytes; interpreted in a 1536×1024 atlas coordinate system.

Room prompt: production fixed-camera 2.5D kitchen, landscape 5:3; straight-on architectural/photoreal game render; sharply focused cream shaker cabinets, sage subway tile, walnut counter, dark brass handles; warm sunlight from left; empty open cabinet and empty central countertop; no toaster, toast, plates, people, lettering or foreground island. A plant, jars, far-right sink and towel provide grounded environmental detail. The generated geometry was inspected and the manifest authored to its actual surfaces rather than assuming requested coordinates were obeyed.

Atlas prompt: use the generated kitchen as the lighting/material/perspective reference; five separated realistic object groups: front-facing cream shaker door with brass knob, brushed-steel two-slot toaster without toast, stack of ivory plates, one toast slice, six ceramic shards; warm upper-left light; request transparent PNG, no labels or neighboring overlap. The tool returned an opaque sheet. A background-removal edit also returned opaque artwork and was rejected. The original atlas is used with explicitly authored silhouette paths; no claim of generated alpha is made. Optimization only resized/encoded assets; it did not paint or replace object detail.

## Deployment handoff

Deploy branch `feat/living-room-rebuild` at the checkpoint 2 commit reported in the handoff. Use repository root and the existing `vercel.json` build settings. Then open `/?scene=kitchen-proof` and inspect the five steps above. **No contract deployment. No production-readiness claim.** The assistant has not deployed to Vercel.
