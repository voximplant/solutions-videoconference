const prepareResponse = (data, error, status = 400) => {
  return data
    ? {
        result: true,
        data,
        error: null,
        status: 200,
      }
    : {
        result: false,
        error,
        data: null,
        status,
      };
};

module.exports = prepareResponse;
