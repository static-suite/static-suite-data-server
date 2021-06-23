const home = (req, res) => {
  res.render('home', {
    links: {
      '/data': 'Browse all data loaded into the server',
      '/query': 'List of available queries',
      '/status': 'All things nerd',
      '/reset': 'Reset the Data Server and load all contents from scratch',
      '/docs': 'Documentation',
    },
  });
};

module.exports = { home };
