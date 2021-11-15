const query1 = ({ args }) => {
  const result = [
    {
      id: args.y,
      random: Math.random(),
    },
  ];

  return {
    result,
    cacheable: true,
  };
};

module.exports.default = query1;
