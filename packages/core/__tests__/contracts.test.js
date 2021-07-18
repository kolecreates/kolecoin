/* eslint-disable no-undef */
const { isContractData, createContractAddress } = require('../lib/contracts');
const { CONTRACT_CREATE_TX, CONTRACT_INVOKE_TX, USER_WALLET_1 } = require('../__mocks__/data');

describe('isContractData', () => {
  it('returns false if not a plain object', () => {
    [undefined, null, [], 5, '']
      .forEach((val) => expect(isContractData(val)).toBe(false));
  });

  it('returns false if missing props', () => {
    expect(isContractData({ hello: 'world' })).toBe(false);
  });

  it('returns false if extra props', () => {
    expect(isContractData({ ...CONTRACT_INVOKE_TX.data, ...CONTRACT_CREATE_TX.data })).toBe(false);
  });

  it('returns false if invoke is missing props', () => {
    ['name', 'args'].forEach((field) => {
      expect(isContractData({
        invoke: { [field]: CONTRACT_INVOKE_TX.data.invoke[field] },
      })).toBe(false);
    });
  });

  it('returns false if create contains malformed function definition', () => {
    [null, undefined, {}, { params: [], commands: null }, { params: 5, commands: [] }]
      .forEach((definition) => {
        expect(isContractData({
          create: { buyNFT: definition },
        })).toBe(false);
      });
  });

  it('returns true if invoking a function', () => {
    expect(isContractData(CONTRACT_INVOKE_TX.data)).toBe(true);
  });

  it('returns true if defining a contract', () => {
    expect(isContractData(CONTRACT_CREATE_TX.data)).toBe(true);
  });
});

describe('createContractAddress', () => {
  it('is reproducable', () => {
    const address = createContractAddress(USER_WALLET_1.publicKey, CONTRACT_CREATE_TX.nonce);
    const addressCopy = createContractAddress(USER_WALLET_1.publicKey, CONTRACT_CREATE_TX.nonce);
    expect(address).toEqual(addressCopy);
  });
});
