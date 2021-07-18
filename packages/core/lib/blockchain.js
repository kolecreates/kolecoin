const { MAX_NEW_BLOCK_AGE_MS, PROOF_OF_AUTH_PUBLIC_KEY } = require('./constants');
const { isPublicKey, isValidSignature, signString } = require('./wallets');

const signBlock = async (block, privateKey) => {
  const str = JSON.stringify({ ...block, signature: undefined });
  const sig = await signString(str, privateKey);
  return { ...block, signature: sig };
};

const isBlockId = (id) => typeof id === 'string' && id.length === 64;

const isBlockDataValid = (block) => {
  if (typeof block !== 'object' || block === null || Array.isArray(block)) {
    return false;
  }

  if (block.prev === block.id) {
    return false;
  }

  if (!isBlockId(block.prev)) {
    return false;
  }

  if (!isBlockId(block.id)) {
    return false;
  }

  if (Date.now() - block.timestamp > MAX_NEW_BLOCK_AGE_MS) {
    return false;
  }

  const lookupAddrs = Object.keys(block.lookup);
  if (lookupAddrs.some((k) => !isPublicKey(k))) {
    return false;
  }

  if (lookupAddrs.some((k) => k !== block.verifier
    && !block.transactions.some((tx) => tx.to === k || tx.from === k))) {
    return false;
  }

  if (block.transactions.some((tx) => tx.to === block.verifier || tx.from === block.verifier)) {
    return false;
  }

  return true;
};

const isBlockTrusted = async (block) => {
  try {
    const blockStr = JSON.stringify({ ...block, signature: undefined });
    if (!await isValidSignature(blockStr, block.signature, block.verifier)) {
      return false;
    }
  } catch {
    return false;
  }

  try {
    if (!await isValidSignature(block.verifier, block.proofOfAuth, PROOF_OF_AUTH_PUBLIC_KEY)) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
};

module.exports = {
  signBlock,
  isBlockDataValid,
  isBlockTrusted,
};
