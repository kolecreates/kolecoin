/* eslint-disable no-undef */
const { DEFAULT_TRANSACTION, USER_WALLET_1 } = require('../__mocks__/data');
const {
  isPublicKey, createWallet, signString, isValidSignature,
} = require('../lib/wallets');

describe('isPublicKey', () => {
  it('returns true', () => {
    expect(isPublicKey(DEFAULT_TRANSACTION.to)).toBe(true);
  });

  it('type checks for string', () => {
    [undefined, null, true, 1234].forEach((val) => {
      expect(isPublicKey(val)).toBe(false);
    });
  });

  it('check if address is 20 bytes', () => {
    expect(isPublicKey(DEFAULT_TRANSACTION.to.slice(0, -3))).toBe(false);
  });
});

describe('createWallet', () => {
  it('returns public, private', () => {
    const wallet = createWallet();
    expect(wallet.publicKey.length).toEqual(130);
    expect(wallet.privateKey.length).toEqual(64);
  });
});

describe('signString', () => {
  const rawString = 'hello world';
  it('should return verifiable signature', async () => {
    const signature = await signString(rawString, USER_WALLET_1.privateKey);
    await expect(
      isValidSignature(rawString, signature, USER_WALLET_1.publicKey),
    ).resolves.toBe(true);
  });
});

describe('isValidSignature', () => {
  it('should return false is signature invalid', async () => {
    await expect(
      isValidSignature('hello world', 'afdef12fefaed', USER_WALLET_1.publicKey),
    ).resolves.toBe(false);
  });
});
