/* eslint-disable no-undef */
const { isPlainObject } = require('../lib/objects');

describe('isPlainObject', () => {
  it('returns true', () => {
    [{}, { hello: 'world' }].forEach((val) => {
      expect(isPlainObject(val)).toBe(true);
    });
  });
  it('returns false', () => {
    [[], null, undefined, 5, ''].forEach((val) => {
      expect(isPlainObject(val)).toBe(false);
    });
  });
});
