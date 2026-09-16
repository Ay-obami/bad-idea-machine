export type AppView = 'gallery' | 'play';

export type RecoverableSession = Readonly<{
  gameAddress: string;
  phase?: number;
  phaseName?: string;
}>;

export function visibleView(requested: AppView, roundInFlight: boolean): AppView {
  return roundInFlight ? 'play' : requested;
}

export function hasRecoverableRound(
  sessions: readonly RecoverableSession[],
  gameAddress: string,
): boolean {
  const normalizedGameAddress = gameAddress.toLowerCase();
  return sessions.some(session =>
    session.gameAddress.toLowerCase() === normalizedGameAddress
    && (session.phase === 1 || session.phaseName === 'WAITING_RANDOMNESS'),
  );
}
