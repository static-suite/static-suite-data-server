const query1 = () => {
  const result = [
    {
      id: '1',
    },
  ];

  return {
    result,
    cacheable: true,
  };
};

module.exports.queryHandler = query1;
