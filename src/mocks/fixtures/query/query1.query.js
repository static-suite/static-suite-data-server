const query1 = ({ args }) => {
  const result = [
    {
      id: args.y,
    },
  ];

  return {
    result,
    cacheable: true,
  };
};

module.exports.queryHandler = query1;
