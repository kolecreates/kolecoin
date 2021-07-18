const crypto = require('crypto');
const eccrypto = require('eccrypto');

const isPublicKey = (addr) => {
  if (typeof addr !== 'string') {
    return false;
  }

  if (addr.length !== 130) {
    return false;
  }

  return true;
};

const createWallet = () => {
  const privateyKey = eccrypto.generatePrivate();
  const publicKey = eccrypto.getPublic(privateyKey);
  return {
    privateKey: privateyKey.toString('hex'),
    publicKey: publicKey.toString('hex'),
  };
};

const signString = async (str, privateKey) => {
  const hash = crypto.createHash('sha256').update(str).digest();
  return (await eccrypto.sign(Buffer.from(privateKey, 'hex'), hash)).toString('hex');
};

const isValidSignature = async (str, sig, publicKey) => {
  try {
    const hash = crypto.createHash('sha256').update(str).digest();
    await eccrypto.verify(Buffer.from(publicKey, 'hex'), hash, Buffer.from(sig, 'hex'));
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  isPublicKey,
  createWallet,
  signString,
  isValidSignature,
};
