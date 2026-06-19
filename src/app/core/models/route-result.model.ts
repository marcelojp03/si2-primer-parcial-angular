export interface RouteResult {
  points: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  eta: Date;
  provider: string;
  /** Set only when all routing providers failed. Screens should display this instead of distance/ETA. */
  errorMessage?: string;
}

export function isRouteError(r: RouteResult | null): boolean {
  return r != null && !!r.errorMessage;
}

