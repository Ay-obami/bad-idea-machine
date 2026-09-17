# Checkpoint 2 final motion-gate revision

Status: **implementation/build verified; deployed visual review still required**. Do not begin Checkpoint 3 until the motion itself passes review.

## Trigger

Reviewed `Screencast from 2026-09-17 22-21-40.webm`. The lower-hinge failure read more clearly than the previous build, but three issues still blocked the visual gate: individual plates became thin white strip/zig-zag shapes in flight, the surviving upper hinge was not visually obvious enough to explain the hanging door, and plate motion still began like a scheduled animation rather than a visible door-to-plate collision.

## Final-gate changes

- Added an explicit `plate-strike` event after the door failure. No plate flight can begin until that collision completes. The first plate receives a visible contact nudge and the door recoils slightly at the same event.
- Reduced plate 2D roll and added explicit pitch-derived `faceHeight` and `bodyDepth`. The renderer now gives every unbroken plate a shallow ceramic side wall, underside, face and rim so it cannot collapse into a paper-thin slash during flight.
- Made the surviving upper hinge a two-leaf assembly: the door leaf transforms with the door, the cabinet-frame leaf stays fixed, and a visible shared pin remains at the authored pivot. The scene model exposes a stable `upperHinge` with load while the door sags.
- Updated inspection controls to expose `Door hits plate`, the revised first/last plate impact times, and the `CHECKPOINT 2 · FINAL MOTION GATE` header.

## Regression requirements

New expectations were committed before the implementation changes for: stable/loaded upper hinge, explicit strike-before-flight ordering, pre-flight first-plate nudge, minimum ceramic face/body thickness during flight, and bounded 2D roll.

Because this environment cannot resolve `github.com`, the full local Vitest suite could not be freshly executed here. Do **not** cite the earlier 72-test run as evidence for this revision. GitHub/Vercel reports the final source commit production build as successful, which verifies that the TypeScript/Vite build accepts the new state and SVG renderer but does not replace visual review or a fresh unit-test run.

## Source

- Test requirements: `0605c16091de8731fe1b97c5696ee6752c8f9f63`
- Motion/timeline model: `89f97491957c43fdd29bb2f80b76529d13460956`
- Ceramic/hinge renderer: `7e562542181678ca8c1692e3c00248132d18da6a`
- Final proof controls: `e0e1d717fadd4a70948e076c0bf3c0c9e1bf13c4`
- Vercel status for `e0e1d717...`: successful.

## Deploy and inspect

Deploy branch `feat/living-room-rebuild` at the latest checkpoint commit. Open `/?scene=kitchen-proof` and confirm the page says `CHECKPOINT 2 · FINAL MOTION GATE`.

Inspect, in order: the fixed upper hinge/pin while the lower hardware tears free; the door edge physically striking the first plate before any flight begins; each plate retaining shallow ceramic volume rather than turning into a white strip; sequential impacts/fractures; persistent door/debris/toast aftermath; deterministic reset/replay.

No contract deployment. No audio/full-kitchen expansion yet. If this motion passes, Checkpoint 2 closes and Checkpoint 3 begins with complete Kitchen Meltdown destruction, outcome states and synchronized sound.
