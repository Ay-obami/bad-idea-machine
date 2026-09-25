# Bad Idea Machine living-room rebuild implementation plan

> For agentic workers: use superpowers:executing-plans to implement this plan inline, checkpoint by checkpoint. Do not dispatch subagents without explicit user authorization. Track work with the checkboxes below.

**Goal:** Deliver one believable Kitchen that comes alive and sustains causal destruction, with truthful and recoverable casino gameplay. Garage Mayhem is cancelled for this release because the remaining time is insufficient.

**Architecture:** Separate React navigation/controls, durable round lifecycle, and deterministic room presentation. Reconstruct the reference room into coherent controllable layers within one logical coordinate system. Prove the rendering approach with a kitchen interaction before building both complete rooms.

**Tech stack:** Existing Node 22+, React, TypeScript, Vite, viem, Chain SDK/Solidity, Vitest, browser verification, Web Audio. Rendering additions require demonstrated need at checkpoint 2.

**Spec:** `docs/superpowers/specs/2026-09-17-living-room-rebuild-design.md` supplies the original requirements; this Kitchen-only scope revision supersedes its Garage requirements and its two-choice selector.

**Status:** Approved by the user; checkpoint 0 is documentation only. No checkpoint is complete until its evidence is recorded.

## Global constraints and drift prevention

- Applicable Kitchen and economic requirements R1–R8 in the spec are mandatory. The user's latest room/animation corrections override previous visual plans.
- Exactly one intact Kitchen entry. No Garage entry or outcome gallery in the opening screen.
- One coherent room coordinate system. No static room plus unrelated floating props. No aftermath-image replacement presented as destruction.
- Existing paytables, SDK, and payout authority stay intact except separately justified correctness fixes.
- Never call a visual checkpoint complete based solely on element counts, screenshots existing, or unit tests passing.
- Before each checkpoint, read its acceptance criteria. Afterward record files, commit, commands/results, screenshots or clip evidence, remaining defects, and deployment handoff here.
- Keep a requirement-to-evidence table. Any scope/architecture change must state the reason and affected acceptance criteria before work proceeds.
- Work on an isolated implementation branch; retain baseline 3f610e0. Do not merge/push main or vercel-static because existing integrations can deploy automatically.
- The assistant performs local verification; the user deploys to Vercel. Never invent a commit SHA or claim a checkpoint is remotely available when it is only local.

## Checkpoint ledger

| Checkpoint | Deliverable | Status | Deploy instruction |
|---|---|---|---|
| 0 | This plan + design | Approved | No deployment: documentation only |
| 1 | Kitchen entry and truthful controls | Kitchen-only revision code pending verification | Preview Kitchen entry and controls |
| 2 | Convincing kitchen visual proof | Pending | Preview checkpoint 2; inspect idle and contact sequence before expanding art |
| 3 | Complete kitchen destruction | Pending | Preview checkpoint 3; play repeated kitchen demo rounds |
| 4 | Recovery, fairness, accessibility, and controls | Pending | Preview checkpoint 4; hosted flows also require the local simulator |
| 5 | Verified release candidate | Pending | Production candidate only after all acceptance gates pass |

## File ownership and interfaces

Paths in the task lists below are relative to `sdk/casino-sdk/examples/bad-idea-machine/` unless they begin with `sdk/`, `.github/`, or `docs/`.

- `src/main.tsx`, `src/gallery/GalleryScreen.tsx`: Kitchen entry only.
- `src/App.tsx`: assembly of round controller, selected room, and screens; migrate lifecycle logic into `src/lib/round-controller.ts` and `src/lib/round-storage.ts` at checkpoint 4.
- `src/lib/badIdea.ts`: economic table/codec helpers; authoritative money remains in the contract.
- `src/components/ControlPanel.tsx`, new `src/components/Paytable.tsx`: truthful selected-mode wager information.
- New `src/scene/room-model.ts`, `room-timeline.ts`, `room-state.ts`: shared geometry, causal event scheduling, persistent destruction state.
- `src/play/RoomStage.tsx`, `RoomObject.tsx`, `src/components/EnvironmentStage.tsx`, `SceneVfx.tsx`: renderer and orchestration, replacing inconsistent old prop/timer behavior.
- `src/environments/kitchen/manifest.ts`, `public/rooms/kitchen/`: coherent layered Kitchen assets and geometry.
- `src/lib/audio.ts`: cancellable spatial/material audio and master mute.
- `src/components/FairnessReceipt.tsx`, `src/lib/useCasinoHost.ts`: explicit verification and connection outcomes.

