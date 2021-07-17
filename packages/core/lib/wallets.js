const { ADDRESS_PREFIX } = require('./constants');

const isAddress = (addr) => {
  if (typeof addr !== 'string') {
    return false;
  }
  if (addr.slice(0, 2) !== ADDRESS_PREFIX) {
    return false;
  }

  return true;
};

module.exports = {
  isAddress,
};
