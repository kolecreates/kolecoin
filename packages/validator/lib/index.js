const { createBlockId } = require('@kolecoin/core/lib/blocks');
const { findLatestLookupFieldValue } = require('@kolecoin/core/lib/ledger');
const { BASE_TX_FEE } = require('@kolecoin/core/lib/constants');

const calculateFee = (tx) => {
  if (!tx.data) {
    return BASE_TX_FEE;
  }

  return 0;
};

const txPoolToBlock = (ledger, pool, verifier, proofOfAuth) => {
  if (!Array.isArray(pool)) {
    throw new Error('Invalid tx pool.');
  }
  const lookup = {};
  const txs = [];

  pool
    .sort((a, b) => a.nonce - b.nonce)
    .forEach((tx) => {
      let fromItem = lookup[tx.from];
      let toItem = lookup[tx.to];
      if (!fromItem) {
        fromItem = {
          nonce: findLatestLookupFieldValue(ledger, tx.from, 'nonce') || 0,
          balance: findLatestLookupFieldValue(ledger, tx.from, 'balance') || 0,
          fees: [],
        };
      }
      if (tx.to && !toItem) {
        toItem = {
          balance: findLatestLookupFieldValue(ledger, tx.to, 'balance') || 0,
        };
      }
      if (fromItem.balance >= tx.value + tx.feeLimit) {
        const fee = calculateFee(tx);
        fromItem.balance -= tx.value + fee;
        fromItem.fees.push(fee);
        fromItem.nonce = tx.nonce;
        if (toItem) {
          toItem.balance += tx.value;
        }
        txs.push(tx);
      }

      lookup[tx.from] = fromItem;
      if (toItem) {
        lookup[tx.to] = toItem;
      }
    });

  return {
    prev: ledger.latestId,
    id: createBlockId(),
    timestamp: Date.now(),
    transactions: txs,
    lookup,
    verifier,
    proofOfAuth,
  };
};

module.exports = {
  txPoolToBlock,
};
