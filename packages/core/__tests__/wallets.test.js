/* eslint-disable no-undef */
const { DEFAULT_TRANSACTION } = require('../__mocks__/data');
const { ADDRESS_PREFIX } = require('../lib/constants');
const { isAddress } = require('../lib/wallets');

describe('isAddress', () => {
  it('returns true', () => {
    expect(isAddress(DEFAULT_TRANSACTION.to)).toBe(true);
  });

  it('type checks for string', () => {
    [undefined, null, true, 1234].forEach((val) => {
      expect(isAddress(val)).toBe(false);
    });
  });

  it('checks for address prefix', () => {
    expect(isAddress(DEFAULT_TRANSACTION.to.slice(ADDRESS_PREFIX.length))).toBe(false);
  });
});
