export interface ThresholdInput {
  R: number;
  H?: number;
  B?: number;
}

export function recommendWorkerThreshold({ R, H = 0, B = 50 }: ThresholdInput): number {
  return Math.max(1, Math.floor(B / (R * (1 - H) || 1e-6)));
}

export function estimateRByFormula(sample: string): 'simple' | 'medium' | 'complex' {
  const cost = sample.length + 10 * (sample.match(/\\/g) || []).length;
  return cost < 10 ? 'simple' : cost < 40 ? 'medium' : 'complex';
}

export function defaultRByClass(value: 'simple' | 'medium' | 'complex'): number {
  switch (value) {
    case 'simple':
      return 3;
    case 'medium':
      return 10;
    case 'complex':
      return 30;
  }
}

export function recommendNForSamples(
  samples: string[],
  options?: { H?: number; B?: number },
): number {
  let cost = 0;
  for (const sample of samples) cost = Math.max(cost, defaultRByClass(estimateRByFormula(sample)));
  return recommendWorkerThreshold({ R: cost, H: options?.H ?? 0, B: options?.B ?? 50 });
}
