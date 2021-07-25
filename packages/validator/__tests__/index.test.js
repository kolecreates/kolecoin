/* eslint-disable no-undef */
const {
  FROM_ROOT_TO_USER_1,
  FROM_ROOT_TO_USER_2,
  VERIFIER_WALLET,
  USER_WALLET_1,
  USER_WALLET_2,
} = require('@kolecoin/core/__mocks__/data');
const { createLedger } = require('@kolecoin/core/lib/ledger');
const blockUtils = require('@kolecoin/core/lib/blocks');

const createBlockIdSpy = jest.spyOn(blockUtils, 'createBlockId');
const { ROOT_BLOCK, TOTAL_COIN_SUPPLY, BASE_TX_FEE } = require('@kolecoin/core/lib/constants');
const { txPoolToBlock } = require('../lib/index');

const nowSpy = jest.spyOn(Date, 'now');
const id = createBlockIdSpy();
const timestamp = Date.now();
const BLOCK_1 = {
  id,
  prev: ROOT_BLOCK.id,
  timestamp,
  transactions: [
    FROM_ROOT_TO_USER_1,
    FROM_ROOT_TO_USER_2,
  ],
  lookup: {
    [FROM_ROOT_TO_USER_1.to]: {
      balance: FROM_ROOT_TO_USER_1.value,
    },
    [FROM_ROOT_TO_USER_2.to]: {
      balance: FROM_ROOT_TO_USER_2.value,
    },
    [FROM_ROOT_TO_USER_1.from]: {
      nonce: 1,
      balance: TOTAL_COIN_SUPPLY
          - FROM_ROOT_TO_USER_1.value
          - FROM_ROOT_TO_USER_2.value
          - (BASE_TX_FEE * 2),
      fees: [
        BASE_TX_FEE,
        BASE_TX_FEE,
      ],
    },
  },
  verifier: VERIFIER_WALLET.publicKey,
  proofOfAuth: VERIFIER_WALLET.proofOfAuth,
};

describe('txPoolToBlock', () => {
  it('converts valid pool to block', () => {
    createBlockIdSpy.mockReturnValueOnce(id);
    nowSpy.mockReturnValueOnce(timestamp);
    expect(
      txPoolToBlock(
        createLedger(),
        [
          FROM_ROOT_TO_USER_1,
          FROM_ROOT_TO_USER_2,
        ],
        VERIFIER_WALLET.publicKey,
        VERIFIER_WALLET.proofOfAuth,
      ),
    ).toEqual(
      BLOCK_1,
    );
  });

  it('sorts transactions in block by nonce', () => {
    createBlockIdSpy.mockReturnValueOnce(id);
    nowSpy.mockReturnValueOnce(timestamp);
    expect(
      txPoolToBlock(
        createLedger(),
        [
          FROM_ROOT_TO_USER_2,
          FROM_ROOT_TO_USER_1,
        ],
        VERIFIER_WALLET.publicKey,
        VERIFIER_WALLET.proofOfAuth,
      ),
    ).toEqual(
      BLOCK_1,
    );
  });

  it('ignores bad nonce transactions', () => {
    createBlockIdSpy.mockReturnValueOnce(id);
    nowSpy.mockReturnValueOnce(timestamp);
    expect(
      txPoolToBlock(
        createLedger(),
        [
          FROM_ROOT_TO_USER_1,
          {
            ...FROM_ROOT_TO_USER_2,
            nonce: 0,
          },
        ],
        VERIFIER_WALLET.publicKey,
        VERIFIER_WALLET.proofOfAuth,
      ),
    ).toEqual(
      {
        ...BLOCK_1,
        transactions: [
          FROM_ROOT_TO_USER_1,
        ],
        lookup: {
          [FROM_ROOT_TO_USER_1.to]: {
            balance: FROM_ROOT_TO_USER_1.value,
          },
          [FROM_ROOT_TO_USER_1.from]: {
            nonce: 0,
            balance: TOTAL_COIN_SUPPLY
                - FROM_ROOT_TO_USER_1.value
                - (BASE_TX_FEE * 1),
            fees: [
              BASE_TX_FEE,
            ],
          },
        },
      },
    );
  });

  it('ignore bad balance transactions', () => {
    createBlockIdSpy.mockReturnValueOnce(id);
    nowSpy.mockReturnValueOnce(timestamp);
    expect(
      txPoolToBlock(
        createLedger(),
        [
          FROM_ROOT_TO_USER_1,
          {
            from: USER_WALLET_1.publicKey,
            to: USER_WALLET_2.publicKey,
            value: 20,
            nonce: 0,
            data: undefined,
            feeLimit: 0.2,
          },
        ],
        VERIFIER_WALLET.publicKey,
        VERIFIER_WALLET.proofOfAuth,
      ),
    ).toEqual(
      {
        ...BLOCK_1,
        transactions: [
          FROM_ROOT_TO_USER_1,
        ],
        lookup: {
          [FROM_ROOT_TO_USER_1.to]: {
            balance: FROM_ROOT_TO_USER_1.value,
          },
          [FROM_ROOT_TO_USER_1.from]: {
            nonce: 0,
            balance: TOTAL_COIN_SUPPLY
                - FROM_ROOT_TO_USER_1.value
                - (BASE_TX_FEE * 1),
            fees: [
              BASE_TX_FEE,
            ],
          },
        },
      },
    );
  });

  it('handles txs from multiple from addresses', () => {
    createBlockIdSpy.mockReturnValueOnce(id);
    nowSpy.mockReturnValueOnce(timestamp);
    const user1ToUser2 = {
      from: USER_WALLET_1.publicKey,
      to: USER_WALLET_2.publicKey,
      value: 5,
      nonce: 0,
      data: undefined,
      feeLimit: 0.2,
    };
    expect(
      txPoolToBlock(
        createLedger(),
        [
          FROM_ROOT_TO_USER_1,
          user1ToUser2,
        ],
        VERIFIER_WALLET.publicKey,
        VERIFIER_WALLET.proofOfAuth,
      ),
    ).toEqual(
      {
        ...BLOCK_1,
        transactions: [
          FROM_ROOT_TO_USER_1,
          user1ToUser2,
        ],
        lookup: {
          [FROM_ROOT_TO_USER_1.to]: {
            balance: FROM_ROOT_TO_USER_1.value - user1ToUser2.value - BASE_TX_FEE,
            nonce: 0,
            fees: [
              BASE_TX_FEE,
            ],
          },
          [user1ToUser2.to]: {
            balance: user1ToUser2.value,
          },
          [FROM_ROOT_TO_USER_1.from]: {
            nonce: 0,
            balance: TOTAL_COIN_SUPPLY
                - FROM_ROOT_TO_USER_1.value
                - (BASE_TX_FEE * 1),
            fees: [
              BASE_TX_FEE,
            ],
          },
        },
      },
    );
  });
});
