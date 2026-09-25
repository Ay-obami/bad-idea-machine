# Kitchen Tier 1 terminal separation · local proposal

Review route: `/?scene=kitchen-tier1-separation` on `feat/room-native-rebuild-cp1`.

The former route rendered an older remote intact atlas and Creative Claw aftermath atlas. Those assets are not authoritative for this Kitchen rebuild. The route now opens the repository-local stationary assembly with a Tier 1 **proposal** selected. The approved 1000×600 master remains the exact room and source for its cabinet, door, props, supports and contact layers. The master is never regenerated or replaced.

This proposal keeps the approved cabinet shelves and photographed lower dishes, drops the independently extracted door, slides the independent upper stack and removes the hero plate body and its shadow. A small supplemental ceramic-debris cutout, generated with the built-in image tool using the approved master as a lighting/material reference, is positioned on the stove. Its separate contact is derived from that cutout's alpha at render time. Debris and contact can be toggled independently. The new WebP decodes at 120×80; it does not contain an alternate room or a whole intact plate.

The original rest assembly, its plate stack, toast, pan, toaster, towel, kettle, and independent shadows remain individually controllable. The intact reference switch continues to display the unmodified master. The supplemental 10,000-byte cutout raises the Kitchen rebuild-art budget from 425,000 to 435,000 bytes and the count from 13 to 14; the total authored-room and full-bundle limits remain unchanged.

## Visual acceptance gate

At room and enlarged cabinet scale, inspect the debris position and material against the approved room. Hide the debris body: no plate fragment may remain. Hide its contact alone: no ceramic body may disappear. Hide the remaining upper stack and shadow: its shelf must be clean. The hero plate must not remain whole anywhere in the proposed terminal composition. The pan, toaster, kettle, towel and their contacts must stay registered at their approved rest positions. No rectangular patch, prop ghost or older Kitchen image is acceptable.

This is a stationary proposal pending a deployed visual review. It is not a finished outcome, accepted debris placement, complete Tier 1 damage, motion, or permission to expand to other tiers. The rejected loose shelf, broad cabinet backing and inferred door-hidden face remain diagnostic or withdrawn. Animation remains blocked.

## First deployed review

The initial `fa4dad2` deployment made the local-only route load and the former remote atlas was no longer requested by that route. The ceramic cutout was too large at 120×80 logical pixels and extended from the stove into the oven-control face. It **failed** the support and scale gate. The next static placement keeps the same cutout but displays it at 68×40 pixels over the stove's right burner region. That smaller composition requires a new deployed visual review before it can be accepted.
