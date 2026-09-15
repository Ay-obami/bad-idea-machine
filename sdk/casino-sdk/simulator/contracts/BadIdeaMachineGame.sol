// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { ICasinoGameV2, SessionContext, SessionPhase, StepResult } from './ICasinoGameV2.sol';

/// @title Bad Idea Machine
/// @notice Instant Chain.wtf casino game with three volatility profiles and exact 96% RTP paytables.
/// @dev The VRF word is domain-separated before economic sampling. Visual variation uses a
///      separate domain and cannot affect the payout tier.
contract BadIdeaMachineGame is ICasinoGameV2 {
  uint256 public constant BASIS_POINTS = 10_000;
  uint256 public constant RTP_BPS = 9_600;
  uint256 public constant WAD = 1e18;
  uint256 public constant TOP_TIER_PROBABILITY_WAD = 1e16; // 1%

  uint8 public constant MODE_CONTROLLED = 0;
  uint8 public constant MODE_SEND_IT = 1;
  uint8 public constant MODE_ABSOLUTELY_NOT = 2;

  uint8 public constant TIER_FAILURE = 0;
  uint8 public constant TIER_SMALL = 1;
  uint8 public constant TIER_MEDIUM = 2;
  uint8 public constant TIER_BIG = 3;
  uint8 public constant TIER_HUGE = 4;
  uint8 private constant TIER_PENDING = type(uint8).max;

  uint16 private constant SAMPLE_ACCEPT_LIMIT = 60_000;
  string private constant PAYOUT_DOMAIN = 'BAD_IDEA_PAYOUT';
  string private constant VISUAL_DOMAIN = 'BAD_IDEA_VISUAL';

  error BadIdeaMachine__BadGameData();
  error BadIdeaMachine__InvalidRiskMode();
  error BadIdeaMachine__InvalidRoll();
  error BadIdeaMachine__InvalidTier();
  error BadIdeaMachine__NoPlayerAction();
  error BadIdeaMachine__BadGameState();

  struct BadIdeaState {
    uint8 riskMode;
    uint8 tier;
    bytes32 randomness;
  }

  // -------------------------------------------------------------------------
  // Public math helpers — intentionally inspectable by judges/integrators.
  // -------------------------------------------------------------------------

  function multiplierBps(uint8 riskMode, uint8 tier) public pure returns (uint256) {
    _validateRiskMode(riskMode);
    if (tier > TIER_HUGE) revert BadIdeaMachine__InvalidTier();

    if (riskMode == MODE_CONTROLLED) {
      if (tier == TIER_FAILURE) return 0;
      if (tier == TIER_SMALL) return 12_000;
      if (tier == TIER_MEDIUM) return 20_000;
      if (tier == TIER_BIG) return 40_000;
      return 80_000;
    }

    if (riskMode == MODE_SEND_IT) {
      if (tier == TIER_FAILURE) return 0;
      if (tier == TIER_SMALL) return 15_000;
      if (tier == TIER_MEDIUM) return 30_000;
      if (tier == TIER_BIG) return 60_000;
      return 120_000;
    }

    if (tier == TIER_FAILURE) return 0;
    if (tier == TIER_SMALL) return 20_000;
    if (tier == TIER_MEDIUM) return 50_000;
    if (tier == TIER_BIG) return 100_000;
    return 160_000;
  }

  function tierFromRoll(uint8 riskMode, uint256 roll) public pure returns (uint8) {
    _validateRiskMode(riskMode);
    if (roll >= BASIS_POINTS) revert BadIdeaMachine__InvalidRoll();

    if (riskMode == MODE_CONTROLLED) {
      if (roll < 4_500) return TIER_FAILURE;
      if (roll < 8_000) return TIER_SMALL;
      if (roll < 9_500) return TIER_MEDIUM;
      if (roll < 9_900) return TIER_BIG;
      return TIER_HUGE;
    }

    if (riskMode == MODE_SEND_IT) {
      if (roll < 6_500) return TIER_FAILURE;
      if (roll < 8_500) return TIER_SMALL;
      if (roll < 9_500) return TIER_MEDIUM;
      if (roll < 9_900) return TIER_BIG;
      return TIER_HUGE;
    }

    if (roll < 8_000) return TIER_FAILURE;
    if (roll < 9_000) return TIER_SMALL;
    if (roll < 9_600) return TIER_MEDIUM;
    if (roll < 9_900) return TIER_BIG;
    return TIER_HUGE;
  }

  function payoutFor(uint256 wager, uint8 riskMode, uint8 tier) public pure returns (uint256) {
    return (wager * multiplierBps(riskMode, tier)) / BASIS_POINTS;
  }

  function maxPayoutFor(uint256 wager, uint8 riskMode) public pure returns (uint256) {
    return payoutFor(wager, riskMode, TIER_HUGE);
  }

  function payoutSeed(bytes32 randomness) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(randomness, PAYOUT_DOMAIN));
  }

  function visualSeed(bytes32 randomness) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(randomness, VISUAL_DOMAIN));
  }

  function rollFromRandomness(bytes32 randomness) public pure returns (uint256) {
    return _uniformRoll10k(payoutSeed(randomness));
  }

  // -------------------------------------------------------------------------
  // ICasinoGameV2
  // -------------------------------------------------------------------------

  function quoteCaps(
    uint256 wager,
    bytes calldata gameData
  ) external pure returns (uint256 maxEscrowStake, uint256 maxReservedProfit) {
    uint8 riskMode = _decodeRiskMode(gameData);
    uint256 maxPayout = maxPayoutFor(wager, riskMode);
    maxEscrowStake = wager;
    maxReservedProfit = maxPayout > wager ? maxPayout - wager : 0;
  }

  function quoteRiskParams(
    uint256 wager,
    bytes calldata gameData
  )
    external
    pure
    returns (
      uint256 maxPayout,
      uint256 probabilityWad,
      uint256 expectedPayout,
      uint256 subJackpotVarianceScaled
    )
  {
    uint8 riskMode = _decodeRiskMode(gameData);
    maxPayout = maxPayoutFor(wager, riskMode);
    probabilityWad = TOP_TIER_PROBABILITY_WAD;
    expectedPayout = (wager * RTP_BPS) / BASIS_POINTS;
    subJackpotVarianceScaled = 0;
  }

  function onSessionStart(
    SessionContext calldata ctx
  ) external pure returns (StepResult memory stepResult) {
    uint8 riskMode = _decodeRiskMode(ctx.gameData);
    uint256 maxPayout = maxPayoutFor(ctx.wagerBase, riskMode);
    uint256 maxReservedProfit = maxPayout > ctx.wagerBase ? maxPayout - ctx.wagerBase : 0;

    BadIdeaState memory state = BadIdeaState({
      riskMode: riskMode,
      tier: TIER_PENDING,
      randomness: bytes32(0)
    });

    stepResult.newGameState = abi.encode(state);
    stepResult.escrowDelta = 0;
    stepResult.reservedProfitDelta = int256(maxReservedProfit);
    stepResult.nextPhase = SessionPhase.WAITING_RANDOMNESS;
    stepResult.requestRandomnessNow = true;
    stepResult.payout = 0;
  }

  function onPlayerAction(
    SessionContext calldata,
    bytes calldata
  ) external pure returns (StepResult memory) {
    revert BadIdeaMachine__NoPlayerAction();
  }

  function onRandomness(
    SessionContext calldata ctx,
    bytes32 randomness
  ) external pure returns (StepResult memory stepResult) {
    BadIdeaState memory previous = abi.decode(ctx.gameState, (BadIdeaState));
    uint8 riskMode = _decodeRiskMode(ctx.gameData);
    if (
      previous.riskMode != riskMode ||
      previous.tier != TIER_PENDING ||
      previous.randomness != bytes32(0)
    ) revert BadIdeaMachine__BadGameState();

    uint256 roll = rollFromRandomness(randomness);
    uint8 tier = tierFromRoll(riskMode, roll);
    uint256 payout = payoutFor(ctx.wagerBase, riskMode, tier);

    BadIdeaState memory settled = BadIdeaState({
      riskMode: riskMode,
      tier: tier,
      randomness: randomness
    });

    stepResult.newGameState = abi.encode(settled);
    stepResult.escrowDelta = 0;
    // The host releases the reserve on settlement. Releasing it here would cap wins >1x.
    stepResult.reservedProfitDelta = 0;
    stepResult.nextPhase = SessionPhase.SETTLED;
    stepResult.requestRandomnessNow = false;
    stepResult.payout = payout;
  }

  function quoteForfeitPayout(
    SessionContext calldata
  ) external pure returns (uint256 cashoutValue) {
    return 0;
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  function _decodeRiskMode(bytes calldata gameData) private pure returns (uint8 riskMode) {
    if (gameData.length != 32) revert BadIdeaMachine__BadGameData();
    riskMode = abi.decode(gameData, (uint8));
    _validateRiskMode(riskMode);
  }

  function _validateRiskMode(uint8 riskMode) private pure {
    if (riskMode > MODE_ABSOLUTELY_NOT) revert BadIdeaMachine__InvalidRiskMode();
  }

  /// @dev Unbiased 0..9999 draw. 60,000 is exactly six complete 10,000-outcome partitions.
  function _uniformRoll10k(bytes32 initialSeed) private pure returns (uint256) {
    bytes32 seed = initialSeed;

    while (true) {
      for (uint256 index = 0; index < 32; index += 2) {
        uint16 sample = (uint16(uint8(seed[index])) << 8) | uint16(uint8(seed[index + 1]));
        if (sample < SAMPLE_ACCEPT_LIMIT) return uint256(sample % uint16(BASIS_POINTS));
      }
      seed = keccak256(abi.encodePacked(seed));
    }
  }
}
