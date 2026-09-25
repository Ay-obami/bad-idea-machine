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

The deployed `ff728c7` review shows the 68×40 cluster resting within the right stove surface, without crossing into the oven controls. Hiding the cutout removes the ceramic while leaving its faint independent contact; hiding that contact alone retains the ceramic. Hiding the upper stack and its shadow exposes the clean approved cabinet shelf, while the lower dishes stay photographed. This passes the bounded **stationary layer separation and placement** check, not the complete terminal-art gate. The generated fragments remain supplemental proposed art, not an approved replacement plate or master image. The Tier 1 group control is revised to leave the photographed door visible when other props, contacts and debris are hidden, preventing its rejected inferred backing from appearing in that support view. That UI revision needs a deployed recheck.

The production `699122d` recheck confirms the Tier 1 group control hides props, contacts and debris but retains the photographed cabinet architecture and its hanging door. The all-hidden support view has no ceramic ghost or cabinet-size replacement rectangle; the pan, toaster, oven and kettle supports remain readable. **The local stationary layer-separation gate passes.** This accepts the local ownership/support composition and the small ceramic placement only. It does not approve a final terminal tier, displaced versions of the other props, motion or the older remote authoring reference. The remaining Tier 1 terminal-art gate needs a full authored target and its own comparison rather than treating the current proposed composite as authoritative by default.

## Stationary pan and toast proposal

The Tier 1 blueprint calls for a nudged pan and landed hero toast, but the first local composite retained both at their rest positions. The next static proposal moves the approved extracted pan body six logical pixels right and two down, with its independently controlled grate contact adjusted six right and one down. The hero toast body moves from the toaster to the right counter at (716, 290), and its independent contact is placed at (717, 306). Their clean support layers remain in place. These are only static proposals using already separated photograph-derived objects; they require deployed visual inspection for support, overlap and readability. The approved master and intact mode are unchanged, and no animation is resumed.

The first deployed pan/toast review at `566c9d1` shows the settled toast on the right counter between toaster and kettle, and hiding its body and contact returns a clean counter. The pan remains on its grate with a slight offset and separate contact. The ceramic cluster sits visibly to the right of its handle, weakening the proposed plate-to-pan contact. A second placement moves the same supplemental cutout 20 logical pixels left, to x=510, without changing the master or expanding its display size. This revised impact composition requires visual review.

The production `de1682a` stationary review showed the landed toast on the right counter with its own contact, ceramic fragments close to the pan handle, and the pan supported by the grate. Hiding the toast body and contact restored the clean counter. This accepts those bounded prop placements only; the remaining terminal architecture, floor debris, and Tier 1 state coverage still require authoring and visual review.

The `500724e` floor ceramic study and the smaller `f59f959` correction failed live visual review: the generated fragments read too bright and pasted on, with the cluster crossing the wood/rug boundary. Both study commits were reverted. No floor ceramic is accepted, and the separate floor debris slot remains open.

## Wood-floor fragment study

The next isolated floor sprite is body-only ceramic with no baked shadow. An image edit used the approved master solely for warm material and lighting reference; the master file itself remains authoritative and unchanged. The asset is displayed at (750, 547), 90×47, over exposed wood to the right of the rug. Its contact is derived from the body alpha as a separately switchable dark blur at a one-pixel drop. This placement avoids the earlier rug/wood crossing and remains an **unaccepted visual study** until a deployed room and hide/show review. The temporary rebuild budget is 17 files / 460,000 bytes; other budget ceilings are unchanged.

The deployed `d4a1126` review showed the fragments wholly on the right-hand wood floor, clear of the rug and cabinet toe kick. Body and contact switches work independently; hiding both exposes the original photographed wood with no leftover shard or patch. This passes the bounded floor body/support separation check. The ceramic remains supplemental study art and does not establish the full Tier 1 debris field, architectural damage, or a completed terminal composition.

## Tier 1 cabinet pose correction

The blueprint assigns Tier 1 `hinge-stressed` with the remaining stack `missing-one`. The local Tier 1 renderer had incorrectly reused the Tier 2 hanging-door pose and shifted that remaining stack 5×1 pixels. The stationary correction keeps the photographed door at rest, adds only the existing fine hinge-stress line, and seats the remaining photographed stack and its independent contact at their approved rest positions. Tier 2 retains the separate hanging-door study. This requires deployed inspection at room and enlarged cabinet scale before calling the pose accepted.
