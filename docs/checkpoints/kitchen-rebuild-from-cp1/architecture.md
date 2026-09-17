# Kitchen rebuild from Checkpoint 1

Baseline: `16b1f2bee070795b961d813d37e7276d8961303a`

## Why the visual pipeline is being restarted

The prior Checkpoint 2 line proved that a narrow proof can look convincing while still becoming a dead end for the complete Kitchen. The later expansion had to introduce room-external props and a second visual layer, which broke R1/R3/R4: objects stopped looking native to the photograph, contacts stopped feeling physical, and destruction read as overlays rather than changes to one room.

This branch does not inherit that renderer or its generated Kitchen assets.

## Master-first room-native contract

Checkpoint 2 is being re-executed from the Checkpoint 1 game/UI baseline with these stricter invariants:

1. **One authored intact Kitchen master first.** The whole future interaction area is designed before motion work begins. The range/stove is fully readable, the toaster is supported on the counter, the relevant cabinet/plate shelf is visible, and future pan/spill/fire action has usable room.
2. **Rest state is the master itself.** At time zero, no duplicate actor sprite is drawn over the room. This removes rest-state registration seams and pasted-on props.
3. **Moving sprites come from the same master.** A hero object is extracted from its exact master pixels with an authored silhouette/mask. It is not replaced by a separately generated lookalike.
4. **Only a local clean patch is revealed when an object leaves home.** The reconstructed surface behind an object is registered to that same master. The rest of the room remains untouched.
5. **Damage is local and persistent.** Broken hinges, scorch, chips, fragments and other consequences are localized layers/patches tied to contact events. Full-frame aftermath substitution is not a destruction mechanism.
6. **One logical 1000×600 coordinate system.** Master image, masks, patches, actor pivots, contacts, shadows and damage share the same geometry and letterbox transform.
7. **Art gate precedes motion.** The intact Kitchen master must pass visual review before object extraction or animation begins. The first motion gate then proves one causal chain before any complete-room expansion.

## Kitchen master composition target

The master should preserve the warm photoreal visual language of the original reference while being authored for interaction rather than retrofitted later:

- range/stove fully in frame with visible burners and surrounding counter;
- pan already resting naturally on a burner, with credible handle clearance;
- toaster already resting on the counter close enough to a cabinet interaction zone;
- cabinet/plate storage directly readable above or adjacent to that counter;
- plates physically supported in the cabinet/shelf;
- kettle and other secondary props present from frame zero when they are part of later sequences;
- enough visible counter/floor area for falling ceramic, spill travel, fire origin and persistent debris;
- no rocket/safe/heavy prop unless its storage/support is visually credible.

The exact object coordinates are authored only after the approved master exists.

## Architecture decision

This remains a fixed-camera 2.5D implementation, which is the plan's preferred architecture. What changes is the asset pipeline: the room is no longer a background that later receives separately generated props. The master is the source of truth for both the intact frame and every extracted actor/local patch.

A move to full 3D is not being made at this point. If this stricter master-first proof still fails R1/R3/R4, the plan explicitly requires revisiting the rendering approach rather than lowering the quality bar.

## Verification boundary

The causal room model can be implemented before art because it contains no room-specific pixels or coordinates. Kitchen manifests, actor masks, pivots, paths, VFX and complete sequence work remain blocked on the intact-master visual gate.
