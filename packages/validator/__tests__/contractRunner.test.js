/* eslint-disable no-undef */
const {
  CONTRACT_CREATE_TX,
  CONTRACT_INVOKE_TX,
} = require('@kolecoin/core/__mocks__/data');

const {
  CONTRACT_COMMAND_FEE,
} = require('@kolecoin/core/lib/constants');
const ContractRunner = require('../lib/contractRunner');

describe('ContractRunner', () => {
  it('should run nft buy', () => {
    const {
      state, txs, fee, accepted, rejected,
    } = ContractRunner.run(
      CONTRACT_CREATE_TX.data.create.functions.buyNFT.logic,
      CONTRACT_CREATE_TX.data.create.state,
      CONTRACT_INVOKE_TX,
    );

    expect(state).toEqual({
      locked: true,
      owner: CONTRACT_INVOKE_TX.from,
      mediaUrl: 'example.com/nft_image.png',
      buyoutPrice: 10,
    });

    expect(txs).toEqual([]);
    expect(fee).toEqual(CONTRACT_COMMAND_FEE * 9);
    expect(accepted).toEqual(true);
    expect(rejected).toEqual(false);
  });

  it('should reject nft buy with value < buyoutPrice', () => {
    const {
      state, txs, fee, accepted, rejected,
    } = ContractRunner.run(
      CONTRACT_CREATE_TX.data.create.functions.buyNFT.logic,
      CONTRACT_CREATE_TX.data.create.state,
      {
        ...CONTRACT_INVOKE_TX,
        value: CONTRACT_CREATE_TX.data.create.state.buyoutPrice - 1,
      },
    );

    expect(state).toEqual(CONTRACT_CREATE_TX.data.create.state);

    expect(txs).toEqual([]);
    expect(fee.toFixed(2)).toEqual((CONTRACT_COMMAND_FEE * 6).toFixed(2));
    expect(accepted).toEqual(false);
    expect(rejected).toEqual(true);
  });

  it('should handle feeLimit', () => {
    const {
      state, txs, fee, accepted, rejected,
    } = ContractRunner.run(
      CONTRACT_CREATE_TX.data.create.functions.buyNFT.logic,
      CONTRACT_CREATE_TX.data.create.state,
      {
        ...CONTRACT_INVOKE_TX,
        feeLimit: CONTRACT_COMMAND_FEE * 3,
      },
    );

    expect(state).toEqual(CONTRACT_CREATE_TX.data.create.state);

    expect(txs).toEqual([]);
    expect(fee.toFixed(2)).toEqual((CONTRACT_COMMAND_FEE * 3).toFixed(2));
    expect(accepted).toEqual(false);
    expect(rejected).toEqual(true);
  });
});
