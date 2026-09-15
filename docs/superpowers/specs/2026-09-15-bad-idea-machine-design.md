# Bad Idea Machine — Chain Jam Vol. 1 Design Specification

Date: 2026-09-15
Status: Approved design
Target: Chain Jam Vol. 1

## 1. Product Definition

**Bad Idea Machine** is a fast casino game built around a ridiculous Rube Goldberg machine.

Tagline: **One button. Several terrible decisions.**

The player chooses a wager and one of three volatility modes, then presses a large **DO NOT PRESS** button. Chain's verified randomness determines the economic result. The frontend then reveals that already-determined result through a short mechanical catastrophe. The longer the machine keeps functioning, the better the result appears to be.

The game must be understood without a tutorial, reach a result quickly, and make both wins and losses entertaining enough to encourage immediate replay.

## 2. Design Goals

1. Be recognizably different from dice, crash, limbo, mines, plinko, roulette, slots, and other common casino originals.
2. Be understandable within roughly three seconds of seeing the game.
3. Make the first wager possible within roughly ten seconds of load.
4. Use a mathematically transparent, auditable payout system with exactly 96.00% theoretical RTP in every risk mode.
5. Keep all economic randomness and settlement inside the required Chain SDK/contract flow.
6. Keep all cosmetic variation separate from economic outcome selection.
7. Produce a polished 2D game that loads very quickly and works well on desktop and mobile.
8. Favor animation timing, sound, and personality over feature count.

## 3. Non-Goals

The jam build will not include leaderboards, accounts, XP, achievements, NFTs, inventory, multiplayer, social login, custom wallet infrastructure, progression systems, backend analytics infrastructure, or a 3D engine.

These features are explicitly excluded unless required by the Chain SDK for eligibility.

## 4. Core Player Loop

1. Load game.
2. Choose wager.
3. Choose risk mode.
4. Press **DO NOT PRESS**.
5. Bet is submitted through the Chain bridge/SDK.
6. Chain VRF determines the verified random result.
7. Controls remain locked until the round is resolved or safely fails/refunds according to the reference SDK behavior.
8. Frontend receives the authoritative resolved outcome.
9. Frontend plays a 2–7 second reveal animation derived from outcome tier plus cosmetic seed.
10. Result multiplier and return are revealed.
11. A compact **WHAT WENT WRONG?** receipt is available.
12. Game returns immediately to ready state.

The animation must never decide or change the financial result.

## 5. Risk Modes and Paytable

All modes target exactly 96.00% RTP.

### Controlled

| Outcome | Probability | Total Return Multiplier | RTP Contribution |
|---|---:|---:|---:|
| Failure | 45% | 0.0x | 0.00% |
| Small | 35% | 1.2x | 42.00% |
| Medium | 15% | 2.0x | 30.00% |
| Big | 4% | 4.0x | 16.00% |
| Huge | 1% | 8.0x | 8.00% |
| **Total RTP** | | | **96.00%** |

Thresholds on a 0–9,999 roll:
- 0–4,499: Failure
- 4,500–7,999: Small
- 8,000–9,499: Medium
- 9,500–9,899: Big
- 9,900–9,999: Huge

### Send It

| Outcome | Probability | Total Return Multiplier | RTP Contribution |
|---|---:|---:|---:|
| Failure | 65% | 0.0x | 0.00% |
| Small | 20% | 1.5x | 30.00% |
| Medium | 10% | 3.0x | 30.00% |
| Big | 4% | 6.0x | 24.00% |
| Huge | 1% | 12.0x | 12.00% |
| **Total RTP** | | | **96.00%** |

Thresholds:
- 0–6,499: Failure
- 6,500–8,499: Small
- 8,500–9,499: Medium
- 9,500–9,899: Big
- 9,900–9,999: Huge

### Absolutely Not

| Outcome | Probability | Total Return Multiplier | RTP Contribution |
|---|---:|---:|---:|
| Failure | 80% | 0.0x | 0.00% |
| Small | 10% | 2.0x | 20.00% |
| Medium | 6% | 5.0x | 30.00% |
| Big | 3% | 10.0x | 30.00% |
| Huge | 1% | 16.0x | 16.00% |
| **Total RTP** | | | **96.00%** |

Thresholds:
- 0–7,999: Failure
- 8,000–8,999: Small
- 9,000–9,599: Medium
- 9,600–9,899: Big
- 9,900–9,999: Huge

### Multiplier Precision

On-chain payout math uses integer fixed precision only. Suggested representation:

- `MULTIPLIER_BASE = 10_000`
- `1.2x = 12_000`
- `1.5x = 15_000`
- `16x = 160_000`

