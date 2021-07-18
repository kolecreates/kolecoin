const crypto = require('crypto');
const { isPlainObject } = require('./objects');

const isContractData = (data) => {
  if (!isPlainObject(data)) {
    return false;
  }

  const keyCount = Object.keys(data).length;
  if (keyCount > 1) {
    return false;
  }
  if (isPlainObject(data.invoke)) {
    if (!data.invoke.args || !data.invoke.name) {
      return false;
    }
  } else if (isPlainObject(data.create)) {
    if (!isPlainObject(data.create.state) || !isPlainObject(data.create.functions)) {
      return false;
    }
    const funcs = Object.keys(data.create.functions);
    if (funcs.length < 1) {
      return false;
    }
    if (funcs.some((k) => {
      const def = data.create.functions[k];
      return !def || !Array.isArray(def.logic) || !isPlainObject(def.params);
    })) {
      return false;
    }
  } else {
    return false;
  }

  return true;
};

const createContractAddress = (publicKey, nonce) => crypto.createHash('sha256')
  .update(publicKey + nonce)
  .digest();

module.exports = {
  isContractData,
  createContractAddress,
};
