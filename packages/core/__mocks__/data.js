const { ROOT_PUBLIC_KEY } = require('../lib/constants');

const USER_WALLET_1 = {
  privateKey: '4f463bb9dccd7feabcc17a10d2a274591f1b60fcfa5d5f2d43b7a83a3f975a41',
  publicKey: '04c13abaee8a1cfab7a3a5ae224755dc34a1cfcd4fcb1f9ddf9e94eb7c6abdcec0620e87893c7171a68e9aafa23e2478a08dce0605eda97e789f419de6bca297e1',
};

const USER_WALLET_2 = {
  privateKey: '3cb70cf9570c05f7f2458da8863a7721250a2989d3dc3014b085984a0b3e47a1',
  publicKey: '04c7ecacc82ce9a23c7ba4418e06619d4777b5d62f3bb645767b566d7a7abfaa877dd3523699f3f29a2ed98d1cbd4e0543a4462a475cf1241cf21ee52e0dcb81a7',
};

const VERIFIER_WALLET = {
  privateKey: 'a187af57a87730627d0388c16c23d854e31e8768a2fc3ef3f4938d10dcc7eccf',
  publicKey: '04f4f270db9e3239f63f172bde88a2778265dffe7f8543decad544f91d1a4300b258a1a7e0c122f352d35273488bdf691384d9cffdcc6b85c24651efea210cb87f',
  proofOfAuth: '304402202f0c28aa78428029deb1b8372e882a250c982fd46117ace918ef8c70342fce5902202ac0c8dc1771975cb7068f926fbe9d778d1520212d41d68be1bb352fb7039357',
};

const FROM_ROOT_TO_USER_1 = {
  from: ROOT_PUBLIC_KEY,
  to: USER_WALLET_1.publicKey,
  value: 10,
  nonce: 0,
  data: undefined,
  feeLimit: 0.2,
  signature: '3045022100b378aa791be77bd135b1d2cf26ffee46a7d03de6d3905741ceb337b9bb74e9fa02201d4d1af807de2f06a6688be6bdb547b3f16c05c16f3c563f0fbe2e45213feba7',
};

const FROM_ROOT_TO_USER_2 = {
  from: ROOT_PUBLIC_KEY,
  to: USER_WALLET_2.publicKey,
  value: 10,
  nonce: 1,
  data: undefined,
  feeLimit: 0.2,
  signature: '3045022100c5bd11a1190f4d8de48b22bf3cb1c2245072580ce5875d66663192235cf0602402206e2f7bbcb23195c6344994f46539c1025942f91a92b55694b38449a91b922eb4',
};

const DEFAULT_TRANSACTION = {
  from: USER_WALLET_1.publicKey,
  to: USER_WALLET_2.publicKey,
  value: 2,
  nonce: 7,
  data: undefined,
  feeLimit: 0.2,
};

const CONTRACT_CREATE_TX = {
  ...DEFAULT_TRANSACTION,
  data: {
    create: {
      state: {
        locked: false,
        owner: null,
        mediaUrl: 'example.com/nft_image.png',
      },
      functions: {
        buyNFT: {
          params: {},
          logic: [
            ['ifEqual', ['getState', 'locked'], true, ['reject']],
            ['ifGTE', ['getTx', 'value'], ['getState', 'buyoutPrice'],
              [
                ['setState', ['locked', true]],
                ['setState', ['owner', ['getTx', 'from']]],
              ],
            ],
          ],
        },
      },
    },
  },
};

const CONTRACT_INVOKE_TX = {
  ...DEFAULT_TRANSACTION,
  data: {
    invoke: {
      name: 'buyNFT',
      args: {},
    },
  },
};

const DEFAULT_BLOCK = {
  prev: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  timestamp: Date.now(),
  transactions: [DEFAULT_TRANSACTION],
  lookup: {
    [DEFAULT_TRANSACTION.from]: {
      nonce: DEFAULT_TRANSACTION.nonce,
      fees: [0.1],
      balance: 0,
    },
    [DEFAULT_TRANSACTION.to]: {
      balance: DEFAULT_TRANSACTION.value - 0.1,
    },
    [VERIFIER_WALLET.publicKey]: {
      balance: 0.1,
    },
  },
  verifier: VERIFIER_WALLET.publicKey,
  proofOfAuth: VERIFIER_WALLET.proofOfAuth,
};

module.exports = {
  USER_WALLET_1,
  USER_WALLET_2,
  VERIFIER_WALLET,
  DEFAULT_TRANSACTION,
  CONTRACT_CREATE_TX,
  CONTRACT_INVOKE_TX,
  DEFAULT_BLOCK,
  FROM_ROOT_TO_USER_1,
  FROM_ROOT_TO_USER_2,
};
