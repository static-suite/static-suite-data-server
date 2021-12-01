"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("@lib/utils/logger");
const routes_1 = __importDefault(require("./routes"));
exports.httpServer = {
    start: (port) => {
        const app = (0, express_1.default)();
        app.use(express_1.default.static(`${__dirname}/public`));
        app.use((0, cors_1.default)());
        app.set('views', path_1.default.join(__dirname, 'views'));
        app.set('view engine', 'pug');
        app.use(routes_1.default);
        app.listen(port, () => {
            logger_1.logger.info(`Data Server listening at http://localhost:${port}`);
        });
    },
};
