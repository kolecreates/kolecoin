/* eslint-disable no-undef */
const { P2P_MESSAGE_TYPES } = require('../lib/constants');
const {
  isMessage, isGetBlockData,
  isAddBlockData, isAddTxData,
  isAddVerifierData,
  isListVerifiersData,
  signMessage,
  isMessageSignedBySender,
} = require('../lib/p2p');
const {
  DEFAULT_BLOCK, DEFAULT_TRANSACTION, VERIFIER_WALLET, USER_WALLET_1, USER_WALLET_2,
} = require('../__mocks__/data');

describe('isMessage', () => {
  it('works for valid cases', async () => {
    const signed = await signMessage({
      type: P2P_MESSAGE_TYPES.ADD_BLOCK,
      data: {},
      from: USER_WALLET_1.publicKey,
    }, USER_WALLET_1.privateKey);
    Object.values(P2P_MESSAGE_TYPES).forEach((type) => {
      expect(isMessage({
        type, data: {}, from: USER_WALLET_1.publicKey, signature: signed.signature,
      })).toBe(true);
    });
  });

  it('works for invalid cases', () => {
    [
      null, undefined, {}, { type: -1, data: {} },
      { type: P2P_MESSAGE_TYPES.ADD_BLOCK, data: null },
      { type: P2P_MESSAGE_TYPES.ADD_BLOCK, data: {}, from: '' },
      { type: P2P_MESSAGE_TYPES.ADD_BLOCK, data: {}, from: USER_WALLET_1.publicKey },
      [], 5, '',
    ].forEach((msg) => {
      expect(isMessage(msg)).toBe(false);
    });
  });
});

describe('isGetBlockData', () => {
  it('works for valid cases', () => {
    [{ after: DEFAULT_BLOCK.id }, { after: DEFAULT_BLOCK.prev }].forEach((data) => {
      expect(isGetBlockData(data)).toBe(true);
    });
  });

  it('works for invalid cases', () => {
    [{ after: null }, { after: undefined },
      {}, null, undefined, { before: DEFAULT_BLOCK.id }].forEach((data) => {
      expect(isGetBlockData(data)).toBe(false);
    });
  });
});

describe('isAddBlockData', () => {
  it('works for valid cases', () => {
    [{ blocks: [] }, { blocks: [DEFAULT_BLOCK] }].forEach((data) => {
      expect(isAddBlockData(data)).toBe(true);
    });
  });

  it('works for invalid cases', () => {
    [{}, { blocks: {} }, { blocks: null }, { hey: 'hi' },
      { blocks: [{}, 5, ''] }, { blocks: ['', {}] }].forEach((data) => {
      expect(isAddBlockData(data)).toBe(false);
    });
  });
});

describe('isAddTxData', () => {
  it('works for valid cases', () => {
    [DEFAULT_TRANSACTION].forEach((tx) => {
      expect(isAddTxData(tx)).toBe(true);
    });
  });
  it('works for invalid cases', () => {
    [{}, null, undefined, 5, '', [], { ...DEFAULT_TRANSACTION, from: null, to: null }].forEach((tx) => {
      expect(isAddTxData(tx)).toBe(false);
    });
  });
});

describe('isAddVerifierData', () => {
  it('works for valid cases', () => {
    [{ proofOfAuth: VERIFIER_WALLET.proofOfAuth }].forEach((data) => {
      expect(isAddVerifierData(data)).toBe(true);
    });
  });
  it('works for invalid cases', () => {
    [{ proofOfAuth: null }, { proofOfAuth: VERIFIER_WALLET.publicKey }, {}, null, undefined, '', 5].forEach((data) => {
      expect(isAddVerifierData(data)).toBe(false);
    });
  });
});

describe('isListVerifiersData', () => {
  it('works for valid cases', () => {
    [
      {},
      { verifiers: [] },
      {
        verifiers: [
          { publicKey: VERIFIER_WALLET.publicKey, proofOfAuth: VERIFIER_WALLET.proofOfAuth },
        ],
      },
    ].forEach((data) => {
      expect(isListVerifiersData(data)).toBe(true);
    });
  });

  it('works for invalid cases', () => {
    [
      undefined,
      null,
      { verifiers: {} },
      { verifiers: [{ publicKey: null, proofOfAuth: VERIFIER_WALLET.proofOfAuth }] },
      { verifiers: [{ publicKey: VERIFIER_WALLET.publicKey, proofOfAuth: null }] },
      { verifiers: [''] },
    ].forEach((data) => {
      expect(isListVerifiersData(data)).toBe(false);
    });
  });
});

describe('isMessageSignedBySender', () => {
  it('works for valid case', async () => {
    const signed = await signMessage({
      type: P2P_MESSAGE_TYPES.ADD_BLOCK,
      data: {},
      from: USER_WALLET_1.publicKey,
    }, USER_WALLET_1.privateKey);

    expect(await isMessageSignedBySender(signed)).toBe(true);
  });
  it('works for invalid case', async () => {
    const signed = await signMessage({
      type: P2P_MESSAGE_TYPES.ADD_BLOCK,
      data: {},
      from: USER_WALLET_2.publicKey,
    }, USER_WALLET_1.privateKey);

    expect(await isMessageSignedBySender(signed)).toBe(false);
  });
});
