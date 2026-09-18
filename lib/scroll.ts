// Shared mutable frame state avoids a React render on every scroll tick.
export const journey = { progress: 0, reduced: false };
export const stages = ['RAW SIGNAL', 'STRUCTURED DATA', 'CONNECTED FACTORY', 'ENTERPRISE INTELLIGENCE', 'SYSTEM CONNECTED'];
export function stageIndex(progress: number) {
  return progress < 0.15 ? 0 : progress < 0.4 ? 1 : progress < 0.65 ? 2 : progress < 0.9 ? 3 : 4;
}