Proposed scene contract (define in `src/scene/room-model.ts` at checkpoint 2):

```ts
export type Point = Readonly<{ x: number; y: number }>;
export type RoomEvent = Readonly<{
  id: string;
  objectId: string;
  after?: string;
  delayMs: number;
  durationMs: number;
  contact?: Point;
  damageId?: string;
}>;
export type RoomState = Readonly<{ damageIds: readonly string[] }>;
// room-state.ts: deterministic, duplicate-safe damage accumulation.
export function applyRoomEvent(state: RoomState, event: RoomEvent): RoomState;
// room-timeline.ts: reject cycles/missing dependencies; derive absolute event times.
export function compileRoomTimeline(events: readonly RoomEvent[]): readonly (RoomEvent & { startMs: number })[];
```

The detailed rendering manifest must also carry authored rest transforms, pivots, depth/occlusion and asset sources; define those against inspected/generated assets during checkpoint 2, before starting either complete room. This is a deliberate feasibility checkpoint, not a claim that existing images are production-ready.

## Checkpoint 1 — Honest Kitchen entry and betting interface

Files: modify `src/gallery/{GalleryScreen,EnvironmentRow,OutcomePreviewCard}.tsx`, `src/gallery/gallery-data.ts`, `src/components/ControlPanel.tsx`, `src/play/GameScreen.tsx`, `src/styles/reference-gallery.css`, `src/styles/reference-play.css`; create `src/components/Paytable.tsx`. Update `src/gallery/gallery-data.test.ts`. Add lockfile in `sdk/casino-sdk/` and use `npm ci` in verification workflows once proven.

- [x] Replace the 12-card destruction gallery with one intact Kitchen entry. Garage is removed from the active entry and this release scope.
- [x] Remove unimplemented wallet/leaderboard/navigation controls. Provide useful rules/paytable access; describe hosted wallet requirements without inventing a standalone wallet flow.
- [x] Derive mode disclosures from `PAYTABLES`: loss probability, total-return multipliers, maximum return. Remove 100x marketing. Explain rounding and demo identity.
- [x] Fix narrow balance and room controls; provide accessible selected state and expandable disclosure semantics.
- [x] Replace the incorrect gallery-label test with a Kitchen-only invariant and paytable-derived bounds. Example economic guard using existing helpers:

```ts
expect([0, 1, 2].map(mode => maxMultiplierX(mode as RiskMode))).toEqual([8, 12, 16]);
```

- [ ] Inspect desktop 1366x768 and 1440x1000, mobile 390x844 and 360x800: room choice obvious, no horizontal overflow, no truncated money, key controls comfortably touchable.
- [x] Run unit/type/build checks. Commit the checkpoint and append deployment handoff.

Acceptance: exactly one Kitchen entry; no impossible payouts; selectable risks have visible numeric meaning; all visible controls work. Existing graphics remain a recorded unfinished item.

## Checkpoint 2 — Visual feasibility and quality gate

Files: inspect/rework kitchen assets and manifest; create scene model/timeline/state modules; modify `RoomStage.tsx`, `RoomObject.tsx`, `EnvironmentStage.tsx`, `src/styles/reference-room.css`. Add `src/scene/room-state.test.ts` and `room-timeline.test.ts`.

