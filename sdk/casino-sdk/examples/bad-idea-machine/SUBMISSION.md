# Bad Idea Machine — Chain Jam Submission Notes

## One-line pitch

Choose a room, press one terrible button, and watch a deterministic physical catastrophe reveal a payout that Chain VRF already settled.

## Submission form

- **Game title:** Bad Idea Machine
- **Game URL:** https://bad-idea-machine-oyebisiayobami26-7089s-projects.vercel.app
- **Declared RTP:** 96%
- **Discord:** add your Discord handle before submitting
- **X:** optional
- **Telegram:** optional
- **Source access:** https://github.com/Ay-obami/bad-idea-machine

## Pitch / info

**One button. Several terrible decisions.**

Bad Idea Machine is an original instant casino game where the player chooses one of three risk profiles — **Controlled**, **Send It**, or **Absolutely Not** — and one of two disaster environments — **Kitchen Meltdown** or **Garage Mayhem** — then presses a giant **DO NOT PRESS** button and watches the room physically fall apart.

Kitchen Meltdown turns appliances, cookware, crockery, a cat, a bowling ball, a rocket and a safe into a domestic chain reaction. Garage Mayhem swaps that cast for hammers, wrenches, drills, saws, chains, tires, tanks, shelves and workshop machinery. These are illustrated scene objects that move through actual room coordinates: several failures can overlap, objects travel across the scene, and impacts produce localized fire, blast, smoke, steam, shards and debris with matching procedural audio.

The key rule is that **the animation never decides the money**. The Chain casino contract consumes verified VRF randomness first and settles one of five payout tiers. Only then does the frontend derive a separate cosmetic seed and generate the selected room's catastrophe.

The room selector is cosmetic only. Kitchen and Garage have the **same contract, same three paytables, same 96.00% RTP and same payout probabilities**. Environment is never encoded into contract `gameData`.

The visible catastrophe is also **not a payout progress bar**. For the same cosmetic seed, a 0× result and a huge result receive identical event choreography and duration. The payout tier affects the final result copy only, so watching the first few seconds cannot reveal whether the player is about to lose or hit the top multiplier.

All three risk modes have an exact theoretical RTP of **96.00%**, enforced by the Solidity contract and exhaustively mirrored by tests. Economic and cosmetic randomness are domain-separated, so the spectacle can vary dramatically without affecting payout.

The game runs standalone as a playable demo, includes the Chain Jam widget, supports desktop and mobile, uses procedural layered sound, and exposes a post-round **WHAT WENT WRONG?** receipt for the chosen environment, catastrophe trace and randomness details.

Repository verification covers contract compilation, exhaustive paytable tests, deterministic scene invariants, environment-specific sound tests, manifest validation, strict typechecking, production bundle audit, Chromium desktop/mobile physical-motion smoke tests, and a 105-round local Chain/Verify Network VRF soak where every settled tier is independently recomputed from the emitted randomness.

## What judges should try

1. Open the hosted game directly.
2. Switch between **Kitchen Meltdown** and **Garage Mayhem** before playing; the entire room/cast should visibly change.
3. Try all three risk modes: **Controlled**, **Send It**, and **Absolutely Not**.
4. Press **DO NOT PRESS** several times. Watch actual actors cross the room while multiple hazards overlap instead of following a readable progress rail.
5. Look for localized fire/blasts, smoke/steam, flying debris or shards, near misses and decoy failures; turn sound on for the room-specific mechanical layers.
6. After the multiplier appears, open **WHAT WENT WRONG?** to inspect the environment, catastrophe trace and randomness receipt.
7. Play both rooms repeatedly: presentation changes, but the contract-settled payout math remains identical.

## Why the implementation matters

- `BadIdeaMachineGame.sol` implements the current Chain `ICasinoGameV2` interface.
- Theoretical RTP is exactly **96.00%** for every risk mode.
- Economic randomness uses Chain / Verify Network VRF with unbiased 16-bit rejection sampling.
- Payout and presentation are domain-separated with `BAD_IDEA_PAYOUT` and `BAD_IDEA_VISUAL`.
- Kitchen/Garage choice is frontend-only and cannot change economics.
- The scene generator creates 4.7–6.2 second deterministic scripts with 8–12 overlapping events, decoys, long trajectories and multiple hazard types.
- Regression tests assert identical visible choreography between failure and huge tiers for the same cosmetic seed across both environments.
- Illustrated SVG/CSS actors move through a logical 1000×600 room instead of animating cards or a progress board.
- Procedural WebAudio layers Kitchen/Garage-specific impacts, motors, metal, appliance, fire, blast, alarm and debris sounds.
- The frontend uses `@chain/casino-sdk/guest`; it contains no custom wallet or settlement path.
- Result multipliers remain hidden until the catastrophe finishes.
- Standalone mode is explicitly labeled as demo credits / local randomness and never impersonates Chain verification.

## Reproducible verification

From `sdk/casino-sdk/`:

```bash
npm install
npm --prefix simulator run compile-contracts
npm run test:bad-idea
npm --prefix examples/bad-idea-machine run check-types
npm run build:bad-idea
npm --prefix examples/bad-idea-machine run verify-build
```

For the complete local Chain lifecycle, start the local node and run the simulation in a second shell:

```bash
npm --prefix simulator run local-node
npm run simulate:bad-idea
```

The simulation verifies contract quotes and paytable boundaries, then settles **105 real local-VRF rounds (35 per mode)**. Every settled tier is independently recomputed from the emitted VRF word using the documented payout-domain rejection sampler and its payout is checked against the on-chain result.

The visual-smoke workflow launches the production build in Chromium, exercises both environments plus a 390×844 mobile viewport, rejects the removed station-card UI, measures a real actor's screen coordinates during a live reveal, requires substantial physical movement and catastrophe VFX, and fails on browser-console/page errors.

## Deployment / integration distinction

For the **Chain Jam submission form**, the public hosted game URL and source-access URL are the operational requirements.

The Vercel production alias above is assigned to the deployed project. A target-chain deployed contract address is an integration-stage deliverable described by the Casino SDK documentation. It is not a field in the current Chain Jam submission form, so it should not block the jam entry once the hosted demo is confirmed publicly reachable.
