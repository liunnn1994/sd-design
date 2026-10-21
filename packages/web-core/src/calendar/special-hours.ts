import type {
  SpecialHoursRange,
  SpecialHoursDay,
  SpecialHours,
  DisallowedHours,
  SpecialHoursInput,
} from './types.js';

const isSpecialHoursRange = (value: unknown): value is SpecialHoursRange => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const hasCoords = 'from' in value || 'to' in value;
  return hasCoords && ('class' in value || 'label' in value || 'allowEvents' in value);
};

const normalizeSpecialHoursRanges = (
  ranges: SpecialHoursRange | SpecialHoursRange[] | undefined,
) => {
  if (!ranges) return [];
  const list = Array.isArray(ranges) ? ranges : [ranges];
  const valid: SpecialHoursRange[] = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (isSpecialHoursRange(item)) valid.push({ ...item });
  }
  return valid;
};

export const normalizeSpecialHoursDay = (
  dayConfig: SpecialHoursInput[string] | undefined,
): SpecialHoursDay | null => {
  if (!dayConfig) return null;

  if (Array.isArray(dayConfig) || isSpecialHoursRange(dayConfig)) {
    return {
      default: normalizeSpecialHoursRanges(dayConfig),
      schedules: {} as Record<string, SpecialHoursRange[]>,
    };
  }

  if (typeof dayConfig !== 'object') return null;

  const normalized = {
    default: normalizeSpecialHoursRanges(dayConfig.default),
    schedules: {} as Record<string, SpecialHoursRange[]>,
  };

  let scheduleKeyCount = 0;
  const schedulesSrc = dayConfig.schedules;
  if (schedulesSrc && typeof schedulesSrc === 'object') {
    const scheduleKeys = Object.keys(schedulesSrc);
    scheduleKeyCount = scheduleKeys.length;
    for (let i = 0; i < scheduleKeys.length; i++) {
      const scheduleId = scheduleKeys[i];
      normalized.schedules[scheduleId] = normalizeSpecialHoursRanges(schedulesSrc[scheduleId]);
    }
  }

  if (!normalized.default.length && !scheduleKeyCount) return null;
  return normalized;
};

/**
 * Plain `{ from, to }` segments where `allowEvents === false`, keyed like normalized specialHours.
 * Used for fast overlap checks (see `specialHoursDisallowed` computed).
 * Tuned for few weekdays / ranges: avoid Object.keys arrays and empty per-day shells.
 */
export const buildSpecialHoursDisallowed = (normalizedByWeekday: SpecialHours): DisallowedHours => {
  const byWeekday: DisallowedHours['byWeekday'] = {};
  let hasAny = false;
  for (const weekday in normalizedByWeekday) {
    if (!Object.prototype.hasOwnProperty.call(normalizedByWeekday, weekday)) continue;
    const day = normalizedByWeekday[weekday];
    if (!day) continue;

    let defOut: SpecialHoursRange[] | null = null;
    let schedulesOut: Record<string, SpecialHoursRange[]> | null = null;

    const def = day.default;
    if (def && def.length) {
      for (let ri = 0; ri < def.length; ri++) {
        const r = def[ri];
        if (
          r &&
          r.allowEvents === false &&
          typeof r.from === 'number' &&
          typeof r.to === 'number'
        ) {
          if (!defOut) defOut = [];
          defOut.push({ from: r.from, to: r.to });
          hasAny = true;
        }
      }
    }

    const schedSrc = day.schedules;
    if (schedSrc && typeof schedSrc === 'object') {
      for (const scheduleId in schedSrc) {
        if (!Object.prototype.hasOwnProperty.call(schedSrc, scheduleId)) continue;
        const ranges = schedSrc[scheduleId];
        if (!ranges) continue;
        const arr = [];
        for (let ri = 0; ri < ranges.length; ri++) {
          const r = ranges[ri];
          if (
            r &&
            r.allowEvents === false &&
            typeof r.from === 'number' &&
            typeof r.to === 'number'
          ) {
            arr.push({ from: r.from, to: r.to });
            hasAny = true;
          }
        }
        // Preserve empty overrides so this schedule does not inherit default restrictions.
        if (!schedulesOut) schedulesOut = {};
        schedulesOut[scheduleId] = arr;
      }
    }

    if (defOut || schedulesOut) {
      const outDay: DisallowedHours['byWeekday'][string] = {};
      if (defOut) outDay.default = defOut;
      if (schedulesOut) outDay.schedules = schedulesOut;
      byWeekday[weekday] = outDay;
    }
  }
  return { hasAny, byWeekday };
};
