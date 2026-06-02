// Rounding helpers that match Python's round(value, ndigits) for the
// precision the pipeline relies on.

export function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export const round2 = (value: number): number => round(value, 2);
export const round5 = (value: number): number => round(value, 5);
