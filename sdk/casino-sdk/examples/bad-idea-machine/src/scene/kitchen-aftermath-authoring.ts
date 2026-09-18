import type { OutcomeTier } from '../lib/badIdea';

export type KitchenAftermathAuthoringPlate = Readonly<{
  tier: OutcomeTier;
  label: string;
  url: string;
  artDirection: string;
  runtimeRole: 'authoring-reference-only';
  allowedAsFullFrameOutcome: false;
}>;

export const KITCHEN_AFTERMATH_AUTHORING: Readonly<Record<OutcomeTier, KitchenAftermathAuthoringPlate>> = {
  0: {
    tier: 0,
    label: 'Catastrophic loss',
    url: 'https://cdn.creativeclaw.co/u/534269cc/images/6cc5ed43-8408-436c-9dfb-f629afeffc1c.png',
    artDirection: 'Ugly heat/impact wreck with heavy debris, smoke residue and broad but still room-registered damage.',
    runtimeRole: 'authoring-reference-only',
    allowedAsFullFrameOutcome: false,
  },
  1: {
    tier: 1,
    label: 'Localized',
    url: 'https://cdn.creativeclaw.co/u/534269cc/images/e8b81500-cf66-45ea-9558-d0f6fc978291.png',
    artDirection: 'One readable localized accident: a single broken plate, slight cabinet/pan disturbance, otherwise habitable.',
    runtimeRole: 'authoring-reference-only',
    allowedAsFullFrameOutcome: false,
  },
  2: {
    tier: 2,
    label: 'Moderate',
    url: 'https://cdn.creativeclaw.co/u/534269cc/images/e0256a77-95fc-42fa-a05b-846e4dda3191.png',
    artDirection: 'Connected cabinet, ceramic and stove damage with localized soot and light lingering hazard.',
    runtimeRole: 'authoring-reference-only',
    allowedAsFullFrameOutcome: false,
  },
  3: {
    tier: 3,
    label: 'Severe',
    url: 'https://cdn.creativeclaw.co/u/534269cc/images/6d71bcfd-ec4c-4342-9a6f-0e073fb8ded9.png',
    artDirection: 'Structural cabinet/counter damage, heavy stove history and broad persistent debris without losing room identity.',
    runtimeRole: 'authoring-reference-only',
    allowedAsFullFrameOutcome: false,
  },
  4: {
    tier: 4,
    label: 'Absurd cinematic',
    url: 'https://cdn.creativeclaw.co/u/534269cc/images/d61ee446-079d-4c9c-a7d8-4332b1013bf9.png',
    artDirection: 'Widest physically connected destruction: broken cabinetry, fractured surfaces, active localized fire and heavy debris.',
    runtimeRole: 'authoring-reference-only',
    allowedAsFullFrameOutcome: false,
  },
} as const;
