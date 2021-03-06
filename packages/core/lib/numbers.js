const { MINIMUM_COIN_DELTA, MAXIMUM_COIN_DELTA } = require('./constants');

const isNumber = (val) => typeof val === 'number' && !Number.isNaN(val);
const isBalance = (val) => isNumber(val) && val !== Infinity && val >= 0;
const isFeeOrPayment = (val) => isNumber(val) && (val >= MINIMUM_COIN_DELTA || val === 0)
&& val <= MAXIMUM_COIN_DELTA;

module.exports = {
  isNumber,
  isBalance,
  isFeeOrPayment,
};
