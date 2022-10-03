"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.home = void 0;
const home = (req, res) => {
    res.render('home', {
        links: {
            '/data': 'Browse all data loaded into the server',
            '/dependency': 'Dependency data',
            '/dump': 'Dump operations',
            '/query': 'List of available queries',
            '/task': 'List of available tasks',
            '/cache': 'List of available cache bins',
            '/status': 'All things nerd',
            '/docs': 'Documentation',
        },
    });
};
exports.home = home;
