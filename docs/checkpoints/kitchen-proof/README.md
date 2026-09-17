# Checkpoint 2: kitchen visual proof

Status: **PASSED by deployed motion review on September 17, 2026.** This checkpoint proved the rendering method only; the complete kitchen is Checkpoint 3.

## Acceptance evidence

The final deployed recording, `Screencast from 2026-09-17 22-32-49.webm`, was reviewed at the full sequence and contact frames. It cleared the visual gate because:

- the cabinet door visibly remains attached to the surviving upper hinge;
- the lower bracket/screw failure is readable before the main sag;
- the door edge physically reaches the first plate before the cascade begins;
- the four plates separate and read as shallow ceramic bodies instead of flat white strips;
- each plate breaks from its own impact and leaves persistent fragments;
- toast and fragments settle onto the counter rather than floating;
- the same 1000×600 room remains visible before, during, and after the accident;
- reset reconstructs the intact room deterministically.

The final proof source was branch `feat/living-room-rebuild` at `3df1f6bfd0a8695ca006b1efc4102ad395415cb7`, with the actual final-gate renderer/model changes in the immediately preceding commits. GitHub/Vercel reported the final-gate build successful.

## What the proof established

The production rendering pattern is an authored 2.5D room with one logical 1000×600 coordinate system. The background, door, toaster, toast, plate geometry, hinge hardware, contact cue, shadows, fragments, and damage all share that coordinate system. The proof deliberately did not use a full-frame aftermath replacement.

`kitchenFrame` is a pure deterministic sampler. The event graph encodes toaster release → toast contact → lower-hinge failure → upper-hinge suspension → visible door/plate strike → staggered plate impacts. Damage remains until reset.

## Art provenance

The sharp kitchen room and object atlas were authored September 17, 2026 with the built-in image-generation tool and then optimized for the project. They are not enlargements of the degraded legacy art.

- `public/rooms/kitchen/proof/room.webp` — fixed-camera 5:3 kitchen base with empty controllable counter/cabinet surfaces.
- `public/rooms/kitchen/proof/objects.webp` — matching door, toaster, plates, toast, and ceramic-fragment artwork.

The generator returned an opaque object sheet, so the implementation uses explicitly authored silhouette masks rather than claiming generated alpha.

## Revision history

The first deployed proof failed review because the door behaved like a flat sheet, plates fell as a rigid stack, and toast remained visually ungrounded. The next revision separated plate impacts and added door depth/hinge hardware. The second recording still failed because the hinge failure was too weak and plates still read as thin cutouts. The third revision made the lower bracket tear visible and added ceramic depth, but plate flight/contact still needed one more correction. The final revision added a clearly surviving upper hinge, explicit door-to-first-plate collision, and shallow ceramic bodies that retain volume during flight. That final deployed recording passed.

## Handoff

Checkpoint 2 is closed. Do not continue polishing this isolated proof unless a regression appears. Checkpoint 3 must reuse this proven hinge/contact/plate behavior inside the complete Kitchen Meltdown rather than introducing another competing renderer.
