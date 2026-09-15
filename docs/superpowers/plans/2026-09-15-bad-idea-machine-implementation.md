# Bad Idea Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, standalone Chain Jam casino game where Chain VRF settles one of five payout tiers at exactly 96.00% RTP and the frontend reveals the authoritative result through a deterministic Rube Goldberg machine animation.

**Architecture:** Vendor the official Chain casino SDK unchanged under `sdk/casino-sdk/`, add one `ICasinoGameV2` instant-game contract to the local simulator, and add one React/Vite guest frontend under `examples/bad-idea-machine/`. The contract owns wager validation, VRF-to-tier mapping, risk quotes, and payout; the frontend owns only bridge lifecycle, deterministic cosmetic routing, animation, audio, and fairness presentation.

**Tech Stack:** Node.js 22+, npm workspaces, TypeScript 5.9+, React 19, Vite 7, viem 2.52+, Vitest 3.2+, Solidity ^0.8.30, `@chain/casino-sdk` 0.2.x/current jam package, Chain local simulator + Verify Network VRF.

**Spec:** `docs/superpowers/specs/2026-09-15-bad-idea-machine-design.md`

## Global Constraints

- Theoretical RTP is exactly **96.00%** in Controlled, Send It, and Absolutely Not.
- Multipliers are **total-return multipliers**, not profit multipliers.
- Economic randomness comes only from the Chain VRF word delivered to `ICasinoGameV2.onRandomness`.
- Payout randomness and visual randomness are domain-separated; cosmetic variation cannot alter payout.
- Frontend contains no wallet or settlement implementation; it uses `@chain/casino-sdk/guest` only.
- Game follows the SDK contract + bridge + `game.manifest.json` integration model.
- Final build is static, standalone, iframe-compatible, responsive, and includes `https://jam.chain.wtf/widget.js`.
- No leaderboards, accounts, XP, NFTs, multiplayer, custom backend, custom wallet system, or 3D engine before submission.
- Preserve upstream SDK structure instead of refactoring it into our preferred architecture.
- No result multiplier is shown before the reveal reaches its terminal animation point.

---

## Locked Repository Layout

```text
bad-idea-machine/
├── README.md
├── .github/
│   └── workflows/ci.yml
├── docs/superpowers/
│   ├── specs/2026-09-15-bad-idea-machine-design.md
│   └── plans/2026-09-15-bad-idea-machine-implementation.md
└── sdk/casino-sdk/
    ├── package.json
    ├── src/                         # upstream Chain bridge SDK; do not redesign
    ├── solidity/ICasinoGameV2.sol  # upstream canonical interface
    ├── simulator/
    │   └── contracts/
    │       └── BadIdeaMachineGame.sol
    └── examples/
        └── bad-idea-machine/
            ├── package.json
            ├── index.html
            ├── tsconfig.json
            ├── vite.config.ts
            ├── vercel.json
            ├── README.md
            ├── SUBMISSION.md
            ├── public/
            │   └── game.manifest.json
            ├── scripts/
            │   ├── simulate-flows.mjs
            │   └── verify-build.mjs
            └── src/
                ├── main.tsx
                ├── App.tsx
                ├── styles.css
                ├── lib/
                │   ├── useCasinoHost.ts
                │   ├── badIdea.ts
                │   └── badIdea.test.ts
                ├── game/
                │   ├── stateMachine.ts
                │   ├── stateMachine.test.ts
                │   └── useBadIdeaRound.ts
                ├── machine/
                │   ├── routeModel.ts
                │   ├── routeModel.test.ts
                │   ├── MachineStage.tsx
                │   └── components/
                │       ├── ButtonStation.tsx
                │       ├── ToasterStation.tsx
                │       ├── CatStation.tsx
                │       ├── HammerStation.tsx
                │       ├── BallStation.tsx
                │       ├── FanStation.tsx
                │       ├── DominoStation.tsx
                │       ├── RocketStation.tsx
                │       ├── SafeStation.tsx
                │       └── CoreStation.tsx
                ├── audio/
                │   └── audioEngine.ts
                ├── fairness/
                │   └── FairnessReceipt.tsx
                └── components/
                    ├── ControlPanel.tsx
                    ├── Header.tsx
                    └── ResultOverlay.tsx
```

