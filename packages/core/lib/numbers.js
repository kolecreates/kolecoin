
const isNumber = (val) => {
    return typeof val === 'number' && !Number.isNaN(val);
};

module.exports = {
    isNumber,
};