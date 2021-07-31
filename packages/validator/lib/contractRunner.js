/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
const { CONTRACT_COMMAND_FEE } = require('@kolecoin/core/lib/constants');
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

  ifEqual(a, b, ifCase, elseCase) {
    this.fee += CONTRACT_COMMAND_FEE;
    if (a === b) {
      if (isCallable(ifCase)) return ifCase();
    } else if (isCallable(elseCase)) return elseCase();

    return null;
  }

  ifGTE(a, b, ifCase, elseCase) {
    this.fee += CONTRACT_COMMAND_FEE;
    if (a >= b) {
      if (isCallable(ifCase)) return ifCase();
    } else if (isCallable(elseCase)) return elseCase();

    return null;
  }

  getState(field) {
    this.fee += CONTRACT_COMMAND_FEE;
    return this.state[field];
  }

  setState(field, value) {
    this.fee += CONTRACT_COMMAND_FEE;
    this.state[field] = value;
    return value;
  }

  getInvoke(field) {
    this.fee += CONTRACT_COMMAND_FEE;
    return this.invokeTx[field];
  }

  accept() {
    this.fee += CONTRACT_COMMAND_FEE;
    this.accepted = true;
  }

  reject() {
    this.fee += CONTRACT_COMMAND_FEE;
    this.rejected = true;
  }
}

class ContractRunner {
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
    this.runtime = new ContractRuntime(this.initState, this.invokeTx);
    for (let i = 0; i < this.logic.length; i += 1) {
      const line = this.logic[i];
      this.execLine(line);
    }
    return { state: this.runtime.state, fee: this.runtime.fee, txs: this.runtime.txs };
  }
}

module.exports = ContractRunner;
