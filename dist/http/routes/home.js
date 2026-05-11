"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.home = void 0;
const package_json_1 = require("../../../package.json");
const home = (req, res) => {
    res.render('home', {
        version: package_json_1.version,
        links: {
            '/data': 'Browse all data loaded into the server',
            '/dependency': 'Dependency data',
            '/diff': 'Diff operations',
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
