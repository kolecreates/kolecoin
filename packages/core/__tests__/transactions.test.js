/* eslint-disable no-undef */
const {
  MAXIMUM_COIN_DELTA, MINIMUM_COIN_DELTA, NAN_VALUE_ERROR,
  MAXIMUM_VALUE_ERROR, MINIMUM_VALUE_ERROR,
  INVALID_ADDRESS_ERROR,
  TX_DATA_MISSING_ERROR,
  TX_INVALID_DATA_ERROR,
} = require('../lib/constants');

const {
  DEFAULT_TRANSACTION,
  CONTRACT_CREATE_TX,
  USER_WALLET_1,
} = require('../__mocks__/data');

const contracts = require('../lib/contracts');

const isContractDataSpy = jest.spyOn(contracts, 'isContractData');

const {
  validateTxFields, signTx, isTxSignedBySender, createTx,
} = require('../lib/transactions');

describe('validateTxFields', () => {
  it('returns true if valid', () => {
    expect(validateTxFields(DEFAULT_TRANSACTION)).toBe(true);
  });

  it('tests coin fields against maximum', () => {
    ['value', 'feeLimit'].forEach((field) => {
      expect(() => validateTxFields({
        ...DEFAULT_TRANSACTION,
        [field]: MAXIMUM_COIN_DELTA + 1,
      })).toThrow(MAXIMUM_VALUE_ERROR);
    });
  });
  it('tests coin fields against minimum', () => {
    ['value', 'feeLimit'].forEach((field) => {
      expect(() => validateTxFields({
        ...DEFAULT_TRANSACTION,
        [field]: MINIMUM_COIN_DELTA / 10,
      })).toThrow(MINIMUM_VALUE_ERROR);
    });
  });

  it('type checks numerical fields', () => {
    ['value', 'nonce', 'feeLimit'].forEach((field) => {
      expect(() => validateTxFields({
        ...DEFAULT_TRANSACTION,
        [field]: DEFAULT_TRANSACTION[field].toString(),
      })).toThrow(NAN_VALUE_ERROR);
    });
  });

  it('tests format of addresses', () => {
    ['from'].forEach((field) => {
      expect(() => validateTxFields({
        ...DEFAULT_TRANSACTION,
        [field]: '123456',
      })).toThrow(INVALID_ADDRESS_ERROR);
    });
  });

  it('expects data to be provided if no to address', () => {
    expect(() => validateTxFields({ ...DEFAULT_TRANSACTION, to: undefined, data: undefined }))
      .toThrow(TX_DATA_MISSING_ERROR);
  });

  it('allows to address to be null if contract data', () => {
    expect(() => validateTxFields({ ...CONTRACT_CREATE_TX, to: undefined }))
      .not.toThrow(TX_DATA_MISSING_ERROR);
  });

  it('validates data', () => {
    isContractDataSpy.mockClear();
    expect(() => validateTxFields({ ...DEFAULT_TRANSACTION, data: { hello: 'world' } })).toThrow(TX_INVALID_DATA_ERROR);
    expect(isContractDataSpy).toBeCalled();
  });
});

describe('isTxSignedBySender & signTx', () => {
  it('identifies valid tx signatures', async () => {
    const signature = await signTx(DEFAULT_TRANSACTION, USER_WALLET_1.privateKey);
    await expect(
      isTxSignedBySender(DEFAULT_TRANSACTION, signature, USER_WALLET_1.publicKey),
    ).resolves.toBe(true);
  });

  it('checks for sender/signer mismatch', async () => {
    const tx = {
      ...DEFAULT_TRANSACTION,
      from: DEFAULT_TRANSACTION.to,
      to: DEFAULT_TRANSACTION.from,
    };
    const signature = await signTx(tx, USER_WALLET_1.privateKey);

    await expect(
      isTxSignedBySender(tx, signature, USER_WALLET_1.publicKey),
    ).resolves.toBe(false);
  });

  it('checks for signature mismatch', async () => {
    const signature = await signTx({
      ...DEFAULT_TRANSACTION,
      value: 1000,
    }, USER_WALLET_1.privateKey);

    await expect(
      isTxSignedBySender(DEFAULT_TRANSACTION, signature, USER_WALLET_1.publicKey),
    ).resolves.toBe(false);
  });

  it('treats any error or missing args as invalid case', async () => {
    const signature = await signTx(DEFAULT_TRANSACTION, USER_WALLET_1.privateKey);
    await Promise.all([
      [null, signature, DEFAULT_TRANSACTION.publicKey],
      [DEFAULT_TRANSACTION, null, DEFAULT_TRANSACTION.publicKey],
      [DEFAULT_TRANSACTION, signature, null],
      [DEFAULT_TRANSACTION, signature, ''],
    ].map((args) => expect(
      isTxSignedBySender(...args),
    ).resolves.toBe(false)));
  });
});

describe('createTx', () => {
  it('creates', () => {
    const tx = createTx(...Object.values(DEFAULT_TRANSACTION));
    expect(tx).toEqual(DEFAULT_TRANSACTION);
  });
  it('validates', () => {
    const tx = { ...DEFAULT_TRANSACTION };
    tx.to = null;
    tx.data = null;
    expect(() => createTx(...Object.values(tx)))
      .toThrow(TX_DATA_MISSING_ERROR);
  });
});
