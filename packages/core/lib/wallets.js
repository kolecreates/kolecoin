const crypto = require('crypto');
const eccrypto = require('eccrypto');
const { ADDRESS_PREFIX } = require('./constants');

const isAddress = (addr) => {
  if (typeof addr !== 'string') {
    return false;
  }

  if (addr.length !== 42) {
    return false;
  }

  if (addr.slice(0, 2) !== ADDRESS_PREFIX) {
    return false;
  }

  return true;
};

const publicKeyToAddress = (publicKey) => {
  const hash = crypto.createHash('sha256').update(publicKey, 'hex').digest('hex');
  return `${ADDRESS_PREFIX}${hash.slice(hash.length - 40)}`;
};

const createWallet = () => {
  const privateyKey = eccrypto.generatePrivate();
  const publicKey = eccrypto.getPublic(privateyKey);
  return {
    privateKey: privateyKey.toString('hex'),
    publicKey: publicKey.toString('hex'),
  };
};

const signString = (str, privateKey) => {
  const hash = crypto.createHash('sha256').update(str).digest();
  return eccrypto.sign(Buffer.from(privateKey, 'hex'), hash);
};

const isValidSignature = async (str, sig, publicKey) => {
  const hash = crypto.createHash('sha256').update(str).digest();
  try {
    await eccrypto.verify(Buffer.from(publicKey, 'hex'), hash, sig);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  isAddress,
  publicKeyToAddress,
  createWallet,
  signString,
  isValidSignature,
};
