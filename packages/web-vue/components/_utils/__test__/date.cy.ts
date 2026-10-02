import { dayjs, methods } from '../date';

describe('week equality', () => {
  it('distinguishes matching week numbers in different years', () => {
    expect(methods.isSameWeek(dayjs('2025-01-01'), dayjs('2026-01-01'), 1)).to.equal(false);
  });

  it('recognizes a week crossing the year boundary', () => {
    expect(methods.isSameWeek(dayjs('2025-12-31'), dayjs('2026-01-01'), 1)).to.equal(true);
  });

  it('respects the configured first day of the week', () => {
    expect(methods.isSameWeek(dayjs('2026-01-04'), dayjs('2026-01-05'), 1)).to.equal(false);
    expect(methods.isSameWeek(dayjs('2026-01-04'), dayjs('2026-01-05'), 0)).to.equal(true);
  });
});
