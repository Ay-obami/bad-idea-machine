# Bad Idea Machine: living-room rebuild design

Status: approved by the user before implementation. Checkpoint status and evidence are tracked in the companion plan.
Baseline: 3f610e04884f431f478d79f28b28ce6af34918e5.

## Product contract

The player chooses Kitchen or Garage, selects a clearly explained risk profile and wager, and presses a button. The pictured room comes alive through connected, believable accidents. Objects move from their actual places, strike actual surfaces, and leave persistent damage. Chain settlement remains authoritative.

The user's corrections supersede earlier visual specs and plans wherever they conflict:

- R1: Improve actual artwork and composition quality, including coherent lighting, perspective, object scale, edges, shadows, and readable controls. Merely increasing resolution does not satisfy this.
- R2: The initial selector contains exactly two intact-room choices: Kitchen and Garage. No destruction gallery or payout cards in that selector.
- R3: The picture is the scene to reconstruct and animate. A static picture behind floating, unrelated objects is explicitly unacceptable.
- R4: Destruction is causally connected and persists until the player starts another round. A full-frame aftermath swap cannot substitute for destruction animation.
- R5: Room selection remains cosmetic. Existing three paytables and SDK interfaces remain unchanged unless a separate, evidenced correctness fix requires a reviewed contract change.
- R6: Paytable labels, risk descriptions, fairness states, and demo identity must be truthful.
- R7: Interrupted rounds, missing assets, verification failures, navigation, mute, and reduced motion have explicit behavior.
- R8: Work proceeds through reviewable checkpoints. The assistant does not deploy to Vercel; each checkpoint identifies the exact source/build to deploy and what to inspect.

## Approach and trade-offs

Recommended: a fixed-camera 2.5D room assembled from coherent, independently controllable layers. React owns the interface; an isolated scene renderer owns room transforms and animation. One logical 1000x600 canvas governs every surface, object, mask, effect, and shadow. Letterbox as needed; never crop the room separately from its actors. Start with existing web rendering capabilities and only add a rendering dependency if the first visual proof demonstrates a concrete need.

Alternative: full 3D reconstruction offers stronger depth and lighting but requires substantially more modeling, texture, physics, and performance work. It is not the default for this jam schedule.

Alternative: generated video offers cinematic motion but complicates continuous room state, variation, mobile payload, and result transitions. It is not the default runtime.

The 2.5D choice is provisional until checkpoint 2 demonstrates convincing visual continuity. Failure means revisit assets/rendering explicitly, not lower the quality bar or silently ship floating sprites. Inspect available images at native resolution; if usable layered sources are absent, generate/edit coherent replacement assets or obtain the source material. Preserve asset provenance and do not claim missing layers already exist.

## Scene behavior

Each movable object has a rest transform, attachment or support, pivot, material, depth, and intact/damaged appearances. Removing it reveals a reconstructed surface, not a second copy baked into the room. Front surfaces occlude objects correctly. Contact shadows track supported objects; airborne movement has deliberate weight and trajectory.

A seeded causal event graph drives accidents. A hit triggers the next event; arbitrary independent timers do not establish causality. Collision points and effect origins use the same geometry. Damage is scene state: broken hinges, displaced objects, fragments, scorch, and smoke survive until reset.

Kitchen proof: toaster anchored on counter -> toast launch -> cabinet hinge reaction -> plates fall onto counter. Full kitchen adds a spill/burner/fire sequence with physically consistent causes. Garage proof/full sequence: supported tool or fastening failure -> shelf/chain reaction -> tire roll -> contact with a toolbox or another anchored object -> lasting debris/damage. Remove rockets/safes unless their origin/support and role are visually credible.

Use a small number of authored, convincing variants before expanding variation. Core progression is payout-blind until a clearly identified final reveal beat; that beat may express the settled tier. Documentation must say this exactly, not claim all-tier identical choreography. No player action changes an already-settled outcome.

## Game lifecycle and trust

Separate host settlement from presentation. Preserve pending and settled-but-unseen rounds, snapshot identity, selected room, and latest/history receipts. Reconcile records with the host by account, chain, game, and session identity. Presentation/reveal acknowledgements are idempotent; a transport error does not imply a transaction failed.

Surface bounded waits and retryable connectivity/verification errors. Never auto-repeat a possibly submitted wager. The host remains responsible for cancellation/refunds under its SDK rules; do not invent guest refund authority.

Verification states: pending, verified, failed, unavailable, unsupported, and local-demo. Display full copyable identifiers, supported explorer links, randomness/roll/payout calculation where available, and explicit failures. The selected mode discloses loss probability, total-return paytable, and maximum. Document base-unit rounding and enforce demo wager increments compatible with the declared RTP; determine live rounding handling against the actual host constraints.

Demo balances survive room navigation and reload within the demo session, with an explicit reset. Host funds never depend on that demo storage. Mute controls a master audio gain and pending playback; reduced motion changes the JS scene behavior as well as CSS. An optional shorter reveal preserves settlement and acknowledgement correctness.

## Delivery constraints

Maintain Node 22+, React/Vite, the Chain bridge/manifest/widget, standalone play, and local simulator compatibility. Add a tracked dependency lockfile and deterministic installs. Treat existing budget limits as initial limits; measure startup and animation before requesting any justified increase. Load only the selected room's play assets eagerly. Keep outcome prefetch independent of the actual result or use generic fallbacks.

The supplied jam deadline is September 20, 2026, 23:59 UTC. It informs scope prioritization, not a promise of completion or permission to bypass acceptance criteria.

## Acceptance and non-goals

Both rooms must pass desktop and mobile visual review, coherent idle composition, causally connected motion, persistent damage, truthful math, complete demo and hosted rounds, recovery, and accessibility checks. Test success alone does not establish visual quality.

No new leaderboard, standalone wallet custody/signing flow, multiplayer, additional rooms, new casino mechanic, or contract/paytable redesign is included. Remove unimplemented navigation instead of expanding scope. No automatic Vercel deployments or deployment-triggering branch pushes.
