const query2 = () => {
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

module.exports.queryHandler = query2;