---

### Task 1: Vendor the official SDK and create the game workspace

**Files:**
- Create/vendor: `sdk/casino-sdk/**` from the current official jam SDK package.
- Create from official coinflip scaffold: `sdk/casino-sdk/examples/bad-idea-machine/**`.
- Modify: `sdk/casino-sdk/package.json` only to add Bad Idea Machine scripts/workspace commands without changing bridge exports.
- Create: `README.md`.

**Interfaces:**
- Consumes: official SDK zip linked by the current `GETTING_STARTED.md` (`/sdk/casino-sdk.zip`).
- Produces: a working local simulator plus a copied game workspace served on port `3100`.

- [ ] **Step 1: Download and vendor the current SDK package without guessing its top-level zip folder**

```bash
mkdir -p sdk
curl -fsSL https://sdk.chain.wtf/sdk/casino-sdk.zip -o /tmp/casino-sdk.zip
python - <<'PY'
import json, shutil, tempfile
from pathlib import Path
from zipfile import ZipFile

archive = Path('/tmp/casino-sdk.zip')
tmp = Path(tempfile.mkdtemp(prefix='chain-casino-sdk-'))
with ZipFile(archive) as z:
    z.extractall(tmp)

candidates = []
for package in tmp.rglob('package.json'):
    try:
        data = json.loads(package.read_text())
    except Exception:
        continue
    if data.get('name') == '@chain/casino-sdk':
        candidates.append(package.parent)

if len(candidates) != 1:
    raise SystemExit(f'Expected exactly one @chain/casino-sdk package, found {len(candidates)}')

dest = Path('sdk/casino-sdk')
if dest.exists():
    shutil.rmtree(dest)
shutil.copytree(candidates[0], dest)
print(f'Vendored {candidates[0]} -> {dest}')
PY
```

Expected: `sdk/casino-sdk/package.json` identifies `@chain/casino-sdk`, and `sdk/casino-sdk/examples/coinflip-public/` exists.

- [ ] **Step 2: Install upstream dependencies and prove the untouched coinflip stack works**

Run:

```bash
cd sdk/casino-sdk
npm install
npm run start:coinflip
```

Expected: local node + VRF node + simulator + coinflip guest boot; simulator available at `http://localhost:3300` and coinflip at `http://localhost:3100`.

- [ ] **Step 3: Copy the coinflip guest as our starting guest app**

```bash
cd sdk/casino-sdk
rm -rf examples/bad-idea-machine
cp -R examples/coinflip-public examples/bad-idea-machine
```

- [ ] **Step 4: Change only workspace identity and scripts**

Set `examples/bad-idea-machine/package.json` name to `bad-idea-machine`, keep the local dependency:

```json
"@chain/casino-sdk": "file:../.."
```

Add root SDK scripts:

```json
"start:bad-idea": "concurrently -k -n local-node,simulator,bad-idea -c yellow,cyan,magenta \"npm --prefix simulator run local-node\" \"npm --prefix simulator run dev\" \"npm --prefix examples/bad-idea-machine run dev\"",
"test:bad-idea": "npm --prefix examples/bad-idea-machine test",
"build:bad-idea": "npm --prefix examples/bad-idea-machine run build",
"simulate:bad-idea": "npm --prefix examples/bad-idea-machine run simulate"
```

- [ ] **Step 5: Prove the copied app still builds before game changes**

Run:

```bash
npm --prefix examples/bad-idea-machine run check-types
npm --prefix examples/bad-idea-machine test
npm --prefix examples/bad-idea-machine run build
```

Expected: all pass.

- [ ] **Step 6: Commit the pristine SDK foundation**

```bash
git add sdk/casino-sdk README.md
git commit -m "chore: bootstrap Chain casino SDK"
```

---

### Task 2: Implement and verify the 96% economic model

**Files:**
- Create: `sdk/casino-sdk/examples/bad-idea-machine/src/lib/badIdea.ts`
- Create: `sdk/casino-sdk/examples/bad-idea-machine/src/lib/badIdea.test.ts`

