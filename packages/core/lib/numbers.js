const { MINIMUM_COIN_VALUE, MAXIMUM_COIN_VALUE } = require('./constants');

const isNumber = (val) => typeof val === 'number' && !Number.isNaN(val);
const isBalance = (val) => isNumber(val) && val !== Infinity && val >= 0;
const isFeeOrPayment = (val) => isNumber(val) && (val >= MINIMUM_COIN_VALUE || val === 0)
&& val <= MAXIMUM_COIN_VALUE;

module.exports = {
  isNumber,
  isBalance,
  isFeeOrPayment,
};
