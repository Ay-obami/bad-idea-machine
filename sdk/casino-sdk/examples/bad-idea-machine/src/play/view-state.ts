export type AppView = 'gallery' | 'play';

export function visibleView(requested: AppView, roundInFlight: boolean): AppView {
  return roundInFlight ? 'play' : requested;
}
