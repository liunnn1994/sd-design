// Engine-level contracts shared by every mode implementation.

import type { ModeOpts } from './profiles.js';

export type { Dot, Line } from './core.js';

/** One frame painter: draws a mode into a 2D context at CSS-px `size`. */
export type ModeDraw = (
  ctx: CanvasRenderingContext2D,
  size: number,
  t: number,
  dark: boolean,
  opts: ModeOpts,
) => void;
