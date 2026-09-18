# Kitchen destruction blueprint

Baseline branch: `feat/room-native-rebuild-cp1`

This document replaces the narrow "clean background plus a few props" interpretation with a destruction-aware layered scene contract.

## Why this exists

The previous motion proofs repeatedly reached the same dead end: a flattened room image permanently contained the same objects that later needed to move or break. Hiding those originals with approximate patches and introducing moving substitutes created duplication, spawning, state swaps, fake shadows, and mismatched materials.

The fix is not another patch. The Kitchen must be decomposed around the entire finished destruction space before more animation work is accepted.

## Layer classes

### Permanent shell

Permanent shell layers preserve camera and room identity. They can receive shadows, smoke occlusion and foreground debris but are not structurally replaced during a round.

- fridge / window / left counter shell
- far-right wall / art shell

### Destructible architecture

Every destructible zone must have authored local states registered to the exact same 1000x600 camera:

- open plate cabinet
- upper cabinetry above range
- central backsplash
- stove / range
- toaster / kettle counter
- right lower cabinetry
- sink / far-right run
- central floor / rug debris plane

Each zone starts at `intact` and has multiple local damage states. These are composable layers and masks, not full-frame aftermath images.

### Supported props

Every interactive prop exists as its own layer from frame zero. No later moving copy can be introduced over a baked original.

- pan — supported by burner grate
- toaster — supported by right counter
- toast — supported by toaster slot
- kettle — supported by right counter
- plate stack — supported by cabinet shelf
- oven towel — supported by oven handle

The intact scene must be reconstructed from shell + intact architecture + these prop layers and visually match the approved master.

## Causal variants

The blueprint encodes three physically connected variants:

1. **Plate to pan** — plate support failure -> hero plate -> pan handle -> pan displacement -> grease spill -> burner ignition -> local fire growth.
2. **Plate to kettle short** — plate support failure -> kettle strike -> kettle tip -> water run -> powered toaster/outlet short -> localized electrical damage.
3. **Toast to burner** — toaster jam -> toast eject -> burner contact -> toast ignition -> grease flare -> cabinet heat load -> shelf failure -> plate fall.

The first part of each variant remains payout-blind. Tier-specific terminal damage is applied only after the shared progression.

## Five final compositions

The static end states are intentionally not a simple increasing smoke value:

- **Tier 0 — catastrophic loss:** ugly heat/impact wreck with blackening and heavy debris.
- **Tier 1 — localized:** one readable accident; room mostly habitable.
- **Tier 2 — moderate:** connected multi-surface damage with architecture still mostly intact.
- **Tier 3 — severe:** broad structural cabinet/counter damage and persistent debris.
- **Tier 4 — absurd:** widest structural destruction while preserving the same room/camera identity.

Tier 0 and Tier 4 are both destructive but art-directed differently: Tier 0 is a failed, ugly wreck; Tier 4 is the most extensive absurd cinematic state.

## Mandatory asset-production gates

No new motion proof is accepted until all of the following are complete:

1. **Layered intact reconstruction**
   - permanent shell
   - every intact destructible zone
   - every rest-state prop
   - exact camera and lighting registration
   - no visible seams versus the approved master

2. **Five static aftermath compositions**
   - each built only from zone/prop states in the blueprint
   - no full-frame tier replacement image
   - same room and camera remain visible
   - each tier has a distinct readable architectural composition

3. **State transition coverage**
   - every state used by a tier has an authored asset/mask
   - every moved prop has a clean support surface beneath it
   - every breakable object has pre-impact, fracture and persistent debris states
   - contact shadows/occlusion are part of the package, not improvised later

4. **Visual approval**
   - intact reconstruction and all five static endings must be reviewed before animation resumes

Only after these gates pass do we return to one causal motion chain.
