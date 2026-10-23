import type { SkeletonRevealBox, SkeletonRevealShape } from './types.js';

export interface SkeletonRevealGeometry {
  box: SkeletonRevealBox;
  shapes: SkeletonRevealShape[];
}

/** One bounded DOM measurement pass; playback never reads layout. */
export function measureSkeletonReveal(content: HTMLElement): SkeletonRevealGeometry | undefined {
  const bounds = content.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const elements = [
    content,
    ...Array.from(
      content.querySelectorAll(
        'button, input, textarea, select, a, h1, h2, h3, p, label, [role="tab"]',
      ),
    ).slice(0, 23),
  ];
  return {
    box: { width: bounds.width, height: bounds.height },
    shapes: elements.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return [];
      return [
        {
          x: Math.max(1, rect.x - bounds.x + 1),
          y: Math.max(1, rect.y - bounds.y + 1),
          width: Math.max(1, Math.min(rect.width - 2, bounds.width - 2)),
          height: Math.max(1, Math.min(rect.height - 2, bounds.height - 2)),
          radius: Math.min(8, rect.height / 2),
        },
      ];
    }),
  };
}
