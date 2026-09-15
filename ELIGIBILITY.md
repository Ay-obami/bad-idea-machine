# Chain Jam Vol. 1 — Eligibility Self-Check

This file maps the submission requirements to reproducible evidence in the repository.

| Requirement | Status | Evidence |
| --- | --- | --- |
| Implements Chain casino SDK contract | PASS | `sdk/casino-sdk/simulator/contracts/BadIdeaMachineGame.sol` implements the current `ICasinoGameV2` interface and compiles in CI. |
| Uses Chain guest bridge | PASS | `sdk/casino-sdk/examples/bad-idea-machine/src/lib/useCasinoHost.ts` connects through `@chain/casino-sdk/guest`; `App.tsx` calls host `openSession` / `revealOutcome` and consumes pushed session snapshots. |
| Valid game manifest | PASS | `sdk/casino-sdk/examples/bad-idea-machine/public/game.manifest.json`; `src/lib/manifest.test.ts` validates it with `validateCasinoGameManifest` and asserts canonical ID `badideamachine`. |
| Runs in local simulator | PASS | CI compiles and auto-deploys `BadIdeaMachineGame`, starts the bundled local casino + Verify Network VRF node, and runs `npm run simulate:bad-idea`. |
| Real local VRF lifecycle | PASS | `scripts/simulate-flows.mjs` settles 105 wagers (35 per risk mode), requires non-zero VRF randomness, independently recomputes every tier from the emitted randomness, and verifies the payout. |
| RTP between 93–98% | PASS | Exact RTP is 96.00% in all modes. `badIdea.test.ts` exhaustively enumerates every 0–9,999 roll and checks exact bucket counts and weighted RTP. |
| Declared math matches paytable | PASS | Contract `tierFromRoll`/`multiplierBps`; frontend mirror `badIdea.ts`; exhaustive tests lock approved thresholds. |
| Unbiased outcome mapping | PASS | Contract and frontend use 16-bit rejection sampling with accept limit 60,000 before `% 10_000`. |
| Novel casino concept | PASS | Rube Goldberg catastrophe reveal; not blackjack, plinko, dice, limbo, crash, or a classic-game clone. |
| Standalone playable demo | PASS | Top-level browser mode uses clearly labeled demo credits and browser randomness; no host is required to play the demo. |
| Standalone demo does not fake Chain verification | PASS | Fairness receipt labels standalone rounds `LOCAL DEMO RANDOMNESS`; real VRF proof UI is only populated by Chain host verification data. |
| Jam widget included | PASS | `index.html` loads `https://jam.chain.wtf/widget.js`; `verify-build.mjs` fails if the production HTML loses it. |
| Static frontend | PASS | Vite build emits deployable static `dist/`; production audit verifies `index.html` and same-origin `game.manifest.json`. |
| Loads lightweight | PASS | No runtime backend, video, 3D engine, or sprite sheets; procedural CSS/DOM machine and WebAudio. `verify-build.mjs` enforces total/single-asset size guardrails. |
| Mobile support | PASS | `bad-idea.css` reflows desktop 5×2 machine into a touch-friendly 2×5 route and compact control panel. Chromium visual smoke covers desktop and 390×844 mobile. |
| Sound / mute | PASS | `audio.ts` provides procedural per-station sound and result stings; control panel exposes mute. |
| Source accessible | PASS | Public GitHub repository: `Ay-obami/bad-idea-machine`. |
| Minimum eight meaningful commits | PASS | Game work is split across SDK foundation, math tests, contract, routing, sound, UI components, lifecycle integration, responsive styling, manifest/widget, production checks, integration simulation, and docs. |

## RTP proof

### Controlled

`0.45×0 + 0.35×1.2 + 0.15×2 + 0.04×4 + 0.01×8 = 0.96`

### Send It

`0.65×0 + 0.20×1.5 + 0.10×3 + 0.04×6 + 0.01×12 = 0.96`

### Absolutely Not

`0.80×0 + 0.10×2 + 0.06×5 + 0.03×10 + 0.01×16 = 0.96`

## Full local verification

```bash
cd sdk/casino-sdk
npm install
npm --prefix simulator run compile-contracts
npm run test:bad-idea
npm --prefix examples/bad-idea-machine run check-types
npm run build:bad-idea
npm --prefix examples/bad-idea-machine run verify-build
```

To exercise the complete casino/VRF lifecycle, start the local node in one terminal:

```bash
cd sdk/casino-sdk
npm --prefix simulator run local-node
```

Then in another terminal:

```bash
cd sdk/casino-sdk
npm run simulate:bad-idea
```

The default simulation must finish with `PASS 105 real local-VRF settlements independently recomputed from stored randomness`.

## Submission-only items

The following are operational submission artifacts rather than source-code eligibility checks and are filled at submission time:

- stable hosted HTTPS demo URL
- target-chain deployed contract address supplied to Chain
- jam.chain.wtf submission form entry
