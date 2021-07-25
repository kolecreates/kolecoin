/* eslint-disable no-undef */
const { FROM_ROOT_TO_USER_1, FROM_ROOT_TO_USER_2, VERIFIER_WALLET } = require('@kolecoin/core/__mocks__/data');
const { createLedger } = require('@kolecoin/core/lib/ledger');
const blockUtils = require('@kolecoin/core/lib/blocks');

const createBlockIdSpy = jest.spyOn(blockUtils, 'createBlockId');
const { ROOT_BLOCK, TOTAL_COIN_SUPPLY, BASE_TX_FEE } = require('@kolecoin/core/lib/constants');
const { txPoolToBlock } = require('../lib/index');

const nowSpy = jest.spyOn(Date, 'now');

describe('txPoolToBlock', () => {
  it('converts valid pool to block', () => {
    const id = '123456';
    const timestamp = Date.now();
    createBlockIdSpy.mockReturnValueOnce(id);
    nowSpy.mockReturnValueOnce(timestamp);
    const pool = [
      FROM_ROOT_TO_USER_1,
      FROM_ROOT_TO_USER_2,
    ];
    expect(
      txPoolToBlock(
        createLedger(),
        pool,
        VERIFIER_WALLET.publicKey,
        VERIFIER_WALLET.proofOfAuth,
      ),
    ).toEqual(
      {
        id,
        prev: ROOT_BLOCK.id,
        timestamp,
        transactions: pool,
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
      },
    );
  });
});
