# Checkpoint 3A — Grease-fire realism gate

Status: **implementation/build verified; deployed visual review required**.

This is the first Checkpoint 3 rebuild after rejecting the previous full-kitchen renderer as a visual regression. Do not merge into `feat/living-room-rebuild` and do not add another Kitchen chain until this deployed motion passes review.

## Baseline protection

- Accepted Checkpoint 2 realism baseline: `3df1f6bfd0a8695ca006b1efc4102ad395415cb7`.
- Rejected Checkpoint 3 implementation preserved separately at `archive/checkpoint3-regression-2026-09-17`.
- Accepted baseline additionally preserved at `archive/checkpoint2-realism-baseline`.
- Rebuild branch: `feat/kitchen-grease-fire-proof`.

## Scope

The accepted toaster → loose hinge → cabinet door → plate cascade is unchanged.

Only one additional physical chain has been added:

`real ceramic fragment → pan handle → supported pan tip/slide → oil spill → hot burner → localized ignition`

There are no payout tiers, terminal destruction states, second SVG room, full-frame aftermath replacements, or production Kitchen integration in this gate.

## Rendering constraints

- `KitchenRoom` remains the only room renderer.
- The pan exists on the stove from the first frame of this preview; it is not spawned by the chain.
- The continuing projectile reuses the approved ceramic shard atlas art rather than a generic polygon.
- The pan remains supported throughout and moves only a small distance/angle after contact.
- Oil remains on the stove plane and must reach the burner before ignition begins.
- Flame, smoke and scorch share the same authored burner contact point and are intentionally localized.
- The original `?scene=kitchen-proof` route still renders without the new chain.

## Behavior requirements

A Vitest regression file was committed before the implementation. It requires:

- no pan motion before physical shard contact;
- supported, bounded pan displacement rather than a launched prop;
- oil before ignition;
- ignition only after the oil reaches the burner;
- common fire/smoke/scorch origin;
- persistent aftermath until reset.

The current environment still cannot clone the GitHub repository, so the repository Vitest suite has not been freshly executed here. A local executable mirror of the pure motion contract was run red-then-green, and the final source commit passed the Vercel production build. Do not treat either as a substitute for the repo-wide Vitest run.

## Source commits

- Regression requirements: `e6b685296e4cec3d438a1730f6a9135a11cf7014`
- Pure chain model: `5c0bdb2344db393a98b3f0b814f58b09422e7c7f`
- Single-renderer integration: `39ce494e1beb3c68fafee8dfbdaa534cdd031a22`
- Isolated review route: `618996d766cfe49944800754cb49b16c090bb42f`
- Route wiring: `a56a374f0079d3d6bdc9f2cde6f8f7df730c33a1`
- Vercel build status for `a56a374f...`: **success**.

## Deploy and inspect

Deploy `feat/kitchen-grease-fire-proof`, then open:

`/?scene=kitchen-grease-fire`

Record one full 7.2-second run with the room large enough to inspect object grounding. Also scrub or pause at: plate impact, shard crossing, shard/pan contact, pan settled tipped, oil almost at burner, ignition, localized fire, and persistent aftermath.

The gate fails if the pan reads as a pasted sprite, leaves its support, changes scale unnaturally, if the shard does not visibly meet the handle, if oil/fire read as generic UI graphics, if ignition appears away from the oil contact, or if the accepted cabinet/plate sequence looks worse than the Checkpoint 2 baseline.

No contract deployment. No Garage work. No second Kitchen chain until this passes.