Total payout semantics:

`totalPayout = wager * multiplier / MULTIPLIER_BASE`

A 1.2x multiplier means a total return of 1.2 times the wager, not 1.2 times profit plus stake.

The concrete integer type, overflow handling, wager units, and settlement call signature must follow the Chain coinflip reference implementation rather than introducing an incompatible abstraction.

## 6. Randomness Model

The game consumes Chain's verified random word via the exact reference SDK/contract pattern.

Economic and cosmetic randomness must be domain-separated conceptually:

- `payoutRandom = H(randomWord, "BAD_IDEA_PAYOUT")`
- `visualRandom = H(randomWord, "BAD_IDEA_VISUAL")`

Only `payoutRandom` may select the payout tier.

`visualRandom` may select animation routes, component variants, harmless failure messages, sound variations, and camera/effect variants. Cosmetic values must never affect money, probability, or settlement.

If the reference contract already exposes a safe pattern for deriving multiple deterministic values from the random word, follow that pattern. Do not invent a custom randomness mechanism outside the SDK.

## 7. Chain SDK Integration Boundary

The implementation must begin from Chain's current coinflip reference project and preserve its required integration shape.

Required Chain Jam constraints:

- Install/use `@chain/casino-sdk`.
- Start from or directly mirror the official coinflip example.
- Preserve the required **contract + bridge + manifest** integration model.
- Build and test against Chain's local simulator.
- Treat the simulator's VRF as the authoritative development randomness path.
- Host the final project as a standalone static build.
- Ensure it can also be embedded by the Chain Jam gallery.
- Include `<script async src="https://jam.chain.wtf/widget.js"></script>` on the game page.
- Do not add custom wallet, settlement, or randomness infrastructure unless the official reference requires it.

Exact SDK symbols, bridge function names, contract interface names, manifest field names, wager token details, and failure/refund APIs must be taken from the installed/current coinflip example at implementation time. The implementation must adapt Bad Idea Machine to the reference API instead of adapting the reference API to invented names in this document.

## 8. Frontend State Machine

The frontend uses the following high-level states:

- `BOOT`
- `READY`
- `SUBMITTING`
- `WAITING_FOR_RANDOMNESS`
- `REVEALING`
- `RESULT`

Allowed transitions:

`BOOT -> READY -> SUBMITTING -> WAITING_FOR_RANDOMNESS -> REVEALING -> RESULT -> READY`

A safe SDK-reported failure/refund path may transition from `SUBMITTING` or `WAITING_FOR_RANDOMNESS` to a non-loss error state and then back to `READY`.

A failed/aborted SDK transaction must never be presented as a gambling loss.

During `REVEALING`:
- wager/risk controls are disabled;
- financial outcome is immutable;
- animation may be skipped only if needed for recovery/accessibility, without changing settlement;
- repeated button presses cannot create duplicate wagers.

## 9. Machine Component System

The jam version has nine principal components:

1. Button
2. Toaster
3. Cat
4. Hammer
5. Bowling Ball
6. Fan
7. Dominoes
8. Rocket
9. Safe
10. Bad Idea Core (final device; treated as the finale rather than an ordinary station)

Each component is an independent visual module with small, explicit states such as:

- `idle`
- `armed`
- `triggered`
- `success`
- `failure`
- `destroyed`

Components may expose cosmetic variants, for example:

- toaster: normal launch / double launch / jam / burnt
- cat: jump left / jump right / wire attack / refusal
- rocket: clean launch / sideways / sputter / explosion

The animation coordinator composes these components into routes. Components must not know wager math or settlement logic.

## 10. Outcome-to-Animation Routing

The payout tier controls the approximate reveal length and maximum machine depth.

### Failure
- 2–3 seconds.
- Several possible early-stop routes.
- Examples: fuse blows, toast jams, cat refuses, hammer misses.
- All routes remain financially identical 0x outcomes.

### Small
- 3–4 seconds.
- Roughly 3–4 successful machine events.

### Medium
- Roughly 4 seconds.
- Roughly 5–6 successful events.

### Big
- Roughly 5 seconds.
- Almost all ordinary components activate.

### Huge
- 6–7 seconds maximum.
- Entire machine activates.
- Bad Idea Core comes online.
- Machine appears suspiciously stable for a short beat, then catastrophically succeeds.
- Highest multiplier appears after the climax.

The multiplier must not appear before the animation reveal reaches its designed terminal point.

## 11. Visual Direction

Style: **1950s industrial safety manual + mad scientist laboratory + polished 2D cartoon machine**.

