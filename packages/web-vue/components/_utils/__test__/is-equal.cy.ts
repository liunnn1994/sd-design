import { isEqual } from '../is-equal';

describe('object equality', () => {
  it('detects additional object fields in either direction', () => {
    expect(isEqual({ color: 'red' }, { color: 'red', background: 'blue' })).to.equal(false);
    expect(isEqual({ color: 'red', background: 'blue' }, { color: 'red' })).to.equal(false);
  });

  it('distinguishes different own fields with undefined values', () => {
    expect(isEqual({ first: undefined }, { second: undefined })).to.equal(false);
  });

  it('detects additional fields in nested objects', () => {
    expect(isEqual({ style: {} }, { style: { color: 'red' } })).to.equal(false);
  });

  it('preserves equality for matching nested objects and arrays', () => {
    expect(
      isEqual(
        { style: { color: 'red' }, keys: [0, ''] },
        { keys: [0, ''], style: { color: 'red' } },
      ),
    ).to.equal(true);
  });
});
