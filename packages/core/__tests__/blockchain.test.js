/* eslint-disable no-undef */
const { isBlockDataValid, signBlock, isBlockTrusted } = require('../lib/blockchain');
const { MAX_NEW_BLOCK_AGE_MS } = require('../lib/constants');
const { signString } = require('../lib/wallets');
const {
  DEFAULT_BLOCK, DEFAULT_TRANSACTION, VERIFIER_WALLET,
} = require('../__mocks__/data');

const signThenCheckTrust = async (block) => isBlockTrusted(
  await signBlock(block, VERIFIER_WALLET.privateKey),
);

describe('isBlockDataValid', () => {
  it('works in valid case', () => {
    expect(
      isBlockDataValid(DEFAULT_BLOCK),
    ).toBe(true);
  });
  it('checks for bad block arg', () => {
    [null, undefined, 5, '', []].forEach((val) => {
      expect(isBlockDataValid(val)).toBe(false);
    });
  });
  it('validates prev/id', () => {
    ['id', 'prev'].forEach((field) => {
      expect(isBlockDataValid({ ...DEFAULT_BLOCK, [field]: '1234' })).toBe(false);
    });
  });
  it('validates timestamp', () => {
    expect(
      isBlockDataValid({ ...DEFAULT_BLOCK, timestamp: Date.now() - 2 * MAX_NEW_BLOCK_AGE_MS }),
    ).toBe(false);
  });
  it('validates lookup addresses', () => {
    expect(
      isBlockDataValid({ ...DEFAULT_BLOCK, lookup: { 12345: { nonce: 5, balance: 100 } } }),
    ).toBe(false);
  });
  it('checks for lookup addresses in transactions', () => {
    expect(
      isBlockDataValid({
        ...DEFAULT_BLOCK,
        lookup: { ...DEFAULT_BLOCK.lookup, '0x9ba0504367a137c5f2cd35cd30c32c30f5a1ab6b': { nonce: 3, balance: 0 } },
      }),
    ).toBe(false);
  });
  it('checks if verifier has transactions', () => {
    ['to', 'from'].forEach((field) => {
      expect(
        isBlockDataValid(
          {
            ...DEFAULT_BLOCK,
            transactions: [
              ...DEFAULT_BLOCK.transactions,
              { ...DEFAULT_TRANSACTION, [field]: DEFAULT_BLOCK.verifier },
            ],
          },
        ),
      ).toBe(false);
    });
  });
});

describe('isBlockTrusted', () => {
  it('works in valid case', async () => {
    expect(
      await signThenCheckTrust(DEFAULT_BLOCK),
    ).toBe(true);
  });

  it('checks for signature mismatch', async () => {
    expect(
      await isBlockTrusted(DEFAULT_BLOCK),
    ).toBe(false);
  });

  it('checks proof of authority', async () => {
    const block = {
      ...DEFAULT_BLOCK,
      proofOfAuth: await signString(VERIFIER_WALLET.publicKey, VERIFIER_WALLET.privateKey),
    };
    expect(
      await signThenCheckTrust(block),
    ).toBe(false);
  });
});
