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
    if (keys.some((k) => {
      const def = data.create[k];
      return !def || !Array.isArray(def.commands) || (def.params && !Array.isArray(def.params));
    })) {
      return false;
    }
  } else {
    return false;
  }

  return true;
};

module.exports = {
  isContractData,
};
