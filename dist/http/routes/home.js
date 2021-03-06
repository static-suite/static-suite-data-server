"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.home = void 0;
const home = (req, res) => {
    res.render('home', {
        links: {
            '/data': 'Browse all data loaded into the server',
            '/query': 'List of available queries',
            '/cache': 'List of available cache bins',
            '/status': 'All things nerd',
            '/reset': 'Reset the Data Server and load all contents from scratch',
            '/docs': 'Documentation',
        },
    });
};
exports.home = home;
