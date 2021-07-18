/* eslint-disable no-undef */
const { MINIMUM_COIN_VALUE, MAXIMUM_COIN_VALUE } = require('../lib/constants');
const { isNumber, isBalance, isFeeOrPayment } = require('../lib/numbers');

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

describe('isBalance', () => {
  it('returns true if valid', () => {
    [0, 1, 3, 5, 10, 20, 1000].forEach((val) => {
      expect(isBalance(val)).toBe(true);
    });
  });

  it('returns false', () => {
    ['0', -1, null, undefined, Infinity, -Infinity, {}, Number.NaN].forEach((val) => {
      expect(isBalance(val)).toBe(false);
    });
  });
});

describe('isFeeOrPayment', () => {
  it('returns true if valid', () => {
    [MINIMUM_COIN_VALUE, 1.3, 3.1, 5.5, 10, 20, 1000, MAXIMUM_COIN_VALUE].forEach((val) => {
      expect(isFeeOrPayment(val)).toBe(true);
    });
  });

  it('returns false', () => {
    ['0', -1, MINIMUM_COIN_VALUE / 10, null, undefined, MAXIMUM_COIN_VALUE + 1, Infinity, -Infinity, {}, Number.NaN].forEach((val) => {
      expect(isFeeOrPayment(val)).toBe(false);
    });
  });
});
