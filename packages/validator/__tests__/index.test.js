/* eslint-disable no-undef */
const {
  FROM_ROOT_TO_USER_1,
  FROM_ROOT_TO_USER_2,
  VERIFIER_WALLET,
  USER_WALLET_1,
  USER_WALLET_2,
  CONTRACT_CREATE_TX,
} = require('@kolecoin/core/__mocks__/data');
const { createLedger } = require('@kolecoin/core/lib/ledger');
const blockUtils = require('@kolecoin/core/lib/blocks');

const createBlockIdSpy = jest.spyOn(blockUtils, 'createBlockId');
const {
  ROOT_BLOCK, TOTAL_COIN_SUPPLY, BASE_TX_FEE, CONTRACT_COMMAND_FEE,
} = require('@kolecoin/core/lib/constants');
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

  it('handles contract creation', () => {
    createBlockIdSpy.mockReturnValueOnce(id);
    nowSpy.mockReturnValueOnce(timestamp);
    const createContractTx = {
      from: USER_WALLET_1.publicKey,
      value: 5,
      nonce: 0,
      data: {
        ...CONTRACT_CREATE_TX.data,
      },
      feeLimit: CONTRACT_COMMAND_FEE * 10,
    };

    const contractId = 'c95a24c69cc83791ed2a5a924d89f014ac13a5c1c620a28fa8ca8a9c6801d62f';

    expect(
      txPoolToBlock(
        createLedger(),
        [
          FROM_ROOT_TO_USER_1,
          createContractTx,
        ],
        VERIFIER_WALLET.publicKey,
        VERIFIER_WALLET.proofOfAuth,
      ),
    ).toEqual(
      {
        ...BLOCK_1,
        transactions: [
          FROM_ROOT_TO_USER_1,
          createContractTx,
        ],
        lookup: {
          [USER_WALLET_1.publicKey]: {
            balance: FROM_ROOT_TO_USER_1.value - createContractTx.value - BASE_TX_FEE,
            nonce: 0,
            fees: [
              BASE_TX_FEE,
            ],
          },
          [contractId]: {
            balance: createContractTx.value,
            state: CONTRACT_CREATE_TX.data.create.state,
            functions: CONTRACT_CREATE_TX.data.create.functions,
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
