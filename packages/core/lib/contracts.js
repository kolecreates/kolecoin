const isContractData = (data) => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  if (Array.isArray(data)) {
    return false;
  }

  const keyCount = Object.keys(data).length;
  if (keyCount > 1) {
    return false;
  }
  if (data.invoke) {
    if (!data.invoke.args || !data.invoke.name) {
      return false;
    }
  } else if (data.create) {
    const keys = Object.keys(data.create);
    if (keys.length < 1) {
      return false;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const k of keys) {
      const def = data.create[k];
      if (!def) {
        return false;
      }
      if (!Array.isArray(def.commands)) {
        return false;
      }
      if (def.params && !Array.isArray(def.params)) {
        return false;
      }
    }
  } else {
    return false;
  }

  return true;
};

module.exports = {
  isContractData,
};