Avoid:
- photorealistic AI art;
- generic neon Web3 dashboards;
- heavy 3D rendering;
- massive sprite sheets;
- unrelated generated assets with inconsistent style.

Preferred visual implementation:
- SVG for machine components and icons;
- CSS transforms/animations where appropriate;
- lightweight Canvas only where it materially improves particles, sparks, debris, or camera effects;
- reusable component animation primitives.

Palette:
- charcoal / near black background;
- dirty cream/off-white machinery;
- muted steel;
- warning yellow;
- emergency red;
- limited toxic/indicator green.

Bright colors are reserved for functional state changes and dramatic escalation.

Typography should be bold, condensed, industrial, legible on mobile, and used consistently.

Humor should be sparse and mechanical rather than meme-heavy.

## 12. Risk Mode Presentation

### Controlled
- green safety indicators;
- calm idle hum;
- copy such as `SAFETY SYSTEMS: ENABLED`.

### Send It
- protective covers open;
- amber warnings;
- machine becomes visibly less stable;
- copy such as `SAFETY SYSTEMS: OPTIONAL`.

### Absolutely Not
- red emergency lighting;
- multiple override indicators;
- harmless pre-round fire/sparks;
- button copy may escalate from `DO NOT PRESS` to `SERIOUSLY. DON'T.`;
- short sequence such as `OVERRIDE 1 ✓ / OVERRIDE 2 ✓ / COMMON SENSE ✕`.

Risk selection changes presentation immediately but never triggers a wager until the main action button is pressed.

## 13. Sound Design

The machine itself forms the soundtrack. Constant background music is optional and not required for the jam build.

Per-component sound banks include small compressed samples or synthesized effects for:
- switches/relays;
- springs;
- motors;
- toaster ding/jam;
- cat reactions;
- metal impacts;
- rolling ball;
- fan spin-up;
- domino cascade;
- rocket ignition/flight/explosion;
- safe impact;
- Bad Idea Core startup/alarm;
- win and failure stingers.

Successful stages layer rhythmically so longer wins feel musically richer.

A persistent, obvious mute/sound toggle is required. Autoplay/browser audio restrictions must be respected by initializing audio from player interaction.

## 14. Layout and Responsive Behavior

### Desktop
- Machine occupies roughly 70–80% of visual emphasis.
- Compact wager/risk/action panel sits beside or overlays the machine without obscuring it.
- Minimal header.
- No dashboard-style navigation.

### Mobile
- Machine remains the main visual area.
- Bet/risk/action controls become a compact lower panel.
- During reveal, controls may collapse to maximize animation space.
- All primary actions must be comfortable for touch and remain visible without horizontal scrolling.

The standalone page must remain playable at common phone widths and desktop widths.

## 15. Result and Fairness Receipt

After a resolved round, a compact drawer/card is available:

**WHAT WENT WRONG?**

It should contain, where available from the official SDK/reference flow:
- selected risk mode;
- wager;
- machine route summary;
- multiplier;
- total return;
- authoritative round/transaction/verification identifier(s);
- verified randomness indicator.

The receipt must expose real Chain-provided verification data only. It must not invent a fake proof format.

Example visual route summary:

`BUTTON -> TOASTER -> CAT -> HAMMER -> BALL -> FAN -> 3.00x`

## 16. Failure and Recovery Behavior

- Duplicate wager submission must be prevented in the UI and bridge call layer.
- SDK/contract errors must surface as machine/startup errors, not as gambling outcomes.
- If the official flow supports refunds or timeout recovery, preserve that behavior exactly.
- Reload/reconnect handling should use the reference project's supported behavior; do not fake settlement state locally.
- Animation errors must not affect already-settled money.
- If an animation component fails, the game may fall back to a minimal result reveal while keeping the authoritative outcome.

## 17. Performance Requirements

The game should feel near-instant on first load.

Implementation constraints:
- no background video;
- no heavy 3D engine;
- no large uncompressed audio;
- lazy-load rare finale effects after the critical game shell;
- preload common sounds after first user interaction;
- prefer vector assets and procedural effects;
- avoid unnecessary runtime dependencies.

Performance targets for implementation testing:
- usable game shell visible immediately after app boot on a normal broadband connection;
- no long blocking intro;
- common round assets available before the first reveal whenever practical;
- animation remains smooth on a typical mid-range mobile device and laptop.

## 18. Jam Widget and Hosting

The production page must include:

```html
<script async src="https://jam.chain.wtf/widget.js"></script>
```

Hosting requirements:
- standalone playable URL;
- static deployment compatible with Vercel, Netlify, or equivalent;
- no headers/policies that unnecessarily prevent Chain's gallery iframe from embedding the game;
- same submitted URL should be updateable through the jam deadline.