- [ ] Inspect reference/available assets at original resolution and make a contact sheet for internal review. Record which images are usable and which require coherent replacement; do not upscale degraded art as a quality fix.
- [ ] Build a complete intact kitchen composition with matching lighting/perspective. Separate toaster, toast, cabinet door and plates; reconstruct the surfaces behind them and necessary occlusion/shadow layers. Use image editing/generation capabilities for raster authoring, not improvised programmatic painting.
- [ ] Anchor all artwork to 1000x600 logical coordinates. Preserve its aspect ratio with a single scale/letterbox transform across background, objects, effects and hit locations.
- [ ] Implement toaster -> toast -> cabinet -> plates as a causal sequence. Use hinge pivots, deliberate acceleration, contact at visible surfaces, and lasting fragments/damage.
- [ ] Implement and test duplicate-safe persistent damage and event dependency scheduling. Minimum state regression:

```ts
const state: RoomState = { damageIds: [] };
const event: RoomEvent = { id: 'cabinet-hit', objectId: 'cabinet', delayMs: 0,
  durationMs: 250, damageId: 'broken-hinge' };
expect(applyRoomEvent(applyRoomEvent(state, event), event).damageIds)
  .toEqual(['broken-hinge']);
```

- [ ] Inspect idle, launch, contact, and aftermath at desktop and mobile dimensions. Capture a short motion example: no duplicate toaster in background, no float at rest, contact effects at contact, same room before/after, damage persists.
- [ ] Record visual result and show it at this checkpoint. If the method cannot meet R1/R3/R4, revise it here before producing the other assets; do not declare a pass from tests alone.

Acceptance: believable anchored composition and one connected interaction. Full game integration and all outcomes are not claimed yet.

## Checkpoint 3 — Complete Kitchen Meltdown

Files: kitchen manifest/assets; `src/scene/scene-script.ts`, new room model/timeline/state; `EnvironmentStage.tsx`, `SceneVfx.tsx`; audio modules; retire runtime full-frame aftermath substitution in `AftermathController.tsx` after the replacement is verified.

- [ ] Expand the proven chain with locally consistent spill, ignition, cabinet damage, fragments and accumulating smoke. Keep the affected surfaces controllable.
- [ ] Author at least three coherent kitchen sequence variants; randomize only valid causes, timing and trajectories. A disconnected event is not variation.
- [ ] Use shared payout-blind progression followed by an explicit final tier reveal. Map each of five tiers to consistent final room state and actual selected-mode multiplier.
- [ ] Reset the complete room deterministically for the next round. Preserve the last damage state until that reset.
- [ ] Synchronize audio to contact events with appropriate materials and spatial origin. Eliminate full-frame image jumps as the destruction mechanism.
- [ ] Exercise all five tiers with deterministic fixtures plus repeated normal demo play. Compare before/contact/after imagery and review the motion, not only element movement.
- [ ] Commit and record the exact kitchen preview deployment and remaining Kitchen work.

Acceptance: full kitchen round is visually coherent through idle, arming, destruction, result and reset; no early multiplier leak; no scene-to-result discontinuity.

## Checkpoint 4 — Reliable rounds, verification and accessibility

Files: `src/App.tsx`, new `src/lib/round-controller.ts`, `round-storage.ts`, `src/lib/useCasinoHost.ts`, `src/components/FairnessReceipt.tsx`, `src/lib/audio.ts`, `src/play/GameScreen.tsx`, preload and view-state modules. Add lifecycle and audio behavior tests alongside those modules.

- [ ] Move round lifecycle behind explicit opening/waiting/settled-unseen/revealing/done/retryable states with account/chain/game/session scoping. Recover waiting and settled-but-unseen sessions from host data; local records are presentation hints only.
- [ ] Cover reload while opening, settlement while closed, delayed snapshots, disconnect/reconnect, wallet scope switch, cancellation and uncertain submission. Do not auto-resubmit wagers. Make reveal acknowledgements retryable and idempotent.
- [ ] Retain recent receipts and demo balance across room navigation/reload, with explicit demo reset. Distinguish stale/incomplete host information from a proven zero payout.
- [ ] Add verification states pending/verified/failed/unavailable/unsupported/demo; retry retrieval errors, display proof failures prominently, and expose copyable identifiers and reproducible roll/payout evidence when available.
- [ ] Prevent indefinite asset loading with bounded waits/retry and generic result fallbacks. Asset selection/loading before reveal must not depend on winning tier.
- [ ] Apply master mute to playing and pending audio. Cancel obsolete audio work on navigation/reset. Reduced motion skips or simplifies JS movement and preserves settlement/results; provide shorter reveal behavior without changing money.
- [ ] Cover invalid/overprecision wagers and base-unit rounding. Maintain exact economic tables; any live minimum/increment or contract change must explicitly explain SDK compatibility and whether separate contract deployment is needed.
- [ ] Verify held/displayed balances and acknowledgement behavior in the actual host bridge, not only pure reducer tests. Commit and record preview instructions and local-only host test evidence.

