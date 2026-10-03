import { dayjs, getDayjsValue, methods } from '../date';

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

describe('getDayjsValue with a quarter format', () => {
  it('parses a quarter value into its first month', () => {
    const value = getDayjsValue('2026-Q3', 'YYYY-[Q]Q');
    expect(value.isValid()).to.equal(true);
    expect(value.format('YYYY-MM')).to.equal('2026-07');
  });

  it('does not throw when the value carries no quarter token', () => {
    expect(() => getDayjsValue('2026-07-01', 'YYYY-[Q]Q')).to.not.throw();
  });
});
