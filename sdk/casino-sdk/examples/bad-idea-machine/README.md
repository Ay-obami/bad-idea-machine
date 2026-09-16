# Bad Idea Machine — Chain casino game

This workspace is the static guest frontend for **Bad Idea Machine**. It runs inside the Chain casino host and as a standalone demo.

The game has one economic engine and two selectable cosmetic environments:

- **Kitchen Meltdown** — appliances, crockery, grease-fire energy and domestic bad decisions.
- **Garage Mayhem** — power tools, tires, chains, heavy metal and industrial regret.

Environment choice never changes RTP, probability, multiplier or contract state. Only the risk mode is encoded into `gameData`.

## Run

From `sdk/casino-sdk/`:

```bash
npm install
npm run start:bad-idea
```

The full local stack runs the game at `http://localhost:3100` and the Chain simulator at `http://localhost:3300`.

Standalone frontend only:

```bash
npm --prefix examples/bad-idea-machine run dev
```

## Round lifecycle

1. The player selects a wager, one of three risk modes, and Kitchen or Garage.
2. `App.tsx` ABI-encodes **only the risk mode** and calls `hostApi.openSession`.
3. `BadIdeaMachineGame.sol` requests Chain VRF, derives an unbiased 0–9,999 roll, selects the payout tier and settles the payout.
4. The frontend waits for the authoritative terminal session snapshot, decodes the settled `gameState`, and derives the separate cosmetic visual seed.
5. `scene/scene-script.ts` combines that visual seed with the selected room to build a deterministic catastrophe timeline. Payout tier changes only the finalizer copy, not the event choreography.
6. `EnvironmentStage.tsx` moves illustrated actors through real room coordinates while localized VFX and environment-specific sound layers run on the same timeline.
7. Only after the presentation completes does the guest call `hostApi.revealOutcome`.
8. If supported by the host, `getRandomnessVerification` populates the fairness receipt with VRF verification checks.

## Important files

- `src/App.tsx` — Chain session/demo controller and per-round environment capture.
- `src/lib/badIdea.ts` — frontend paytable mirror and ABI/randomness helpers.
- `src/scene/scene-script.ts` — deterministic catastrophe generator.
- `src/scene/environments.ts` — Kitchen/Garage actors and impact zones.
- `src/scene/audio-plan.ts` — deterministic room-specific sound layers.
- `src/components/EnvironmentStage.tsx` — room, actor, VFX and result orchestration.
- `src/components/scenes/` — Kitchen/Garage illustrations and SVG actor art.
- `src/components/EnvironmentSelector.tsx` — cosmetic room selection.
- `src/components/ControlPanel.tsx` — wager/risk/environment controls.
- `src/components/FairnessReceipt.tsx` — catastrophe trace and Chain verification receipt.
- `public/game.manifest.json` — Chain game metadata/capabilities.
- `scripts/simulate-flows.mjs` — full local host + VRF settlement check.
- `scripts/verify-build.mjs` — standalone production-bundle audit.

The authoritative economic logic is **not** in this frontend. It lives in `../../simulator/contracts/BadIdeaMachineGame.sol`.
