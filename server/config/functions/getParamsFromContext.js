const defaultOptions = {
  isQueryFirstPriority: true,
};

const getParamsFromContext = (ctx, defaultParams = {}, options = {}) => {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const query = ctx?.request?.query ?? {};
  const body = ctx?.request?.body ?? {};

  return mergedOptions.isQueryFirstPriority
    ? {
        ...defaultParams,
        ...body,
        ...query,
      }
    : {
        ...defaultParams,
        ...query,
        ...body,
      };
};

module.exports = getParamsFromContext;
