const path = require('path');
const marked = require('marked');
const { readFile } = require('@lib/utils/fsUtils');

const docs = (req, res) => {
  const readme = readFile(path.join(__dirname, '../../../README.md'));
  res.render('docs', { marked, readme });
};

module.exports = { docs };
