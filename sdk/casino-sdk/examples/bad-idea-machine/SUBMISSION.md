# Bad Idea Machine — Chain Jam Submission Notes

## One-line pitch

Press one button and watch a deterministic industrial catastrophe obscure a payout that was already settled by Chain VRF.

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

Bad Idea Machine is an original instant casino game where the player chooses one of three risk profiles — Controlled, Send It, or Absolutely Not — then presses a giant DO NOT PRESS button and watches a ridiculous industrial machine lose control around them.

The key rule is that the animation never decides the money. The Chain casino contract consumes verified VRF randomness first and settles one of five payout tiers. Only then does the frontend derive a separate cosmetic seed and turn that already-settled result into an intentionally unreadable catastrophe: non-linear station order, false alarms, premature rockets, fire, smoke, sparks, flying debris, alarms, blast impacts, screen shake and layered mechanical audio.

Crucially, the visible path is **not a payout progress bar**. For the same visual seed, every economic tier receives the same route length and early choreography. The payout tier does not determine how far the machine gets, so the first few seconds are deliberately ambiguous and the multiplier only becomes legible at the terminal reveal.

All three risk modes have an exact theoretical RTP of **96.00%**, with the paytable enforced in the Solidity contract and exhaustively mirrored by tests. Economic and cosmetic randomness are domain-separated, so the chaos can vary dramatically without affecting payout.

The game runs standalone as a playable demo, includes the Chain Jam widget, supports desktop and mobile, uses procedural layered sound, and exposes a post-round **WHAT WENT WRONG?** receipt for route and randomness details.

Repository verification covers contract compilation, automated paytable/route/audio/manifest tests, strict typechecking, a production bundle audit, Chromium desktop/mobile chaos smoke tests, and a 105-round local Chain/Verify Network VRF soak where every settled tier is independently recomputed from the emitted randomness.

## What judges should try

1. Open the hosted game directly.
2. Try all three risk modes: **Controlled**, **Send It**, and **Absolutely Not**.
3. Press **DO NOT PRESS** several times and try to predict the result from the first few machine events — false alarms and shuffled routes are designed to stop that from working.
4. Watch for fire, smoke, debris, sparks, station misfires and sound escalation during the reveal.
5. After the multiplier appears, open **WHAT WENT WRONG?** to inspect the route and randomness receipt.
6. Play several rounds: spectacle changes, but the contract-settled payout tier remains authoritative.

## Why the implementation matters

- `BadIdeaMachineGame.sol` implements the current Chain `ICasinoGameV2` interface.
- Theoretical RTP is exactly **96.00%** for every risk mode.
- Economic randomness uses Chain / Verify Network VRF with unbiased 16-bit rejection sampling.
- Payout and presentation are domain-separated with `BAD_IDEA_PAYOUT` and `BAD_IDEA_VISUAL`.
- The visual route is derived only from the cosmetic seed; payout tier does not encode route length or early order.
- Deterministic false alarms, hazards and effect seeds create replayable chaos without affecting economics.
- Procedural WebAudio layers machine sounds with fire, blast, alarm, debris and intensity-dependent noise.
- The frontend uses `@chain/casino-sdk/guest`; it contains no custom wallet or settlement path.
- Result multipliers are hidden until the terminal machine reveal.
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

For the complete local Chain lifecycle, start the local node and then run the simulation in a second shell:

```bash
npm --prefix simulator run local-node
npm run simulate:bad-idea
```

The simulation verifies contract quotes and paytable boundaries, then settles **105 real local-VRF rounds (35 per mode)**. Every settled tier is independently recomputed from the emitted VRF word using the documented payout-domain rejection sampler and its payout is checked against the on-chain result.

The visual-smoke workflow also launches the production build in Chromium, verifies that chaos particles and false-alarm stations are present during live reveals, captures early/mid/result screenshots, tests a 390×844 mobile reveal, and fails on browser-console errors.

## Deployment / integration distinction

For the **Chain Jam submission form**, the public hosted game URL and source-access URL are the operational requirements.

The Vercel production alias above is assigned to the deployed project. A target-chain deployed contract address is an integration-stage deliverable described by the Casino SDK documentation. It is not a field in the current Chain Jam submission form, so it should not block submitting the jam entry once the hosted demo is confirmed publicly reachable.
