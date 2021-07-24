/* eslint-disable no-undef */

const { DEFAULT_BLOCK, DEFAULT_TRANSACTION } = require('../__mocks__/data');
const blocks = require('../lib/blocks');

const isBlockDataValid = jest.spyOn(blocks, 'isBlockDataValid');
const isBlockTrusted = jest.spyOn(blocks, 'isBlockTrusted');
const {
  createLedger,
  addBlock,
  getBlock,
  getLatestBlock,
  iterateBlocks,
  findLatestLookupFieldValue,
} = require('../lib/ledger');
const {
  ROOT_BLOCK, BLOCK_INVALID_ERROR, BLOCK_TRUST_ERROR, BLOCK_EXISTS_ERROR, LEDGER_INVALID_ERROR,
} = require('../lib/constants');

describe('createLedger', () => {
  it('should create ledger with root block', () => {
    expect(createLedger().blocks[ROOT_BLOCK.id]).toEqual(ROOT_BLOCK);
  });
});

describe('addBlock', () => {
  it('should add block in valid case', () => {
    const block = { ...DEFAULT_BLOCK, prev: ROOT_BLOCK.id };
    const initLedger = createLedger();
    const ledger = addBlock(initLedger, block);
    expect(ledger.blocks[DEFAULT_BLOCK.id]).toEqual(block);
    expect(ledger).not.toEqual(initLedger);
  });

  it('should throw if block data invalid', () => {
    isBlockDataValid.mockReturnValueOnce(false);
    expect(() => addBlock(createLedger(), DEFAULT_BLOCK)).toThrow(BLOCK_INVALID_ERROR);
  });

  it('should throw if block not trusted', () => {
    isBlockTrusted.mockReturnValueOnce(false);
    expect(() => addBlock(createLedger(), DEFAULT_BLOCK)).toThrow(BLOCK_TRUST_ERROR);
  });

  it('should throw if block already exists', () => {
    expect(() => addBlock(createLedger(), ROOT_BLOCK)).toThrow(BLOCK_EXISTS_ERROR);
  });

  it('should throw if ledger invalid', () => {
    [null, undefined, '', 5, [], {}, { blocks: null }].forEach((val) => {
      expect(() => addBlock(val, DEFAULT_BLOCK)).toThrow(LEDGER_INVALID_ERROR);
    });
  });
});

describe('getBlock', () => {
  it('returns block', () => {
    expect(getBlock(createLedger(), ROOT_BLOCK.id)).toEqual(ROOT_BLOCK);
  });

  it('returns undefined if not found', () => {
    expect(getBlock(createLedger(), DEFAULT_BLOCK.id)).toEqual(undefined);
  });

  it('returns null if invalid input', () => {
    [null, undefined, '', 5, [], {}, { blocks: null }].forEach((val) => {
      expect(getBlock(val, DEFAULT_BLOCK.id)).toEqual(null);
    });
  });
});

describe('getLatestBlock', () => {
  it('returns the most recent block', () => {
    expect(getLatestBlock(addBlock(createLedger(), DEFAULT_BLOCK))).toEqual(DEFAULT_BLOCK);
  });
  it('returns most recent despite add order', () => {
    const block1 = {
      ...DEFAULT_BLOCK,
      timestamp: DEFAULT_BLOCK.timestamp - 5000,
      id: DEFAULT_BLOCK.prev,
      prev: ROOT_BLOCK.id,
    };
    const block2 = DEFAULT_BLOCK;
    const result = addBlock(addBlock(createLedger(), block2), block1);

    expect(getLatestBlock(result)).toEqual(block2);
  });
  it('returns root for initial ledger', () => {
    expect(getLatestBlock(createLedger())).toEqual(ROOT_BLOCK);
  });

  it('throws if ledger invalid', () => {
    [null, undefined, '', 5, [], {}, { blocks: null }].forEach((val) => {
      expect(() => getLatestBlock(val)).toThrow(LEDGER_INVALID_ERROR);
    });
  });
});

describe('iterateBlocks', () => {
  it('iterates blocks startings at the latest', () => {
    const block1 = { ...DEFAULT_BLOCK, prev: ROOT_BLOCK.id };
    const ledger = addBlock(createLedger(), block1);
    const arr = [];
    iterateBlocks(ledger, (block) => {
      arr.push(block);
    });

    expect(arr).toEqual([block1, ROOT_BLOCK]);
  });

  it('stops iterating when done callback is called', () => {
    const block1 = { ...DEFAULT_BLOCK, prev: ROOT_BLOCK.id };
    const ledger = addBlock(createLedger(), block1);
    const arr = [];
    iterateBlocks(ledger, (block, done) => {
      arr.push(block);
      done();
    });
    expect(arr).toEqual([block1]);
  });

  it('throws if ledger invalid', () => {
    [null, undefined, '', 5, [], {}, { blocks: null }].forEach((val) => {
      expect(() => iterateBlocks(val)).toThrow(LEDGER_INVALID_ERROR);
    });
  });
});

describe('findLatestLookupFieldValue', () => {
  it('returns nonce', () => {
    const block1 = { ...DEFAULT_BLOCK, prev: ROOT_BLOCK.id };
    const ledger = addBlock(createLedger(), block1);
    expect(
      findLatestLookupFieldValue(ledger, DEFAULT_TRANSACTION.from, 'nonce'),
    ).toEqual(DEFAULT_TRANSACTION.nonce);
  });

  it('returns balance', () => {
    const block1 = { ...DEFAULT_BLOCK, prev: ROOT_BLOCK.id };
    const ledger = addBlock(createLedger(), block1);
    expect(
      findLatestLookupFieldValue(ledger, DEFAULT_TRANSACTION.to, 'balance'),
    ).toEqual(1.9);
  });
});
