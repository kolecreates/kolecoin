const {
  MAXIMUM_COIN_DELTA,
  MAXIMUM_VALUE_ERROR,
  MINUMUM_VALUE_ERROR,
  MINIMUM_COIN_DELTA,
  NAN_VALUE_ERROR,
  INVALID_ADDRESS_ERROR,
  TX_DATA_MISSING_ERROR,
  TX_INVALID_DATA_ERROR,
} = require('./constants');
const { isNumber } = require('./numbers');
const {
  isPublicKey, signString, isValidSignature,
} = require('./wallets');
const { isContractData } = require('./contracts');

const validateTxFields = (tx) => {
  if (!isPublicKey(tx.from)) {
    throw new Error(INVALID_ADDRESS_ERROR);
  }

  if (!isPublicKey(tx.to)) {
    if (tx.data) {
      throw new Error(INVALID_ADDRESS_ERROR);
    } else {
      throw new Error(TX_DATA_MISSING_ERROR);
    }
  }

  ['value', 'feeLimit'].forEach((field) => {
    if (tx[field] > MAXIMUM_COIN_DELTA) {
      throw new Error(MAXIMUM_VALUE_ERROR);
    }

    if (tx[field] < MINIMUM_COIN_DELTA) {
      throw new Error(MINUMUM_VALUE_ERROR);
    }
  });

  ['value', 'nonce', 'feeLimit'].forEach((field) => {
    if (!isNumber(tx[field])) {
      throw new Error(NAN_VALUE_ERROR);
    }
  });

  if (tx.data && !isContractData(tx.data)) {
    throw new Error(TX_INVALID_DATA_ERROR);
  }

  return true;
};

const signTx = (tx, privateKey) => {
  const txStr = JSON.stringify(tx);
  return signString(txStr, privateKey);
};

const isTxSignedBySender = async (tx, sig, publicKey) => {
  try {
    if (tx.from !== publicKey) {
      return false;
    }
    const txStr = JSON.stringify(tx);
    return isValidSignature(txStr, sig, publicKey);
  } catch {
    return false;
  }
};

const createTx = (from, to, value, nonce, data, feeLimit) => {
  const tx = {
    from,
    to,
    value,
    nonce,
    data,
    feeLimit,
  };
  if (validateTxFields(tx)) {
    return tx;
  }
  return null;
};

module.exports = {
  validateTxFields,
  signTx,
  isTxSignedBySender,
  createTx,
};
