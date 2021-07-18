const { isBlockId } = require('./blocks');
const { P2P_MESSAGE_TYPES } = require('./constants');
const { isPlainObject } = require('./objects');
const { validateTxFields } = require('./transactions');
const { isPublicKey, signString, isValidSignature } = require('./wallets');

const isProofOfAuth = (poa) => typeof poa === 'string' && poa.length === 140;

const isMessage = (message) => {
  if (!isPlainObject(message)) {
    return false;
  }

  if (!isPublicKey(message.from)) {
    return false;
  }

  if (typeof message.signature !== 'string') {
    return false;
  }

  if (Object.values(P2P_MESSAGE_TYPES).indexOf(message.type) === -1) {
    return false;
  }

  if (!isPlainObject(message.data)) {
    return false;
  }

  return true;
};

const isGetBlockData = (data) => {
  if (!data) {
    return false;
  }

  if (!isBlockId(data.after)) {
    return false;
  }

  return true;
};

const isAddBlockData = (data) => {
  if (!Array.isArray(data.blocks)) {
    return false;
  }

  if (data.blocks.some((b) => !isPlainObject(b))) {
    return false;
  }

  return true;
};

const isAddTxData = (data) => {
  try {
    return validateTxFields(data);
  } catch {
    return false;
  }
};

const isAddVerifierData = (data) => {
  if (!data) {
    return false;
  }

  if (!isProofOfAuth(data.proofOfAuth)) {
    return false;
  }

  return true;
};

const isListVerifiersData = (data) => {
  if (!data) {
    return false;
  }

  if (data.verifiers) {
    if (!Array.isArray(data.verifiers)) {
      return false;
    }

    if (data.verifiers.some((v) => !isPublicKey(v.publicKey) || !isProofOfAuth(v.proofOfAuth))) {
      return false;
    }
  }

  return true;
};

const signMessage = async (message, privateKey) => {
  const str = JSON.stringify(message);
  const sig = await signString(str, privateKey);

  return { ...message, signature: sig };
};

const isMessageSignedBySender = async (message) => isValidSignature(
  JSON.stringify({ ...message, signature: undefined }),
  message.signature,
  message.from,
);

module.exports = {
  isMessage,
  isGetBlockData,
  isAddBlockData,
  isAddTxData,
  isAddVerifierData,
  isListVerifiersData,
  signMessage,
  isMessageSignedBySender,
};