**Interfaces:**
- Produces: `RiskMode`, `OutcomeTier`, paytables, ABI codecs, payout helpers, terminal-phase helpers, deterministic VRF verification helpers.
- Contract and UI must use matching integer constants from this task.

- [ ] **Step 1: Write failing tests for all three paytables**

Tests must assert these exact rows:

```ts
CONTROLLED = [
  { maxExclusive: 4500, multiplierBps: 0 },
  { maxExclusive: 8000, multiplierBps: 12000 },
  { maxExclusive: 9500, multiplierBps: 20000 },
  { maxExclusive: 9900, multiplierBps: 40000 },
  { maxExclusive: 10000, multiplierBps: 80000 },
]
SEND_IT = [
  { maxExclusive: 6500, multiplierBps: 0 },
  { maxExclusive: 8500, multiplierBps: 15000 },
  { maxExclusive: 9500, multiplierBps: 30000 },
  { maxExclusive: 9900, multiplierBps: 60000 },
  { maxExclusive: 10000, multiplierBps: 120000 },
]
ABSOLUTELY_NOT = [
  { maxExclusive: 8000, multiplierBps: 0 },
  { maxExclusive: 9000, multiplierBps: 20000 },
  { maxExclusive: 9600, multiplierBps: 50000 },
  { maxExclusive: 9900, multiplierBps: 100000 },
  { maxExclusive: 10000, multiplierBps: 160000 },
]
```

For each mode, iterate rolls `0..9999`, count tiers, and calculate:

```ts
sum(probabilityCount * multiplierBps) / 10_000 === 9600
```

Also test boundaries `4499/4500`, `6499/6500`, `7999/8000`, `8999/9000`, `9499/9500`, `9599/9600`, `9899/9900`, `9999`.

- [ ] **Step 2: Run tests and confirm RED**

```bash
npm --prefix sdk/casino-sdk/examples/bad-idea-machine test -- badIdea.test.ts
```

Expected: missing module/exports.

- [ ] **Step 3: Implement the exact model and ABI codecs**

Use:

```ts
export type RiskMode = 0 | 1 | 2;
export type OutcomeTier = 0 | 1 | 2 | 3 | 4;
export const BASIS_POINTS = 10_000n;
export const RTP_BPS = 9_600n;
export const TOP_TIER_PROBABILITY_WAD = 10_000_000_000_000_000n; // 1%
```

Encode game data as one `uint8 riskMode`. Decode game state as flattened `(uint8 riskMode, uint8 tier, bytes32 randomness)`.

Implement frontend verification roll with the same unbiased 16-bit rejection rule as the contract:

```ts
// accept only 0..59999; 60,000 is divisible by 10,000
// rejected seeds are rehashed before trying again
```

Use `keccak256(encodePacked(['bytes32', 'string'], [randomness, 'BAD_IDEA_PAYOUT']))` for payout verification and the string `BAD_IDEA_VISUAL` for the cosmetic seed.

- [ ] **Step 4: Run tests and confirm GREEN**

```bash
npm --prefix sdk/casino-sdk/examples/bad-idea-machine test -- badIdea.test.ts
```

Expected: exact bucket counts and 96.00% RTP for all modes.

- [ ] **Step 5: Commit**

```bash
git add sdk/casino-sdk/examples/bad-idea-machine/src/lib
git commit -m "test: lock Bad Idea Machine paytable"
```

---

### Task 3: Implement the authoritative `ICasinoGameV2` contract

**Files:**
- Create: `sdk/casino-sdk/simulator/contracts/BadIdeaMachineGame.sol`
- Test through: `sdk/casino-sdk/examples/bad-idea-machine/scripts/simulate-flows.mjs`

**Interfaces:**
- Consumes: canonical `../../solidity/ICasinoGameV2.sol`.
- `gameData`: `abi.encode(uint8 riskMode)`.
- `gameState`: `abi.encode(BadIdeaState)` where `BadIdeaState = { uint8 riskMode; uint8 outcomeTier; bytes32 randomness; }`.
- Produces one instant round: `WAITING_RANDOMNESS -> SETTLED`.

