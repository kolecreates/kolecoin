const {
  MAXIMUM_COIN_VALUE,
  MAXIMUM_VALUE_ERROR,
  MINUMUM_VALUE_ERROR,
  MINIMUM_COIN_VALUE,
  NAN_VALUE_ERROR,
  INVALID_ADDRESS_ERROR,
  TX_DATA_MISSING_ERROR,
  TX_INVALID_DATA_ERROR,
} = require('./constants');
const { isNumber } = require('./numbers');
const { isAddress } = require('./wallets');
const { isContractData } = require('./contracts');

const validateTxFields = (tx) => {
  if (!isAddress(tx.from)) {
    throw new Error(INVALID_ADDRESS_ERROR);
  }

  if (!isAddress(tx.to)) {
    if (tx.data) {
      throw new Error(INVALID_ADDRESS_ERROR);
    } else {
      throw new Error(TX_DATA_MISSING_ERROR);
    }
  }

  ['value', 'fee', 'feeLimit'].forEach((field) => {
    if (tx[field] > MAXIMUM_COIN_VALUE) {
      throw new Error(MAXIMUM_VALUE_ERROR);
    }

    if (tx[field] < MINIMUM_COIN_VALUE) {
      throw new Error(MINUMUM_VALUE_ERROR);
    }
  });

  ['value', 'nonce', 'fee', 'feeLimit'].forEach((field) => {
    if (!isNumber(tx[field])) {
      throw new Error(NAN_VALUE_ERROR);
    }
  });

  if (tx.data && !isContractData(tx.data)) {
    throw new Error(TX_INVALID_DATA_ERROR);
  }

  return true;
};

module.exports = {
  validateTxFields,
};
