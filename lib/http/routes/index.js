const { home } = require('./home');
const { query } = require('./query');
const { reset } = require('./reset');
const { status } = require('./status');
const { data } = require('./data');
const { docs } = require('./docs');

module.exports.routes = { home, query, reset, status, data, docs };
