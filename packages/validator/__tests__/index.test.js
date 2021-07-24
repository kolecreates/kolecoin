/* eslint-disable no-undef */
const { FROM_ROOT_TO_USER_1, FROM_ROOT_TO_USER_2, VERIFIER_WALLET } = require('@kolecoin/core/__mocks__/data');
const { createLedger } = require('@kolecoin/core/lib/ledger');
const blockUtils = require('@kolecoin/core/lib/blocks');
const { ROOT_BLOCK, TOTAL_COIN_SUPPLY } = require('@kolecoin/core/lib/constants');
const { txPoolToBlock } = require('../lib/index');

const createBlockIdSpy = jest.spyOn(blockUtils, 'createBlockId');

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
            balance: TOTAL_COIN_SUPPLY
                - FROM_ROOT_TO_USER_1.value
                - FROM_ROOT_TO_USER_2.value
                - 0.2,
            fees: [
              0.1,
              0.1,
            ],
          },
        },
        verifier: VERIFIER_WALLET.publicKey,
        proofOfAuth: VERIFIER_WALLET.proofOfAuth,
      },
    );
  });
});