Acceptance: no lost receipt from ordinary navigation; no unexplained infinite waits; no false verification success; replay/retry cannot debit or credit a round twice; sound and motion preferences govern the complete presentation.

## Checkpoint 5 — Release evidence and deployment handoff

Files: `.github/workflows/{bootstrap-sdk,publish-static,visual-smoke}.yml`, `sdk/casino-sdk/package.json` and lockfile, `scripts/{verify-build,visual-regression,simulate-flows}.mjs`, room/audio URL helpers, `README.md`, `ELIGIBILITY.md`, `SUBMISSION.md`, `vercel.json` if its commands require adjustment.

- [ ] Run deterministic contract fixtures for every tier/mode, invalid inputs and rounding boundaries, alongside the existing real local-VRF settlement soak. Assert actual balance deltas, not merely successful balance reads.
- [ ] Exercise complete hosted and standalone flows, including recovery, at mobile and desktop sizes. Add visual baseline comparisons for fixed scenes while retaining human motion review.
- [ ] Check console errors, slow/missing asset recovery, reduced motion, mute during loads, duplicate interactions, and subpath hosting. Resolve root-relative room/audio URLs using the configured base.
- [ ] Use tracked lockfiles and fail if expected test scripts are missing. Ensure publishing cannot race ahead of required checks; avoid automatically triggering a deployment during development.
- [ ] Measure selected-room startup and animation on desktop/mobile conditions. Initial targets: useful selector within 2 seconds on a 10 Mbps/100 ms cold-load profile, smooth desktop animation near 60 fps and mobile at least 30 fps where measurable. Label unavailable device/performance measurements honestly; do not claim physical-device results from emulation.
- [ ] Preserve existing bundle guardrails unless measured art requirements justify a documented adjustment. Do not preload multiple full rooms or full videos to mask design problems.
- [ ] Update documentation to the actual implementation: causal 2.5D destruction, explicit final reveal beat, real asset technology, exact current math, actual test coverage and deployment requirements. Remove obsolete path/feature claims.
- [ ] Run the final command checklist and record results before marking release ready.

Commands from `sdk/casino-sdk/`:

```bash
npm ci
npm run test:bad-idea
npm --prefix examples/bad-idea-machine run check-types
npm --prefix simulator run compile-contracts
npm run build:bad-idea
npm --prefix examples/bad-idea-machine run verify-build
npm --prefix examples/bad-idea-machine run verify-room-assets
npm --prefix examples/bad-idea-machine run verify-audio-assets
```

Start the local simulator using `npm run start:bad-idea`, wait for actual ready/deployment output, then run `npm run simulate:bad-idea` in a separate terminal. Browser checks must include hosted UI interaction as well as standalone; the direct-contract soak does not cover the bridge UI. Update asset validators to meaningful manifest completeness checks instead of preserving obsolete exact file counts.

## Mandatory handoff at every checkpoint

```text
Checkpoint: number + name
Status: passed / partial / blocked (with concrete reason)
Source: actual branch and full commit SHA; local-only or pushed availability
Changes: completed acceptance criteria
Evidence: actual commands/results + visual evidence where applicable
Known remaining issues: explicit list
Vercel: no deployment / preview recommended / production candidate
Deploy: exact source commit or built dist directory; no invented archive
Inspect: 3–5 specific interactions and expected outcomes
Contract deployment: not required / separately required with explanation
Next checkpoint: number + scope
```

