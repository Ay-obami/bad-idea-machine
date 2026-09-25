import { KITCHEN_APPROVED_MASTER } from './kitchen-master';
import { KITCHEN_CABINET_ARCHITECTURE } from './kitchen-cabinet-architecture';
import {
  KITCHEN_KETTLE_TRUTH, KITCHEN_PAN_TRUTH, KITCHEN_PLATE_TRUTH,
  KITCHEN_TOASTER_TRUTH, KITCHEN_TOAST_TRUTH, KITCHEN_TOWEL_TRUTH,
} from './kitchen-object-truth-proof';
import type { KitchenTerminalLayer } from './kitchen-terminal-layer-plan';

/** Existing photographed sources. An atlas frame still needs an explicit crop and placement. */
export type KitchenTerminalSourceEvidence = Readonly<{
  url: string;
  frame?: string;
  status: 'direct' | 'composition' | 'study';
}>;

const atlas = (url: string, frame: string): KitchenTerminalSourceEvidence =>
  ({ url, frame, status: 'direct' });
const composition = (url: string): KitchenTerminalSourceEvidence => ({ url, status: 'composition' });
const study = (url: string): KitchenTerminalSourceEvidence => ({ url, status: 'study' });

const sources: Readonly<Record<string, KitchenTerminalSourceEvidence>> = {
  'architecture/left-shell/intact': composition(KITCHEN_APPROVED_MASTER.sourceUrl),
  'architecture/right-wall-shell/intact': composition(KITCHEN_APPROVED_MASTER.sourceUrl),
  'architecture/plate-cabinet/hinge-stressed': composition(KITCHEN_CABINET_ARCHITECTURE.intactUrl),
  'architecture/plate-cabinet/door-hanging': composition(KITCHEN_CABINET_ARCHITECTURE.intactUrl),
  'architecture/upper-stove-cabinet/intact': composition(KITCHEN_APPROVED_MASTER.sourceUrl),
  'architecture/backsplash/intact': composition(KITCHEN_APPROVED_MASTER.sourceUrl),
  'architecture/stove-range/pan-shifted': composition(KITCHEN_PAN_TRUTH.supportUrl),
  'architecture/right-counter/intact': composition(KITCHEN_APPROVED_MASTER.sourceUrl),
  'architecture/right-lower-cabinet/intact': composition(KITCHEN_APPROVED_MASTER.sourceUrl),
  'architecture/sink-run/intact': composition(KITCHEN_APPROVED_MASTER.sourceUrl),
  'architecture/floor-center/light-debris': study('/rooms/kitchen/rebuild/truth/tier1-floor-ceramic-study.webp'),
  'architecture/upper-stove-cabinet/smoke-stained': study('/rooms/kitchen/rebuild/truth/tier2-cabinet-soot-edge-study.webp'),
  'architecture/backsplash/sooted': study('/rooms/kitchen/rebuild/truth/tier2-soot-study.webp'),
  'architecture/stove-range/grease-burning': study('/rooms/kitchen/rebuild/truth/tier2-grease-study.webp'),
  'prop/pan/nudged': composition(KITCHEN_PAN_TRUTH.bodyUrl),
  'shadow/pan/nudged': composition(KITCHEN_PAN_TRUTH.shadowUrl),
  'prop/toaster/resting': atlas(KITCHEN_TOASTER_TRUTH.atlasUrl, 'body+cord'),
  'shadow/toaster/resting': atlas(KITCHEN_TOASTER_TRUTH.atlasUrl, 'wallShadow+contactShadow+reflection'),
  'prop/toast/landed': { ...atlas(KITCHEN_TOAST_TRUTH.atlasUrl, 'body'), status: 'composition' },
  'shadow/toast/landed': { ...atlas(KITCHEN_TOAST_TRUTH.atlasUrl, 'shadow'), status: 'composition' },
  'prop/toast-stack/stacked': atlas(KITCHEN_TOAST_TRUTH.atlasUrl, 'remainingBody'),
  'prop/kettle/resting': atlas(KITCHEN_KETTLE_TRUTH.atlasUrl, 'body'),
  'shadow/kettle/resting': atlas(KITCHEN_KETTLE_TRUTH.atlasUrl, 'shadow+reflection'),
  'prop/plate-stack/missing-one': atlas(KITCHEN_PLATE_TRUTH.atlasUrl, 'stackBody'),
  'shadow/plate-stack/missing-one': atlas(KITCHEN_PLATE_TRUTH.atlasUrl, 'stackShadow'),
  'prop/oven-towel/hanging': atlas(KITCHEN_TOWEL_TRUTH.atlasUrl, 'body'),
  'shadow/oven-towel/hanging': atlas(KITCHEN_TOWEL_TRUTH.atlasUrl, 'shadow'),
};

export function kitchenTerminalSourceEvidence(layer: KitchenTerminalLayer): KitchenTerminalSourceEvidence | undefined {
  return sources[`${layer.kind}/${layer.ownerId}/${layer.state}`];
}

export const KITCHEN_TERMINAL_SOURCE_EVIDENCE = sources;
