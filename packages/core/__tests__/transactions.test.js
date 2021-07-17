/* eslint-disable no-undef */
const {
  MAXIMUM_COIN_VALUE, MINIMUM_COIN_VALUE, NAN_VALUE_ERROR,
  MAXIMUM_VALUE_ERROR, MINIMUM_VALUE_ERROR,
  INVALID_ADDRESS_ERROR,
  TX_DATA_MISSING_ERROR,
  TX_INVALID_DATA_ERROR,
} = require('../lib/constants');

const {
  DEFAULT_TRANSACTION,
  CONTRACT_CREATE_TX,
} = require('../__mocks__/data');

const contracts = require('../lib/contracts');

const isContractDataSpy = jest.spyOn(contracts, 'isContractData');

const { validateTxFields } = require('../lib/transactions');

describe('validateTxFields', () => {
  it('returns true if valid', () => {
    expect(validateTxFields(DEFAULT_TRANSACTION)).toBe(true);
  });

  it('tests coin fields against maximum', () => {
    ['value', 'fee', 'feeLimit'].forEach((field) => {
      expect(() => validateTxFields({
        ...DEFAULT_TRANSACTION,
        [field]: MAXIMUM_COIN_VALUE + 1,
      })).toThrow(MAXIMUM_VALUE_ERROR);
    });
  });
  it('tests coin fields against minimum', () => {
    ['value', 'fee', 'feeLimit'].forEach((field) => {
      expect(() => validateTxFields({
        ...DEFAULT_TRANSACTION,
        [field]: MINIMUM_COIN_VALUE / 10,
      })).toThrow(MINIMUM_VALUE_ERROR);
    });
  });

  it('type checks numerical fields', () => {
    ['value', 'nonce', 'fee', 'feeLimit'].forEach((field) => {
      expect(() => validateTxFields({
        ...DEFAULT_TRANSACTION,
        [field]: DEFAULT_TRANSACTION[field].toString(),
      })).toThrow(NAN_VALUE_ERROR);
    });
  });

  it('tests format of addresses', () => {
    ['to', 'from'].forEach((field) => {
      expect(() => validateTxFields({
        ...CONTRACT_CREATE_TX,
        [field]: '123456',
      })).toThrow(INVALID_ADDRESS_ERROR);
    });
  });

  it('expects data to be provided if no to address', () => {
    expect(() => validateTxFields({ ...DEFAULT_TRANSACTION, to: undefined, data: undefined }))
      .toThrow(TX_DATA_MISSING_ERROR);
  });

  it('validates data', () => {
    isContractDataSpy.mockClear();
    expect(() => validateTxFields({ ...DEFAULT_TRANSACTION, data: { hello: 'world' } })).toThrow(TX_INVALID_DATA_ERROR);
    expect(isContractDataSpy).toBeCalled();
  });
});
