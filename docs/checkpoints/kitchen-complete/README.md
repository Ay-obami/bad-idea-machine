# Checkpoint 3: complete Kitchen Meltdown

Status: **implementation ready for deployed visual/audio review; checkpoint not yet passed.**

## Scope implemented

Checkpoint 3 now promotes the approved Checkpoint 2 renderer into the production Kitchen path.

- The approved toaster → hinge failure → door/plate strike → staggered ceramic break remains the opening physical chain.
- Three deterministic, coherent variants extend that accident instead of shuffling unrelated actors:
  - `grease-fire`: ceramic strike → pan movement → grease spill → ignition → smoke.
  - `steam-short`: ceramic strike → kettle tip → water/steam spill → electrical short → smoke/fire damage.
  - `pan-spark`: ceramic strike → pan/cord contact → sparks → localized ignition → smoke.
- Shared destruction stays payout-blind until `5600 ms`.
- The complete Kitchen clock is `8000 ms`.
- Five payout outcomes use separately composed persistent structural states in the same room:
  - Tier 0: charred cabinet collapse + heavy safe impact/crater.
  - Tier 1: small localized scorch/chip damage.
  - Tier 2: cracked counter edge + backsplash damage.
  - Tier 3: visibly sagging/burned upper cabinet section.
  - Tier 4: cross-room rocket + blast-damaged architecture.
- Pan and kettle both exist in the intact room for every variant; sequence selection changes motion, not room inventory.
- Kitchen no longer renders `AftermathController`, no longer renders generic `SceneVfx`, and no longer preloads the five legacy full-frame Kitchen aftermath images.
- Result state holds the final production room frame instead of replacing the room image.
- Garage remains on the previous renderer and aftermath pipeline until Checkpoint 4.

## Audio

The complete Kitchen scripts use the existing production foley engine. Event impacts carry authored room coordinates and material information, so action/impact/hazard layers are scheduled from the same causal clock used by the visuals. Existing toaster, ceramic, pan, kettle/steam, spark, fire, heavy-crash, rocket, debris, and aftermath samples are reused. Master mute behavior is unchanged.

## Deterministic review route

Open:

`/?scene=kitchen-meltdown`

This route uses the production `EnvironmentStage`, production Kitchen renderer, production event scripts, and production foley without opening a wager. It exposes:

- all three causal variants;
- all five outcome tiers;
- actual SEND IT multiplier labels for the selected tier;
- replay of the complete 8-second sequence.

Review all three variants at least once, then inspect all five final outcome states. Tier-specific structural damage must not appear before the reveal phase.

## Source

Branch: `feat/living-room-rebuild`

Implementation sequence:

- `4850e29807da9d3feaecb7f6dca00f1fb2327344` — test contract for coherent variants, payout-blind shared phase, five persistent outcomes and deterministic reset.
- `4217cd8fa6398314cb84331759077f816b4934fd` — production Kitchen script/model/renderer integration and Garage isolation.
- `751eb09992f2690304a79d19b7ce839fc4b5d2be` — deterministic Checkpoint 3 preview, removal of legacy Kitchen aftermath preload, updated scene contract tests.
- `b9a3fc14bb12632eec232f7906949c8216d48626` — stable intact-room inventory and separately composed five-tier structural outcome art.

GitHub/Vercel reported successful production builds for the integration, deterministic preview, and final outcome-art revision.

## Verification limitation

The current sandbox cannot clone the repository from `github.com`, so a fresh local Vitest run was not available in this session. New and changed regression tests are committed, but **do not claim they passed until a fresh test command is observed**. Vercel success verifies the configured production build/TypeScript/`verify-build` path, not the Vitest suite.

## Deployed acceptance gate

Checkpoint 3 is not complete until a deployed recording verifies:

1. intact Kitchen has no prop pop when the random variant starts;
2. approved hinge/plate proof still looks correct inside normal production framing;
3. each secondary cause visibly follows the plate impact;
4. spill reaches the exact ignition point before fire begins;
5. smoke rises from that same point rather than appearing generically across the room;
6. synchronized foley is audible and materially appropriate;
7. no tier-specific damage leaks before the reveal phase;
8. all five final rooms are recognizably different structural compositions, not just different smoke opacity;
9. final damage persists beneath the result overlay until the next room reset;
10. normal Kitchen demo play still uses the real paytable/outcome path and Garage remains unaffected.

No Solidity or casino contract deployment is required for this checkpoint.
