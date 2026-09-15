# Bad Idea Machine

**One button. Several terrible decisions.**

Bad Idea Machine is an original instant casino game built for **Chain Jam Vol. 1**. Pick how reckless you feel, choose a wager, press the giant button, and watch an increasingly absurd Rube Goldberg machine attempt to reach your payout.

The important rule is simple: **the animation never decides the result**. The Chain casino contract settles the economic outcome from verified randomness first; the frontend only turns that already-settled tier into a deterministic mechanical catastrophe.

## Why it is different

Most instant casino games expose their math directly as dice, wheels, mines, crash curves, or target multipliers. Bad Idea Machine keeps the wager loop just as understandable while making the reveal itself the game: toaster → cat → hammer → bowling ball → fan → dominoes → rocket → safe → the mysterious Bad Idea Core.

A losing round can fail early in several comic ways. Higher payout tiers travel farther through the machine. The rare top tier reaches the Core and ends in **CATASTROPHIC SUCCESS**.

## Game loop

1. Choose a wager.
2. Choose a risk profile: **CONTROLLED**, **SEND IT**, or **ABSOLUTELY NOT**.
3. Press **DO NOT PRESS**.
4. The contract requests Chain VRF and settles one of five payout tiers.
5. The frontend derives a separate cosmetic seed and plays the corresponding machine route.
6. After the animation finishes, the game calls `revealOutcome` so the host can reveal the settled balance change.
7. Open **WHAT WENT WRONG?** to inspect the route and Chain randomness verification data.

No mid-round cash-out or player action exists, so this is not a crash/limbo mechanic hidden behind animation.

## Exact RTP

All three modes have an exact theoretical **96.00% RTP**.

| Mode | Failure | Small | Medium | Big | Huge | RTP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Controlled | 45% × 0 | 35% × 1.2 | 15% × 2 | 4% × 4 | 1% × 8 | **96%** |
| Send It | 65% × 0 | 20% × 1.5 | 10% × 3 | 4% × 6 | 1% × 12 | **96%** |
| Absolutely Not | 80% × 0 | 10% × 2 | 6% × 5 | 3% × 10 | 1% × 16 | **96%** |

Multipliers are **total returns**, not profit-on-top. The contract uses integer basis points and a 10,000-outcome table. Tests exhaustively enumerate all 10,000 rolls for every risk mode and assert the bucket counts and 96% weighted RTP.

## Randomness and fairness

`BadIdeaMachineGame.sol` implements the current Chain `ICasinoGameV2` interface.

The VRF word is domain-separated into two deterministic seeds:

- `keccak256(randomness || "BAD_IDEA_PAYOUT")` → economic roll
- `keccak256(randomness || "BAD_IDEA_VISUAL")` → cosmetic presentation

The economic roll uses 16-bit rejection sampling: values below 60,000 are accepted because 60,000 contains exactly six complete 0–9,999 partitions. This avoids modulo bias.

The visual seed can change cat behavior, machine variants, failure punchlines, and other presentation details, but **cannot change the payout tier or payout**.

For real Chain-hosted rounds the receipt can show the session ID, VRF request ID, settlement transaction hash, and the host's optional VRF verification checks. The standalone demo is explicitly labeled and uses browser randomness plus fake demo credits only.

## Architecture

```text
Bad Idea Machine UI
  React + CSS machine + procedural WebAudio
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
- `sdk/casino-sdk/examples/bad-idea-machine/src/lib/badIdea.ts` — frontend mirror used for previews/decoding; never authoritative for money.
- `sdk/casino-sdk/examples/bad-idea-machine/src/lib/route.ts` — cosmetic catastrophe routing.
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

For the standalone playable demo only:

```bash
cd sdk/casino-sdk
npm install
npm --prefix examples/bad-idea-machine run dev
```

Open `http://localhost:3100`. Standalone mode uses clearly labeled **demo credits** and never represents browser randomness as Chain VRF.

## Verification

```bash
cd sdk/casino-sdk

# Exact paytables, ABI codecs, route determinism, manifest validation
npm run test:bad-idea

# Compile all simulator Solidity contracts including BadIdeaMachineGame
npm --prefix simulator run compile-contracts

# Strict frontend typecheck
npm --prefix examples/bad-idea-machine run check-types

# Static production build
npm run build:bad-idea

# Verify production manifest/widget and bundle-size guardrails
npm --prefix examples/bad-idea-machine run verify-build
```

CI additionally launches the full local casino + bundled Verify Network VRF node and runs `npm run simulate:bad-idea`. The default soak settles **105 real local-VRF wagers (35 per risk mode)** and independently recomputes every contract tier from its stored VRF word before verifying the payout.

## Performance and presentation

The game deliberately avoids a 3D engine, background video, large sprite sheets, and a runtime backend. The machine is rendered with React/CSS primitives and procedural WebAudio. CI enforces production bundle guardrails and verifies that the static output still includes both `game.manifest.json` and the Chain Jam widget.

The UI is responsive: desktop uses a wide 5×2 machine rail; mobile reflows it into a compact serpentine 2×5 route while keeping the wager controls touch-friendly. A Chromium visual smoke check covers desktop ready/danger/result states and a 390×844 mobile viewport with browser-console error detection.

## Chain Jam requirements

See [`ELIGIBILITY.md`](./ELIGIBILITY.md) for the reproducible eligibility checklist and evidence paths. Submission-specific notes live in [`sdk/casino-sdk/examples/bad-idea-machine/SUBMISSION.md`](./sdk/casino-sdk/examples/bad-idea-machine/SUBMISSION.md).

## License

Game-specific code is released under the MIT license. The vendored Chain Casino SDK retains its upstream licensing and notices.
