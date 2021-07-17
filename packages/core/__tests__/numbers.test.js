/* eslint-disable no-undef */
const { isNumber } = require('../lib/numbers');

describe('isNumber', () => {
  it('returns true if number', () => {
    [5, 0.1, -Infinity, Infinity].forEach((val) => {
      expect(isNumber(val)).toBe(true);
    });
  });
  it('returns false if not a number', () => {
    [Number.NaN, undefined, null, '1234', '', {}, '0.05'].forEach((val) => {
      expect(isNumber(val)).toBe(false);
    });
  });
});
