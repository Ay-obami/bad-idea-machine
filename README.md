# Bad Idea Machine

**One button. Several terrible decisions.**

Bad Idea Machine is an original instant casino game built for **Chain Jam Vol. 1**. Choose how reckless you feel, choose which room should suffer — **Kitchen Meltdown** or **Garage Mayhem** — place a wager, then press the giant **DO NOT PRESS** button and watch a physical cartoon catastrophe reveal a result that Chain VRF already settled.

The most important rule is simple: **the room changes; the math does not**. Kitchen/Garage selection is cosmetic only. The Solidity contract receives the risk mode and wager, settles the economic outcome from verified randomness, and only then does the frontend derive a separate visual seed for actors, hazards, trajectories, decoys, timing and sound.

## Why it is different

Most instant casino games expose their math directly as dice, wheels, mines, crash curves or target multipliers. Bad Idea Machine turns the reveal itself into the entertainment.

In **Kitchen Meltdown**, toasters, toast, pans, kettles, crockery, a cat, a bowling ball, a rocket and a safe can cross the room while appliances spark, steam and catch fire. In **Garage Mayhem**, hammers, wrenches, drills, saws, chains, tires, tanks, shelves, rockets and heavy objects turn a workshop into industrial regret.

These are not cards pretending to move. The actors are illustrated scene objects with real room coordinates and long trajectories. Several events can overlap, impacts produce localized fire/blasts/smoke/steam/shards/debris, and procedural WebAudio follows the same deterministic scene event timeline.

The visible choreography is intentionally **not a payout progress meter**. For a fixed cosmetic seed, a 0× result and a huge result use the same event choreography and duration; only the final result copy/multiplier differs. Regression tests enforce that ambiguity across both rooms.

## Game loop

1. Choose a wager.
2. Choose a risk profile: **CONTROLLED**, **SEND IT**, or **ABSOLUTELY NOT**.
3. Choose **KITCHEN MELTDOWN** or **GARAGE MAYHEM**.
4. Press **DO NOT PRESS**.
5. The contract requests Chain VRF and settles one of five payout tiers.
6. The frontend derives the separate cosmetic seed and builds a deterministic 4.7–6.2 second catastrophe script for the selected room.
7. Real scene actors move, collide and trigger overlapping hazards without revealing the payout early.
8. Only after the spectacle ends does the multiplier become visually authoritative and the guest calls `revealOutcome`.
9. Open **WHAT WENT WRONG?** to inspect the room, catastrophe trace and Chain randomness verification data.

There is no mid-round cash-out or player action, so this is not crash/limbo hidden behind animation.

## Exact RTP

All three modes have an exact theoretical **96.00% RTP**.

| Mode | Failure | Small | Medium | Big | Huge | RTP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Controlled | 45% × 0 | 35% × 1.2 | 15% × 2 | 4% × 4 | 1% × 8 | **96%** |
| Send It | 65% × 0 | 20% × 1.5 | 10% × 3 | 4% × 6 | 1% × 12 | **96%** |
| Absolutely Not | 80% × 0 | 10% × 2 | 6% × 5 | 3% × 10 | 1% × 16 | **96%** |

Multipliers are **total returns**, not profit-on-top. The contract uses integer basis points and a 10,000-outcome table. Tests exhaustively enumerate all 10,000 rolls for every risk mode and assert the exact bucket counts and weighted RTP.

**Kitchen/Garage selection does not modify any probability, multiplier, reserve quote, wager limit or RTP calculation.** Environment is captured only by the frontend for presentation and is never encoded into the contract `gameData`.

## Randomness and fairness

`BadIdeaMachineGame.sol` implements the current Chain `ICasinoGameV2` interface.

The VRF word is domain-separated into two deterministic seeds:

- `keccak256(randomness || "BAD_IDEA_PAYOUT")` → economic roll
- `keccak256(randomness || "BAD_IDEA_VISUAL")` → cosmetic presentation

The economic roll uses 16-bit rejection sampling: values below 60,000 are accepted because 60,000 contains exactly six complete 0–9,999 partitions. This avoids modulo bias.

The visual seed can alter actor selection/order, event timing, trajectories, false alarms, hazards, particles and sound choreography, but **cannot change the payout tier or payout**. The scene invariant suite covers 64 deterministic seeds × both environments × all five tiers and asserts that payout tier does not encode the visible choreography.

For real Chain-hosted rounds the receipt can show the session ID, VRF request ID, settlement transaction hash and optional host VRF-verification checks. Standalone mode is clearly labeled and uses browser randomness plus fake demo credits only.

