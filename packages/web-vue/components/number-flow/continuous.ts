import type { NumberFlowPlugin } from './types';

/** 让最高变化位以下的未变化数字连续滚动。 */
export const continuous: NumberFlowPlugin = {
  getDelta(value, previousValue, context) {
    if (
      value === previousValue &&
      context.trend !== 0 &&
      context.highestChangedPosition !== undefined &&
      context.highestChangedPosition >= context.position
    ) {
      return context.length * context.trend;
    }
  },
};
