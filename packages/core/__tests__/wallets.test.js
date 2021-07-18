/* eslint-disable no-undef */
const { DEFAULT_TRANSACTION, DEFAULT_WALLET } = require('../__mocks__/data');
const { ADDRESS_PREFIX } = require('../lib/constants');
const {
  isAddress, createWallet, publicKeyToAddress, signString, isValidSignature,
} = require('../lib/wallets');

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

  it('check if address is 20 bytes', () => {
    expect(isAddress(DEFAULT_TRANSACTION.to.slice(0, -3))).toBe(false);
  });
});

describe('publicKeyToAddress', () => {
  it('should return correct address', () => {
    expect(publicKeyToAddress(DEFAULT_WALLET.publicKey)).toEqual(DEFAULT_WALLET.address);
  });
});

describe('createWallet', () => {
  it('returns public, private, and address', () => {
    const wallet = createWallet();
    expect(wallet.publicKey.length).toEqual(130);
    expect(wallet.privateKey.length).toEqual(64);
  });
});

describe('signString', () => {
  const rawString = 'hello world';
  it('should return verifiable signature', async () => {
    const signature = await signString(rawString, DEFAULT_WALLET.privateKey);
    await expect(
      isValidSignature(rawString, signature, DEFAULT_WALLET.publicKey),
    ).resolves.toBe(true);
  });
});

describe('isValidSignature', () => {
  it('should return false is signature invalid', async () => {
    await expect(
      isValidSignature('hello world', 'afdef12fefaed', DEFAULT_WALLET.publicKey),
    ).resolves.toBe(false);
  });
});
