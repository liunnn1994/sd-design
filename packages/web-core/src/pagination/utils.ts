export const getLegalPage = (page: number, { min, max }: { min: number; max: number }): number => {
  if (page < min) {
    return min;
  }
  if (page > max) {
    return max;
  }
  return page;
};

export function getStepPagerDisabled(
  disabled: boolean,
  pages: number,
  current: number,
  next: boolean,
) {
  if (disabled) return disabled;
  if (!pages) return true;
  if (next && current === pages) return true;
  return !next && current <= 1;
}

export function getPaginationTarget(current: number, step: number, pages: number) {
  return getLegalPage(current + step, { min: 1, max: pages });
}
