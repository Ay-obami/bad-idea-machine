# Kitchen Tier 1 terminal separation gate

Branch: `feat/room-native-rebuild-cp1`

## Purpose

This checkpoint proves that a final aftermath can be decomposed beyond architecture zones.

The Tier 1 terminal frame is rendered in this order:

1. Tier 1 architecture crops.
2. Every terminal prop, shadow and debris footprint is restored to a genuine clean support surface.
3. Contact shadows are reapplied independently.
4. Prop bodies are reapplied independently.
5. Persistent debris is reapplied independently.

The proof route is:

`/?scene=kitchen-tier1-separation`

## Why Tier 1 comes first

Tier 1 is the least damaged ending. Almost every surface should remain visually clean, so sloppy masks, rectangular patches, duplicated props, fake support surfaces and contaminated shadows are easiest to see here.

Higher tiers must not inherit Tier 1 masks automatically. Tier 1 must pass before terminal extraction expands to Tiers 0, 2, 3 and 4.

## Independent terminal families

The complete terminal contract now requires, for all five tiers:

- one architecture layer for every shell/destructible zone;
- one independent final-state layer for every prop;
- one independent contact-shadow layer for every prop;
- separate ceramic, cabinet and floor debris families;
- separate fire, smoke and power layers;
- no full-frame aftermath layer.

The Tier 1 proof currently implements real extraction masks for:

- pan + pan shadow;
- toaster + toaster shadow;
- hero toast + landed shadow;
- remaining toast stack + shadow;
- kettle + shadow;
- remaining plate stack + shelf shadow;
- shattered hero plate represented by ceramic debris rather than a whole plate body;
- oven towel + oven-front occlusion shadow;
- ceramic debris;
- floor debris;
- cabinet debris slot (empty at Tier 1).

## Acceptance criteria

Tier 1 fails if any of the following occur:

- hiding Props leaves a visible duplicate/object ghost;
- hiding Props reveals an obvious rectangular replacement patch;
- hiding Shadows removes part of the object body or architectural material;
- hiding Debris removes counter/cabinet architecture that should belong to the zone state;
- pan/toaster/kettle/plates/towel no longer have believable support surfaces;
- the shattered hero plate still exists as a whole plate anywhere in the terminal frame;
- enabling all layer families does not visually converge on the Tier 1 authoring reference.

## Current boundary

Motion remains blocked.

After Tier 1 passes visually, the extraction/masking strategy is extended to the other four final tiers. Only after all five terminal compositions can independently toggle architecture / props / shadows / debris / hazards do we return to causal animation.