- [ ] **Step 1: Add a simulator flow script that expects a `BadIdeaMachineGame` deployment and checks its quotes**

For each mode, assert:

```text
Controlled: maxPayout = wager * 8;  probabilityWad = 1e16; expectedPayout = wager * 9600 / 10000
Send It:    maxPayout = wager * 12; probabilityWad = 1e16; expectedPayout = wager * 9600 / 10000
Absolutely: maxPayout = wager * 16; probabilityWad = 1e16; expectedPayout = wager * 9600 / 10000
```

Assert `maxEscrowStake == wager` and `maxReservedProfit == maxPayout - wager`.

- [ ] **Step 2: Run the flow and confirm it fails because the contract is absent**

```bash
cd sdk/casino-sdk
npm run start:bad-idea
# in another shell
npm run simulate:bad-idea
```

- [ ] **Step 3: Implement `BadIdeaMachineGame.sol`**

Use these constants and behaviors:

```solidity
uint256 private constant WAD = 1e18;
uint256 private constant BPS = 10_000;
uint256 private constant RTP_BPS = 9_600;
uint256 private constant TOP_TIER_PROBABILITY_WAD = 1e16; // 1%
uint16 private constant ACCEPTED_16BIT_RANGE = 60_000;
```

`onSessionStart` must:

1. `abi.decode(ctx.gameData, (uint8))`.
2. reject modes above `2`.
3. reserve the mode's worst-case profit.
4. encode state with `outcomeTier = type(uint8).max` and zero randomness.
5. return `WAITING_RANDOMNESS`, `requestRandomnessNow = true`, `payout = 0`.

`onRandomness` must:

1. derive payout seed with `keccak256(abi.encodePacked(randomness, "BAD_IDEA_PAYOUT"))`;
2. obtain a uniform `0..9999` roll by taking 16-bit samples, accepting `< 60000`, rehashing rejected seeds;
3. map roll + mode to one of five tiers;
4. calculate `payout = ctx.wagerBase * multiplierBps / 10000`;
5. store mode, tier, and original VRF word in `newGameState`;
6. return `SETTLED`, `requestRandomnessNow = false`.

`onPlayerAction` always reverts because this is an instant game.

`quoteRiskParams` returns top-tier probability `1e16`, mode-specific max payout, exact `96%` expected payout, and zero sub-jackpot variance.

- [ ] **Step 4: Run simulator quote + repeated-round verification**

Run at least 25 rounds per mode through the real local VRF path. For every settled row, decode stored state and independently recompute the tier from the stored randomness using `badIdea.ts`; fail on any mismatch.

- [ ] **Step 5: Commit**

```bash
git add sdk/casino-sdk/simulator/contracts/BadIdeaMachineGame.sol \
  sdk/casino-sdk/examples/bad-idea-machine/scripts/simulate-flows.mjs
git commit -m "feat: add Bad Idea Machine contract"
```

---

### Task 4: Replace coinflip lifecycle with the Bad Idea round state machine

**Files:**
- Keep/adapt: `src/lib/useCasinoHost.ts`
- Create: `src/game/stateMachine.ts`
- Create: `src/game/stateMachine.test.ts`
- Create: `src/game/useBadIdeaRound.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Frontend states: `BOOT | READY | SUBMITTING | WAITING_FOR_RANDOMNESS | REVEALING | RESULT | ERROR`.
- `useBadIdeaRound()` exposes current authoritative round, `openRound(mode, wager)`, `finishReveal()`, and recoverable error state.

- [ ] **Step 1: Write transition tests**

Valid path:

```text
BOOT -> READY -> SUBMITTING -> WAITING_FOR_RANDOMNESS -> REVEALING -> RESULT -> READY
```

Also assert:
- duplicate `openRound` while active is rejected locally;
- cancelled/forfeited session becomes `ERROR`, never a 0x gambling result;
- `RESULT` is unreachable before terminal on-chain session state;
- `finishReveal()` is the only transition that calls host `revealOutcome`.

- [ ] **Step 2: Run tests and confirm RED**

```bash
npm --prefix sdk/casino-sdk/examples/bad-idea-machine test -- stateMachine.test.ts
```

- [ ] **Step 3: Implement bridge lifecycle using the reference coinflip pattern**

`openSession` call:

```ts
await hostApi.openSession({
  wager: wager.toString(),
  gameData: encodeGameData(mode),
  randomnessRequestData: EMPTY_HEX,
});
```

Match the resulting snapshot session by returned `sessionKey`. Treat `SETTLED` as the normal result path. Decode `raw.gameState`; if temporarily absent, wait for the next snapshot instead of fabricating a result.

After the reveal animation finishes:

```ts
await hostApi.revealOutcome({ sessionId });
```

Swallow only reveal-display errors; settlement is already authoritative.

- [ ] **Step 4: Run tests and build**

```bash
npm --prefix sdk/casino-sdk/examples/bad-idea-machine test
npm --prefix sdk/casino-sdk/examples/bad-idea-machine run check-types
```

- [ ] **Step 5: Commit**

```bash
git add sdk/casino-sdk/examples/bad-idea-machine/src/game \
  sdk/casino-sdk/examples/bad-idea-machine/src/App.tsx \
  sdk/casino-sdk/examples/bad-idea-machine/src/lib/useCasinoHost.ts