## Architecture

```text
Bad Idea Machine UI
  React + two 1000×600 scene environments
  deterministic actor/VFX/audio timeline
               │
               ▼
@chain/casino-sdk/guest bridge
               │
               ▼
LocalCasinoHost / production CasinoGameFacet
               │
               ▼
BadIdeaMachineGame (ICasinoGameV2)
               │
               ▼
Chain / Verify Network VRF
```

Key files:

- `sdk/casino-sdk/simulator/contracts/BadIdeaMachineGame.sol` — authoritative game math and settlement.
- `sdk/casino-sdk/examples/bad-idea-machine/src/lib/badIdea.ts` — frontend paytable/codec mirror; never authoritative for money.
- `sdk/casino-sdk/examples/bad-idea-machine/src/scene/scene-script.ts` — deterministic room catastrophe generator.
- `sdk/casino-sdk/examples/bad-idea-machine/src/scene/environments.ts` — Kitchen/Garage actor definitions and impact zones.
- `sdk/casino-sdk/examples/bad-idea-machine/src/components/EnvironmentStage.tsx` — physical actor timeline, VFX and result stage.
- `sdk/casino-sdk/examples/bad-idea-machine/src/components/scenes/` — room illustrations and actor artwork.
- `sdk/casino-sdk/examples/bad-idea-machine/src/scene/audio-plan.ts` — environment-specific deterministic sound layers.
- `sdk/casino-sdk/examples/bad-idea-machine/src/lib/audio.ts` — WebAudio playback/mute/result engine.
- `sdk/casino-sdk/examples/bad-idea-machine/src/App.tsx` — Chain session lifecycle + standalone demo controller.
- `sdk/casino-sdk/examples/bad-idea-machine/public/game.manifest.json` — Chain game manifest.
- `sdk/casino-sdk/examples/bad-idea-machine/scripts/simulate-flows.mjs` — real local-host/VRF integration check.

The current official Casino SDK is vendored under `sdk/casino-sdk/` so reviewers can reproduce the exact simulator environment used by the game.

## Run locally

Requires **Node.js 22+**.

```bash
cd sdk/casino-sdk
npm install
npm run start:bad-idea
```

Then open the simulator at `http://localhost:3300`. The local stack starts its own chain, casino host, test chUSD, Verify Network router/node, auto-deploys `BadIdeaMachineGame`, and mounts the game frontend.

Standalone playable demo only:

```bash
cd sdk/casino-sdk
npm install
npm --prefix examples/bad-idea-machine run dev
```

Open `http://localhost:3100`. Standalone mode uses clearly labeled **demo credits** and never represents browser randomness as Chain VRF.

## Verification

```bash
cd sdk/casino-sdk

npm run test:bad-idea
npm --prefix simulator run compile-contracts
npm --prefix examples/bad-idea-machine run check-types
npm run build:bad-idea
npm --prefix examples/bad-idea-machine run verify-build
```

CI additionally launches the full local casino + bundled Verify Network VRF node and runs `npm run simulate:bad-idea`. The default soak settles **105 real local-VRF wagers (35 per risk mode)** and independently recomputes every contract tier from its stored VRF word before checking the payout.

The Chromium visual gate exercises **both environments and a 390×844 mobile viewport**. It rejects the old station-card UI, measures a real scene actor's `getBoundingClientRect()` during a reveal and fails unless it travels across the screen, requires localized catastrophe VFX, and fails on browser-console/page errors.

## Performance and presentation

The game deliberately avoids a 3D engine, background video, large sprite sheets and a runtime backend. The spectacle is rendered from lightweight SVG/CSS actors plus deterministic Web Animations and procedural WebAudio. CI enforces production bundle guardrails and verifies that the static output still contains both `game.manifest.json` and the Chain Jam widget.

Desktop keeps the room dominant with controls beside it. Tablet/mobile stack the room above touch-friendly controls while retaining readable actors and large trajectories.

## Chain Jam requirements

See [`ELIGIBILITY.md`](./ELIGIBILITY.md) for the reproducible eligibility checklist and evidence paths. Submission-specific copy lives in [`sdk/casino-sdk/examples/bad-idea-machine/SUBMISSION.md`](./sdk/casino-sdk/examples/bad-idea-machine/SUBMISSION.md).

## License

Game-specific code is released under the MIT license. The vendored Chain Casino SDK retains its upstream licensing and notices.