## 19. Testing Strategy

### Contract / economic tests

At minimum:
- every roll from 0 through 9,999 maps to exactly one outcome for every mode;
- bucket counts match declared probabilities exactly;
- boundary values map correctly;
- every mode computes exactly 96.00% theoretical RTP from the implemented paytable;
- payout multipliers match declared values;
- integer payout rounding follows the reference contract's expected money semantics;
- invalid risk mode/input is rejected according to the reference contract conventions;
- VRF result is the only economic randomness source;
- cosmetic derivation cannot alter payout tier.

### Bridge/integration tests

Using the local simulator/reference harness:
- place wager successfully in every mode;
- receive authoritative resolved outcome;
- map response to the correct frontend outcome tier;
- prevent duplicate submissions;
- handle simulator/SDK failure safely;
- preserve any official timeout/refund path;
- run multiple consecutive rounds without stale state.

### Frontend tests

- state transitions are valid;
- controls lock during an active round;
- result reveal waits for authoritative outcome;
- each payout tier has at least one valid route;
- multiple cosmetic variants do not change payout display/return;
- mute setting works;
- desktop and mobile controls remain usable;
- standalone page works outside an iframe;
- jam widget is present in production build.

### Manual quality pass

Before submission:
- play at least 100 local rounds across all modes;
- intentionally trigger/reproduce integration errors;
- inspect every route/variant for clipping and timing defects;
- test muted/unmuted;
- test narrow mobile viewport and common desktop viewport;
- test direct URL load and iframe-compatible load;
- inspect network payload for unexpectedly large assets;
- compare implemented paytable directly with README/submission RTP declaration.

## 20. Minimum Polished Content Set

Before adding any stretch content, the build must have:
- all three risk modes;
- all five economic outcome tiers;
- at least 4 visually distinct failure routes;
- at least 2 small-win route variants;
- at least 2 medium-win route variants;
- at least 2 big-win route variants;
- at least 2 huge-win cosmetic variants or finale variations;
- finished sound for every principal component;
- responsive desktop/mobile layout;
- fairness receipt;
- local simulator compliance;
- jam widget;
- standalone production build;
- README with exact RTP math and run instructions.

Additional variants are stretch work only after this set is stable.

## 21. Suggested Repository Boundaries

Exact folders should follow the coinflip reference repository where possible. Game-specific code should remain isolated conceptually as:

- `contract/` or reference-equivalent — paytable/risk/result logic only;
- `bridge/` or reference-equivalent — minimal adapter preserving Chain conventions;
- `frontend/game/` — state coordinator;
- `frontend/machine/` — visual components and route sequencing;
- `frontend/audio/` — sound registry/playback;
- `frontend/fairness/` — result receipt presentation;
- `manifest` — official required game metadata;
- `tests/` — economic, integration, and frontend tests.

Do not reorganize the official example merely to match these names. Prefer the reference project's structure and create similarly focused modules inside it.

## 22. Submission README Requirements

README must clearly state:
- game concept in one sentence;
- how to install/run;
- how to start the Chain local simulator;
- how to run tests;
- exact 96.00% RTP tables for all three modes;
- statement that multipliers are total-return multipliers;
- architecture note that animation does not determine settlement;
- standalone demo URL once deployed;
- jam integration notes required by the official submission process.

## 23. Acceptance Criteria

The game is ready to submit only when all of the following are true:

1. Official Chain SDK integration works through contract, bridge, and manifest.
2. Local simulator can complete repeated wagers using its VRF path.
3. Actual implemented paytable matches this document and declared 96.00% RTP.
4. No frontend code can change or fabricate an economic outcome.
5. Three risk modes are playable and visually distinct.
6. Five result tiers reveal correctly.
7. Losses have entertaining variants rather than a single dead-state animation.
8. Huge win has a clearly premium finale.
9. Sound design is complete and muteable.
10. Game is responsive on desktop and mobile.
11. Standalone production URL works.
12. Page is iframe-compatible where hosting permits.
13. Jam widget is loaded.
14. Fairness receipt uses real Chain-provided identifiers/data.
15. Source and README make RTP verification straightforward for judges.
16. No known broken/half-finished feature is exposed in the submitted build.

## 24. Implementation Principle

**Polish one five-second interaction rather than building ten secondary systems.**

Every implementation decision should be evaluated against whether it improves:
- novelty;
- repeated-play fun;
- immediate comprehension;
- visual/sound quality;
- SDK correctness and auditability.

If it does not materially improve one of those areas before the deadline, it is out of scope.
