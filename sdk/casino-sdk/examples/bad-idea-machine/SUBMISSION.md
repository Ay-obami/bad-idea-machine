# Bad Idea Machine — Submission Notes

## One-line pitch

Press one button and watch a deterministic Rube Goldberg catastrophe reveal a payout that was already settled on-chain by Chain VRF.

## What judges should try

1. Open the hosted game or run the local simulator.
2. Try all three risk modes: **Controlled**, **Send It**, and **Absolutely Not**.
3. Press **DO NOT PRESS** and watch how higher payout tiers travel farther through the machine.
4. After the reveal, open **WHAT WENT WRONG?** to inspect the route and randomness receipt.
5. Compare multiple rounds: cosmetic details vary, but the contract-settled payout tier is authoritative.

## Why the implementation matters

- `BadIdeaMachineGame.sol` implements the current Chain `ICasinoGameV2` interface.
- Theoretical RTP is exactly **96.00%** for every risk mode.
- Economic randomness uses Chain / Verify Network VRF with unbiased 16-bit rejection sampling.
- Payout and presentation are domain-separated with `BAD_IDEA_PAYOUT` and `BAD_IDEA_VISUAL`.
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

The simulation verifies contract quotes and paytable boundaries, then settles **105 real local-VRF rounds (35 per mode)**. Every settled tier is independently recomputed from the emitted VRF word using the same documented payout-domain rejection sampler and its payout is checked against the on-chain result.

## Submission links

- Source: `https://github.com/Ay-obami/bad-idea-machine`
- Hosted demo: add the final HTTPS deployment URL here before submitting.
- Production/testnet contract address: add the final Chain-supported deployment address here before submitting.

The hosted URL and target-chain contract address are intentionally left as operational placeholders until the final deployment step; all local contract, simulator, VRF, frontend, and static-build evidence is reproducible from this repository.
