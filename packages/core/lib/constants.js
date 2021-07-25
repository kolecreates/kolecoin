const ROOT_PUBLIC_KEY = '0484351f447b07d35cad1b199781e47162001024b409e52392460ae474213522a07b07fff8aeb69492143b30448d432cfcb4505705aab79288ae10dd82a905c9dd';
const TOTAL_COIN_SUPPLY = 1000000000000000; // quadrillion
module.exports = {
  MAXIMUM_COIN_DELTA: 1000000000000, // trillion
  MINIMUM_COIN_DELTA: 0.001,
  MAXIMUM_VALUE_ERROR: 'value exceeds maximum',
  MINUMUM_VALUE_ERROR: 'value below minimum',
  NAN_VALUE_ERROR: 'value is not a number',
  INVALID_ADDRESS_ERROR: 'address is not valid',
  TX_DATA_MISSING_ERROR: 'missing data field on transaction',
  TX_INVALID_DATA_ERROR: 'data field on transaction is invalid',
  BLOCK_EXISTS_ERROR: 'Block already exists.',
  BLOCK_INVALID_ERROR: 'Block data invalid.',
  BLOCK_TRUST_ERROR: 'Block not trusted.',
  LEDGER_INVALID_ERROR: 'Ledger data invalid',
  MAX_NEW_BLOCK_AGE_MS: 1000 * 30, // 30 seconds
  P2P_MESSAGE_TYPES: {
    GET_BLOCK: 0,
    ADD_BLOCK: 1,
    ADD_TX: 3,
    ADD_VERIFIER: 4,
    LIST_VERIFIERS: 5,
  },
  ROOT_PUBLIC_KEY,
  TOTAL_COIN_SUPPLY,
  ROOT_BLOCK: {
    prev: null,
    id: '0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: 1626652800000,
    transactions: [],
    lookup: {
      [ROOT_PUBLIC_KEY]: {
        nonce: 0,
        balance: TOTAL_COIN_SUPPLY,
      },
    },
    verifier: ROOT_PUBLIC_KEY,
    proofOfAuth: '',
  },
  BASE_TX_FEE: 0.01,
};
