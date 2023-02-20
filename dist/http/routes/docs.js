"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.docs = void 0;
const path_1 = __importDefault(require("path"));
const marked_1 = __importDefault(require("marked"));
const fsUtils_1 = require("../../lib/utils/fs/fsUtils");
const docs = (req, res) => {
    const readme = (0, fsUtils_1.readFile)(path_1.default.join(__dirname, '../README.md'));
    res.render('docs', { marked: marked_1.default, readme });
};
exports.docs = docs;
