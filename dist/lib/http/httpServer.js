"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const { logger } = require('../utils/logger');
const { routes } = require('./routes');
exports.httpServer = {
    start: (port) => {
        const app = (0, express_1.default)();
        app.use(express_1.default.static(`${__dirname}/public`));
        app.use((0, cors_1.default)());
        app.set('views', path_1.default.join(__dirname, 'views'));
        app.set('view engine', 'pug');
        app.get('/query/*', routes.query.run);
        app.get('/query', routes.query.index);
        app.get('/reset', routes.reset);
        app.get('/status', routes.status);
        app.get(['/data/*', '/data'], routes.data);
        app.get('/docs', routes.docs);
        app.get('/', routes.home);
        app.listen(port, () => {
            logger.info(`Data server listening at http://localhost:${port}`);
        });
    },
};
