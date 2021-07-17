const DEFAULT_TRANSACTION = {
  from: '0xb794f5ea0ba39494ce839613fffba74279579268',
  to: '0xb794f5ea0ba39494ce839613fffba74279579267',
  value: 2,
  nonce: 7,
  data: undefined,
  fee: 0.1,
  feeLimit: 0.2,
};

const CONTRACT_CREATE_TX = {
  ...DEFAULT_TRANSACTION,
  data: {
    create: {
      buyNFT: {
        params: [],
        commands: [],
      },
    },
  },
};

const CONTRACT_INVOKE_TX = {
  ...DEFAULT_TRANSACTION,
  data: {
    invoke: {
      name: 'buyNFT',
      args: [],
    },
  },
};

module.exports = {
  DEFAULT_TRANSACTION,
  CONTRACT_CREATE_TX,
  CONTRACT_INVOKE_TX,
};
