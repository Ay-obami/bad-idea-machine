export const KITCHEN_GREASE_FIRE_DURATION = 7200;

const SHARD_START = 2220;
const PAN_CONTACT = 2800;
const PAN_SETTLED = 3500;
const OIL_START = 3220;
const OIL_REACHES_BURNER = 4220;
const IGNITION_START = 4300;
const IGNITION_FULL = 5000;
const SMOKE_START = 4620;
const SCORCH_START = 4900;

const PAN_REST = { x: 222, y: 290, rotation: -4 } as const;
const PAN_HANDLE = { x: 246, y: 290 } as const;
const SHARD_ORIGIN = { x: 411.5, y: 306 } as const;
const BURNER = { x: 176, y: 307 } as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (t: number) => t * t * (3 - 2 * t);
const progress = (time: number, start: number, end: number) => clamp((time - start) / (end - start));

/**
 * First Checkpoint 3 chain. Pure geometry only: no payout/tier state and no second room renderer.
 * It begins from one of the accepted plate impacts and keeps every later cause in the same 1000x600 room.
 */
export function greaseFireFrame(elapsedMs: number) {
  const time = Number.isFinite(elapsedMs)
    ? Math.max(0, Math.min(KITCHEN_GREASE_FIRE_DURATION, elapsedMs))
    : 0;

  const shardProgress = smooth(progress(time, SHARD_START, PAN_CONTACT));
  const shardVisible = time >= SHARD_START && time <= PAN_CONTACT + 120;
  const panProgress = smooth(progress(time, PAN_CONTACT, PAN_SETTLED));
  const oilProgress = smooth(progress(time, OIL_START, OIL_REACHES_BURNER));
  const ignitionProgress = smooth(progress(time, IGNITION_START, IGNITION_FULL));
  const smokeProgress = smooth(progress(time, SMOKE_START, 5750));
  const scorchProgress = smooth(progress(time, SCORCH_START, 6100));

  const contactPulse = time >= PAN_CONTACT && time <= PAN_CONTACT + 220
    ? Math.sin(progress(time, PAN_CONTACT, PAN_CONTACT + 220) * Math.PI)
    : 0;
  const recoil = panProgress < 1
    ? Math.sin(panProgress * Math.PI * 2.2) * (1 - panProgress)
    : 0;

  // The pan never leaves its stove support. The fragment only knocks the handle enough to tip the bowl.
  const panX = PAN_REST.x - 10 * panProgress + recoil * 1.8;
  const panY = PAN_REST.y + 2.5 * panProgress;
  const panRotation = PAN_REST.rotation - 9 * panProgress + recoil * 2.2;
  const oilFrom = { x: panX - 23, y: panY + 12 };
  const oilLead = {
    x: oilFrom.x + (BURNER.x - oilFrom.x) * oilProgress,
    y: oilFrom.y + (BURNER.y - oilFrom.y) * oilProgress,
  };
  const fireIntensity = ignitionProgress * (.72 + .28 * Math.sin(time / 155) ** 2);

  const damageIds: string[] = [];
  if (panProgress > 0) damageIds.push('pan-displaced');
  if (oilProgress > 0) damageIds.push('oil-spill');
  if (ignitionProgress > 0) damageIds.push('localized-grease-fire');
  if (scorchProgress > 0) damageIds.push('burner-scorch');

  return {
    time,
    triggerShard: {
      visible: shardVisible,
      x: SHARD_ORIGIN.x + (PAN_HANDLE.x - SHARD_ORIGIN.x) * shardProgress,
      y: SHARD_ORIGIN.y + (PAN_HANDLE.y - SHARD_ORIGIN.y) * shardProgress
        - Math.sin(shardProgress * Math.PI) * 18,
      rotation: -32 - 215 * shardProgress,
      contactProgress: progress(time, SHARD_START, PAN_CONTACT),
    },
    pan: {
      x: panX,
      y: panY,
      rotation: panRotation,
      motion: panProgress,
      contactPulse,
      supported: true,
      contact: PAN_HANDLE,
      oilLip: oilFrom,
    },
    oil: {
      progress: oilProgress,
      from: oilFrom,
      leadingEdge: oilLead,
      to: BURNER,
      opacity: .15 + .48 * oilProgress,
    },
    ignition: { x: BURNER.x, y: BURNER.y, progress: ignitionProgress },
    fire: { root: BURNER, intensity: fireIntensity },
    smoke: { root: BURNER, opacity: smokeProgress * .44, progress: smokeProgress },
    scorch: { center: BURNER, opacity: scorchProgress * .7, progress: scorchProgress },
    damageIds,
    label: time < SHARD_START
      ? 'The accepted cabinet-and-plate accident plays unchanged.'
      : time < PAN_CONTACT
        ? 'One ceramic fragment skitters across the worktop toward the pan handle.'
        : time < OIL_START
          ? 'The fragment catches the handle. The pan stays on the stove but tips under the knock.'
          : time < OIL_REACHES_BURNER
            ? 'Hot oil creeps out of the tipped pan toward the exposed burner.'
            : time < IGNITION_START
              ? 'The oil reaches the hot burner.'
              : time < SCORCH_START
                ? 'The spill ignites exactly where it meets the burner.'
                : 'The pan, oil residue, localized fire, smoke and scorch remain in the same room.',
  } as const;
}
