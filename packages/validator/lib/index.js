const { createBlockId } = require('@kolecoin/core/lib/blocks');
const { findLatestLookupFieldValue } = require('@kolecoin/core/lib/ledger');
const { BASE_TX_FEE } = require('@kolecoin/core/lib/constants');
const { createContractAddress } = require('@kolecoin/core/lib/contracts');
const ContractRunner = require('./contractRunner');

const txPoolToBlock = (ledger, pool, verifier, proofOfAuth) => {
  if (!Array.isArray(pool)) {
    throw new Error('Invalid tx pool.');
  }
  const prevLookup = {};
  const lookup = {};
  const currentOrPrevLookup = (addr) => (lookup[addr] ? lookup[addr] : prevLookup[addr]);
  const txs = [];

  const sortedPool = pool.sort((a, b) => a.nonce - b.nonce);

  const nonceFrom = {};
  sortedPool.filter((tx) => {
    const key = `${tx.from}${tx.nonce}`;
    if (nonceFrom[key]) {
      return false;
    }
    nonceFrom[key] = true;
    return true;
  }).forEach((tx) => {
    let fromItem = currentOrPrevLookup(tx.from);
    let toItem = currentOrPrevLookup(tx.to);
    if (!fromItem) {
      fromItem = {
        balance: findLatestLookupFieldValue(ledger, tx.from, 'balance') || 0,
        fees: [],
      };
      prevLookup[tx.from] = fromItem;
    }
    if (tx.to && !toItem) {
      toItem = {
        balance: findLatestLookupFieldValue(ledger, tx.to, 'balance') || 0,
      };
      if (tx.data && tx.data.invoke) {
        toItem.state = findLatestLookupFieldValue(ledger, tx.to, 'state');
        if (!toItem.state) {
          return;
        }
        toItem.functions = findLatestLookupFieldValue(ledger, tx.to, 'functions');
        if (!toItem.functions || !toItem.functions[tx.data.invoke.name]) {
          return;
        }
      }
      prevLookup[tx.to] = toItem;
    }
    if (
      fromItem.balance >= tx.value + tx.feeLimit
    ) {
      let fee = BASE_TX_FEE;
      if (toItem) {
        if (toItem.functions) {
          const result = ContractRunner.run(
            toItem.functions[tx.data.invoke.name].logic,
            toItem.state,
            tx,
          );
          lookup[tx.to] = {
            ...(lookup[tx.to] ?? {}),
            state: result.state,
            ...(result.accepted ? { balance: toItem.balance + tx.value } : {}),
          };

          fee += result.fee;
          if (result.rejected) {
            fromItem.balance += tx.value;
          }
        } else {
          toItem.balance += tx.value;
          lookup[tx.to] = toItem;
        }
      } else if (!tx.to && tx.data && tx.data.create) {
        const contractAddr = createContractAddress(tx.from, tx.nonce);
        lookup[contractAddr] = {
          state: tx.data.create.state,
          functions: tx.data.create.functions,
          balance: tx.value,
        };
      }

      fromItem.balance -= tx.value + fee;
      if (!fromItem.fees) {
        fromItem.fees = [fee];
      } else {
        fromItem.fees.push(fee);
      }
      fromItem.nonce = tx.nonce;
      lookup[tx.from] = fromItem;
      txs.push(tx);
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