Current source-based Vercel settings, to recheck at each handoff: repository root as project root; install `cd sdk/casino-sdk && npm ci` after the lockfile is committed; build `cd sdk/casino-sdk && npm run build:bad-idea && npm --prefix examples/bad-idea-machine run verify-build`; output `sdk/casino-sdk/examples/bad-idea-machine/dist`. A built-static deployment uses the contents of that dist directory as its root. Do not deploy the simulator or private development data. Vercel does not deploy Solidity contracts.

## Coverage checklist

| Requirement / review finding | Checkpoints |
|---|---|
| R1 graphic quality, cramped layout, coordinate mismatch | 1, 2, 3, 5 |
| R2 Kitchen entry; dead links; impossible payout gallery | 1 |
| R3 picture comes alive; R4 causal persistent destruction | 2, 3 |
| R5 Chain compatibility and cosmetic room presentation | 1, 3, 4, 5 |
| R6 actual odds, final-reveal claims, honest proof states, rounding | 1, 3, 4, 5 |
| R7 recovery, demo continuity, asset failures, mute/reduced motion | 4, 5 |
| R8 checkpoint discipline and user Vercel deployment | Every checkpoint |
| Weak tests, absent lockfile, deployment race, subpath assets, stale docs | 1, 5 |

## Execution record

- Checkpoint 0: design and plan written against baseline 3f610e0 and user's explicit corrections. Self-review: every R1–R8 requirement and review category mapped above. User approved the plan before checkpoint 1 implementation; no checkpoint 0 runtime changes or deployment.


### Checkpoint 1 implementation record

- Implemented on isolated worktree branch `feat/living-room-rebuild` after user approval, inline without subagents.
- Two intact-room selections now replace the destruction gallery; removed its unused outcome-card component and dead wallet/leaderboard controls. Native expandable rules explain demo play and room-independent odds.
- Added a paytable derived from existing economic tables, risk-button loss/max-return disclosures, stake-inclusive return and rounding explanations, correct standalone randomness labeling, accessible selection states, and clearer balance/controls layout.
- Five regression assertions were observed failing against the old UI before implementation; all five passed after the changes. Full suite: 59 tests in 13 files passed, with TypeScript/build/bundle/room/audio checks passing. `npm ci --no-audit --no-fund` completed using the tracked lockfile. Build tool reports only an environment npm proxy-option warning.
- Updated the original browser smoke test for the original two-room selector, real risk disclosure, and mobile rules interaction. This is historical evidence from before the Kitchen-only scope revision.
- Visual-review blocker: the available browser rejected `http://127.0.0.1:3100` with `net::ERR_BLOCKED_BY_CLIENT`. The local Vite preview serves successfully on 127.0.0.1. No alternate network route or deployment was attempted.
- Plan adjustment at that time: updated obsolete browser assertions so checkpoint 1 did not leave CI expecting twelve removed cards. Full visual baseline comparisons now belong to checkpoint 5.
- Preview handoff: deploy the packaged static build or this branch's exact source commit. Source uses repository root, install `cd sdk/casino-sdk && npm ci`, existing root `vercel.json` build/output settings. Built-static package contains `index.html` at its root plus manifest CORS headers; it needs no build step. No contract deployment required.
- Original user review request: two room choices at desktop and mobile sizes. Superseded by the Kitchen-only gate: one Kitchen entry, working rules and Odds & payouts, no clipping, and a demo round.
- Status: checkpoint 1 code and nonvisual checks verified; acceptance remains partial until the rendered walkthrough passes. Existing graphics and floating-prop animation are explicitly unfinished; checkpoint 2 is the kitchen visual proof, not another interface redesign. No Vercel deployment or deployment-triggering branch push performed.

### Kitchen-only scope revision

Garage Mayhem is removed from all remaining checkpoints and release criteria due to the time available. The gallery now offers Kitchen alone and a saved Garage selection opens Kitchen. Existing dormant Garage source is historical code; it is not an implementation promise or a release gate. The approved Kitchen master and stationary layer proofs remain the current visual baseline. The proposed tilted hero plate failed the cabinet contact review and is withdrawn: the approved photographed hero plate remains seated in hinge previews until a supported pose is authored. No animation is authorized by this revision.
