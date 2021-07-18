const DEFAULT_TRANSACTION = {
  from: '0xb42a6d2241baa5c67c9dcd7754bf53981c469736',
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

const DEFAULT_WALLET = {
  privateKey: '4f463bb9dccd7feabcc17a10d2a274591f1b60fcfa5d5f2d43b7a83a3f975a41',
  publicKey: '04c13abaee8a1cfab7a3a5ae224755dc34a1cfcd4fcb1f9ddf9e94eb7c6abdcec0620e87893c7171a68e9aafa23e2478a08dce0605eda97e789f419de6bca297e1',
  address: '0xb42a6d2241baa5c67c9dcd7754bf53981c469736',
};

module.exports = {
  DEFAULT_TRANSACTION,
  CONTRACT_CREATE_TX,
  CONTRACT_INVOKE_TX,
  DEFAULT_WALLET,
};
