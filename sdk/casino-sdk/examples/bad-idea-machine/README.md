# Bad Idea Machine — Chain casino game

This workspace is the static guest frontend for **Bad Idea Machine**. It runs both inside the Chain casino host and as a standalone demo.

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

1. The player selects one of three risk modes and a wager.
2. `App.tsx` ABI-encodes the risk mode and calls `hostApi.openSession`.
3. `BadIdeaMachineGame.sol` requests Chain VRF, derives an unbiased 0–9,999 roll, selects the payout tier, and settles the payout.
4. The frontend waits for the authoritative terminal session snapshot, decodes the settled `gameState`, and derives the separate cosmetic visual seed.
5. `route.ts` converts the already-settled tier plus visual seed into the Rube Goldberg reveal.
6. Only after the animation completes does the guest call `hostApi.revealOutcome`.
7. If supported by the host, `getRandomnessVerification` populates the fairness receipt with VRF verification checks.

## Important files

- `src/App.tsx` — session/demo controller.
- `src/lib/badIdea.ts` — frontend paytable mirror and ABI/randomness helpers.
- `src/lib/route.ts` — deterministic cosmetic routing.
- `src/lib/audio.ts` — procedural WebAudio effects.
- `src/components/MachineStage.tsx` — machine presentation.
- `src/components/ControlPanel.tsx` — wager/risk controls.
- `src/components/FairnessReceipt.tsx` — route and Chain verification receipt.
- `public/game.manifest.json` — Chain game metadata/capabilities.
- `scripts/simulate-flows.mjs` — full local host + VRF settlement check.
- `scripts/verify-build.mjs` — standalone production-bundle audit.

The authoritative economic logic is **not** in this frontend. It lives in `../../simulator/contracts/BadIdeaMachineGame.sol`.
