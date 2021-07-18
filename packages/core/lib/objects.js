const isPlainObject = (val) => typeof val === 'object' && val !== null && !Array.isArray(val);
module.exports = {
  isPlainObject,
};
