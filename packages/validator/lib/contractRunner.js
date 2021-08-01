/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
const { CONTRACT_COMMAND_FEE } = require('@kolecoin/core/lib/constants');
const { isFeeOrPayment } = require('@kolecoin/core/lib/numbers');
const { isPlainObject } = require('@kolecoin/core/lib/objects');

const isCallable = (a) => typeof a === 'function';
class ContractRuntime {
  constructor(initState, invokeTx) {
    this.invokeTx = invokeTx;
    this.state = { ...initState };
    this.txs = [];
    this.fee = 0;
    this.accepted = false;
    this.rejected = false;
  }

  addToFee(value = CONTRACT_COMMAND_FEE) {
    if (isFeeOrPayment(value)) {
      if (this.fee + value > this.invokeTx.feeLimit) {
        throw new Error('feeLimit exceeded');
      } else {
        this.fee += value;
      }
    }
  }

  ifEqual(a, b, ifCase, elseCase) {
    this.addToFee();
    if (a === b) {
      if (isCallable(ifCase)) return ifCase();
    } else if (isCallable(elseCase)) return elseCase();

    return null;
  }

  ifGTE(a, b, ifCase, elseCase) {
    this.addToFee();
    if (a >= b) {
      if (isCallable(ifCase)) return ifCase();
    } else if (isCallable(elseCase)) return elseCase();

    return null;
  }

  getState(field) {
    this.addToFee();
    return this.state[field];
  }

  setState(field, value) {
    this.addToFee();
    this.state[field] = value;
    return value;
  }

  getInvoke(field) {
    this.addToFee();
    return this.invokeTx[field];
  }

  accept() {
    this.addToFee();
    this.accepted = true;
  }

  reject() {
    this.addToFee();
    this.rejected = true;
  }
}

class ContractRunner {
  static run(logic, state, invokeTx) {
    const runner = new ContractRunner(logic, state, invokeTx);

    return runner.run();
  }

  constructor(logic, initState, invokeTx) {
    this.logic = logic;
    this.initState = initState;
    this.invokeTx = invokeTx;
    this.runtime = null;
  }

  execLine(line) {
    const params = line.$params.map((p) => {
      if (isPlainObject(p) && p.$command) {
        return this.execLine(p);
      }

      return p;
    });
    const callbacks = line.$callbacks.filter((cb) => !!cb).map((cb) => () => {
      if (Array.isArray(cb)) {
        const results = cb.map((cbl) => this.execLine(cbl));

        return results[results.length - 1];
      }
      return this.execLine(cb);
    });

    return this.runtime[line.$command](...params, ...callbacks);
  }

  run() {
    try {
      this.runtime = new ContractRuntime(this.initState, this.invokeTx);
      for (let i = 0; i < this.logic.length; i += 1) {
        const line = this.logic[i];
        this.execLine(line);
      }
      return {
        state: this.runtime.state,
        fee: this.runtime.fee,
        txs: this.runtime.txs,
        accepted: this.runtime.accepted,
        rejected: this.runtime.rejected,
      };
    } catch (e) {
      return {
        state: this.initState,
        fee: this.runtime.fee,
        txs: [],
        accepted: false,
        rejected: true,
        error: e,
      };
    }
  }
}

module.exports = ContractRunner;