git commit -m "feat: add authoritative round lifecycle"
```

---

### Task 5: Build deterministic machine routes before drawing the machine

**Files:**
- Create: `src/machine/routeModel.ts`
- Create: `src/machine/routeModel.test.ts`

**Interfaces:**
- `buildRoute(tier, visualSeed)` returns an ordered list of station events with durations and variants.
- It may never return a different tier or multiplier.

- [ ] **Step 1: Write route invariants and content-count tests**

Require at least:
- 4 failure variants;
- 2 small variants;
- 2 medium variants;
- 2 big variants;
- 2 huge/finale variants.

Duration windows:
- failure 2–3s;
- small 3–4s;
- medium 3.5–4.5s;
- big 4.5–5.5s;
- huge 5.5–7s.

Generate 1,000 visual seeds per tier and assert every route stays inside its tier's allowed station depth and never changes economic data.

- [ ] **Step 2: Confirm RED, then implement deterministic route selection**

Route events use station ids:

```ts
'button' | 'toaster' | 'cat' | 'hammer' | 'ball' | 'fan' | 'dominoes' | 'rocket' | 'safe' | 'core'
```

Each event contains `{ station, variant, atMs, durationMs }`.

- [ ] **Step 3: Run tests and commit**

```bash
npm --prefix sdk/casino-sdk/examples/bad-idea-machine test -- routeModel.test.ts
git add sdk/casino-sdk/examples/bad-idea-machine/src/machine
git commit -m "feat: add deterministic catastrophe routes"
```

---

### Task 6: Build the responsive industrial machine shell

**Files:**
- Create: `src/machine/MachineStage.tsx`
- Create all `src/machine/components/*Station.tsx` files listed in the locked layout.
- Create/modify: `src/components/Header.tsx`, `ControlPanel.tsx`, `ResultOverlay.tsx`.
- Replace: `src/styles.css`.
- Modify: `src/App.tsx`.

**Interfaces:**
- Station components consume only visual station state/variant; they receive no wager or payout calculation functions.
- `MachineStage` consumes the active route + elapsed reveal time and derives station states.

- [ ] **Step 1: Implement the idle scene first**

Desktop composition: machine receives 70–80% visual emphasis; controls sit in a compact right panel. Mobile composition: machine remains above a compact bottom controls panel.

Required visible copy:

```text
BAD IDEA MACHINE
One button. Several terrible decisions.
DO NOT PRESS
```

Risk-state copy:

```text
CONTROLLED       SAFETY SYSTEMS: ENABLED
SEND IT          SAFETY SYSTEMS: OPTIONAL
ABSOLUTELY NOT   COMMON SENSE: OFFLINE
```

- [ ] **Step 2: Implement SVG/CSS station animations**

Use inline SVG/CSS transforms for machinery. Canvas is permitted only for lightweight sparks/debris. Do not add a 3D engine or background video.

- [ ] **Step 3: Implement result choreography**

The multiplier overlay is hidden until the final route event completes. Huge outcome sequence must include a short "suspiciously normal" beat before catastrophic success.

- [ ] **Step 4: Verify responsive behavior manually at 390×844, 768×1024, 1366×768, and 1920×1080**

No horizontal scroll; button and wager controls remain reachable; reveal may collapse controls on narrow screens.

- [ ] **Step 5: Commit**

```bash
git add sdk/casino-sdk/examples/bad-idea-machine/src
git commit -m "feat: build Bad Idea Machine visual shell"
```

---

### Task 7: Add mechanical sound as part of the reveal rhythm

**Files:**
- Create: `src/audio/audioEngine.ts`
- Modify station/route rendering to emit sound cues.
- Modify: `src/components/Header.tsx` for persistent sound toggle.

**Interfaces:**
- `audioEngine.unlock()` is called only from a user gesture.
- `audioEngine.play(cue)` plays short mechanical cues.
- `setMuted(boolean)` persists best-effort to localStorage but tolerates sandbox denial.

- [ ] **Step 1: Implement WebAudio-generated base cues**

Required cue families: click, relay, spring, ding, clunk, rolling, motor, domino cascade, ignition, alarm, explosion, failure sting, win sting.

Use WebAudio oscillators/noise/envelopes first so the initial payload stays small and licensing is clean. Add compressed samples only where procedural audio is clearly inadequate.

- [ ] **Step 2: Synchronize cues to route events**

Longer successful routes must accumulate rhythmic layers; loss routes end quickly and comedically.

- [ ] **Step 3: Verify mute/unmute and browser autoplay restrictions**

No audio should throw before the first user interaction.

- [ ] **Step 4: Commit**

```bash
git add sdk/casino-sdk/examples/bad-idea-machine/src/audio \
  sdk/casino-sdk/examples/bad-idea-machine/src/machine \
  sdk/casino-sdk/examples/bad-idea-machine/src/components/Header.tsx
git commit -m "feat: add mechanical sound design"
```

---

### Task 8: Add real fairness receipt and robust unhappy paths

**Files:**
- Create: `src/fairness/FairnessReceipt.tsx`
- Modify: `src/game/useBadIdeaRound.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Receipt consumes the actual settled session row, decoded game state, selected mode, wager, payout, route summary, and any SDK-provided identifiers.
- It never invents a proof field.

- [ ] **Step 1: Render `WHAT WENT WRONG?` with authoritative data**

Show mode, wager, route summary, multiplier, total return, `sessionId`, and available transaction/randomness identifiers from the snapshot/raw session.

- [ ] **Step 2: Independently verify the stored tier client-side**

Use the original stored VRF word and `badIdea.ts` payout-domain derivation. Display `VERIFIED RANDOMNESS` only when the recomputed tier equals the contract-stored tier. Otherwise show `VERIFICATION MISMATCH` and log enough diagnostic data for local debugging.

- [ ] **Step 3: Exercise simulator failures**

Test wallet not ready, slow indexed-feed lag, refresh mid-round, and stuck randomness/cancel path. A cancelled/forfeited session must never display as a gambling loss.

- [ ] **Step 4: Commit**

```bash
git add sdk/casino-sdk/examples/bad-idea-machine/src/fairness \
  sdk/casino-sdk/examples/bad-idea-machine/src/game \
  sdk/casino-sdk/examples/bad-idea-machine/src/App.tsx
git commit -m "feat: add fairness receipt and recovery paths"
```

---

### Task 9: Manifest, jam widget, static hosting, and submission documentation

**Files:**
- Replace: `public/game.manifest.json`
- Modify: `index.html`
- Create/modify: `vercel.json`, `README.md`, `SUBMISSION.md`
- Modify root: `README.md`

**Interfaces:**
- Manifest game id: `BadIdeaMachineGame`.
- Capabilities: `openSession: true`, `submitAction: false`, `resize: true`; keep unsupported lifecycle actions false unless the current SDK requires otherwise.

- [ ] **Step 1: Create the validated manifest**

```json
{
  "schemaVersion": 1,
  "gameId": "BadIdeaMachineGame",
  "apiVersion": 1,
  "defaultLocale": "en",
  "locales": {
    "en": {
      "name": "Bad Idea Machine",
      "description": "Choose how reckless you feel, press the button, and watch a ridiculous machine try to reach your multiplier."
    }
  },
  "presentation": {
    "mode": "full-iframe",
    "hostPanels": {
      "openSession": false,
      "history": false,
      "status": false
    }
  },
  "capabilities": {
    "openSession": true,
    "submitAction": false,
    "forfeitExpiredSession": false,
    "cancelStuckRandomness": false,
    "resize": true
  }
}
```

Validate with `validateCasinoGameManifest` from the vendored SDK.

- [ ] **Step 2: Add the required jam widget**

Add to `index.html`:

```html
<script async src="https://jam.chain.wtf/widget.js"></script>
```

- [ ] **Step 3: Document exact RTP math in game and root README**

Include the three complete paytables and state explicitly that 1.2× means total return, not 1.2× profit.

- [ ] **Step 4: Configure static deployment without iframe-blocking headers**

`vercel.json` must route SPA requests to `index.html` without setting `X-Frame-Options: DENY` or restrictive `frame-ancestors` rules.

- [ ] **Step 5: Commit**

```bash
git add README.md sdk/casino-sdk/examples/bad-idea-machine
git commit -m "docs: prepare Chain Jam submission"
```

---

### Task 10: CI, soak test, performance pass, and submission gate

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `sdk/casino-sdk/examples/bad-idea-machine/scripts/verify-build.mjs`
- Update: `SUBMISSION.md` with final checklist results.

**Interfaces:**
- CI must prove unit tests, type checks, and static build on Node 22.
- Local submission gate additionally requires real simulator/VRF runs.

- [ ] **Step 1: Add CI**

Workflow commands:

```bash
cd sdk/casino-sdk
npm ci
npm run test:sdk
npm run test:bad-idea
npm --prefix examples/bad-idea-machine run check-types
npm run build:bad-idea
```

- [ ] **Step 2: Add static build verifier**

The script must fail if:
- `dist/game.manifest.json` is missing;
- `dist/index.html` lacks `https://jam.chain.wtf/widget.js`;
- build emits unexpectedly large single assets (warn above 500 KiB, fail above 1 MiB unless explicitly justified);
- manifest validation fails.

- [ ] **Step 3: Run the full simulator soak**

Complete at least 100 real local-VRF rounds, distributed across all three modes. Assert every settled contract tier matches client-side independent recomputation from the stored randomness.

- [ ] **Step 4: Complete manual quality gate**

Check:
- every route and variant;
- muted/unmuted;
- desktop + mobile layouts;
- refresh mid-round;
- slow indexer;
- wallet non-ready states;
- stuck randomness/cancel behavior;
- direct URL standalone play;
- iframe embedding;
- no multiplier reveal before animation completion;
- no known half-finished UI exposed.

- [ ] **Step 5: Run final commands**

```bash
cd sdk/casino-sdk
npm run test:sdk
npm run test:bad-idea
npm --prefix examples/bad-idea-machine run check-types
npm run build:bad-idea
node examples/bad-idea-machine/scripts/verify-build.mjs
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add .github sdk/casino-sdk/examples/bad-idea-machine/SUBMISSION.md \
  sdk/casino-sdk/examples/bad-idea-machine/scripts/verify-build.mjs
git commit -m "ci: add Chain Jam submission gates"
```

---

## Plan Self-Review

- Spec coverage: contract/VRF/RTP, bridge lifecycle, machine routes, visual system, audio, fairness receipt, responsive layout, manifest/widget, simulator testing, static hosting, README, and submission checks are all assigned to tasks.
- Placeholder scan: no implementation task depends on a TBD symbol or undefined application interface. Upstream SDK internals are intentionally consumed through their published/current paths and bridge APIs.
- Type consistency: `RiskMode = 0|1|2`, `OutcomeTier = 0|1|2|3|4`, `gameData = uint8`, and `gameState = (uint8,uint8,bytes32)` are used consistently across contract, codec, state lifecycle, and fairness verification.
- Scope check: secondary systems remain excluded; the plan focuses on one polished instant wagering loop.
