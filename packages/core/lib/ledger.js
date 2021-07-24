const { isBlockDataValid, isBlockTrusted } = require('./blocks');
const {
  ROOT_BLOCK, BLOCK_EXISTS_ERROR, BLOCK_INVALID_ERROR, BLOCK_TRUST_ERROR, LEDGER_INVALID_ERROR,
} = require('./constants');
const {
  isPlainObject,
} = require('./objects');

const createLedger = () => ({
  blocks: {
    [ROOT_BLOCK.id]: ROOT_BLOCK,
  },
  latestId: ROOT_BLOCK.id,
});

const addBlock = (ledger, block) => {
  if (!isPlainObject(ledger) || !isPlainObject(ledger.blocks)) {
    throw new Error(LEDGER_INVALID_ERROR);
  }
  if (ledger.blocks[block.id]) {
    throw new Error(BLOCK_EXISTS_ERROR);
  }

  if (!isBlockDataValid(block)) {
    throw new Error(BLOCK_INVALID_ERROR);
  }

  if (!isBlockTrusted(block)) {
    throw new Error(BLOCK_TRUST_ERROR);
  }

  return {
    ...ledger,
    blocks: {
      ...ledger.blocks,
      [block.id]: block,
    },
    latestId: block.timestamp > ledger.blocks[ledger.latestId].timestamp
      ? block.id : ledger.latestId,
  };
};

const getBlock = (ledger, blockId) => {
  if (!isPlainObject(ledger) || !isPlainObject(ledger.blocks)) {
    return null;
  }

  return ledger.blocks[blockId];
};

const getLatestBlock = (ledger) => {
  if (!isPlainObject(ledger) || !isPlainObject(ledger.blocks)) {
    throw new Error(LEDGER_INVALID_ERROR);
  }

  return ledger.blocks[ledger.latestId];
};

const iterateBlocks = (ledger, callback) => {
  if (!isPlainObject(ledger) || !isPlainObject(ledger.blocks)) {
    throw new Error(LEDGER_INVALID_ERROR);
  }
  let current = ledger.blocks[ledger.latestId];
  while (current) {
    let done = false;
    callback(current, () => {
      done = true;
    });
    if (done) {
      break;
    }
    current = ledger.blocks[current.prev];
  }
};

const findLatestLookupFieldValue = (ledger, publicKey, field) => {
  let value = null;
  iterateBlocks(ledger, (block, done) => {
    const lookup = block.lookup[publicKey];
    if (lookup && typeof lookup[field] !== 'undefined') {
      value = lookup[field];
      done();
    }
  });
  return value;
};

module.exports = {
  createLedger,
  addBlock,
  getBlock,
  getLatestBlock,
  iterateBlocks,
  findLatestLookupFieldValue,
};
