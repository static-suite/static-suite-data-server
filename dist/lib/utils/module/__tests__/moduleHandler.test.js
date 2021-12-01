"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
const path_1 = __importStar(require("path"));
const logger_1 = require("@lib/utils/logger");
const moduleManager_1 = require("../moduleManager");
// This works in conjunction with "__mocks__/clear-module.js"
jest.mock('clear-module');
const dummyModulePath = (0, path_1.resolve)(path_1.default.join(__dirname, '../__mocks__/dummyModule.query.js'));
beforeEach(() => {
    logger_1.logger.error = jest.fn();
});
describe('moduleHandler test', () => {
    describe('get', () => {
        describe('when a module exists', () => {
            it('gets a module without logging any error', () => {
                const { dummyObject } = moduleManager_1.moduleManager.get(dummyModulePath);
                expect(dummyObject.key).toBe('dummyModuleValue');
                expect(logger_1.logger.error).not.toHaveBeenCalled();
            });
            it('gets a module twice without reloading it', () => {
                const { dummyObject: firstDummyObject } = moduleManager_1.moduleManager.get(dummyModulePath);
                expect(firstDummyObject.key).toBe('dummyModuleValue');
                firstDummyObject.key = 'updatedDummyModuleValue';
                const { dummyObject: secondDummyObject } = moduleManager_1.moduleManager.get(dummyModulePath);
                expect(secondDummyObject.key).toBe('updatedDummyModuleValue');
            });
        });
        describe('when a module does not exist', () => {
            it('throws an exception and logs an error', () => {
                expect(() => moduleManager_1.moduleManager.get('invalid-path')).toThrow();
                expect(logger_1.logger.error).toHaveBeenCalled();
            });
        });
    });
    describe('load', () => {
        describe('when a module exists', () => {
            it('loads a module without logging any error', () => {
                const { dummyObject } = moduleManager_1.moduleManager.load(dummyModulePath);
                expect(dummyObject.key).toBe('dummyModuleValue');
                expect(logger_1.logger.error).not.toHaveBeenCalled();
            });
            it('loads a module twice reloading it from scratch', () => {
                const { dummyObject: firstDummyObject } = moduleManager_1.moduleManager.load(dummyModulePath);
                const { dummyObject: secondDummyObject } = moduleManager_1.moduleManager.load(dummyModulePath);
                firstDummyObject.key = 'updatedDummyModuleValue';
                expect(firstDummyObject.key).toBe('updatedDummyModuleValue');
                expect(secondDummyObject.key).toBe('dummyModuleValue');
            });
        });
        describe('when a module does not exist', () => {
            it('throws an exception and logs an error', () => {
                expect(() => moduleManager_1.moduleManager.get('invalid-path')).toThrow();
                expect(logger_1.logger.error).toHaveBeenCalled();
            });
        });
    });
    describe('remove', () => {
        it('removes a single module from Node.js cache', () => {
            const { dummyObject: firstDummyObject } = moduleManager_1.moduleManager.get(dummyModulePath);
            moduleManager_1.moduleManager.remove(dummyModulePath);
            const { dummyObject: secondDummyObject } = moduleManager_1.moduleManager.get(dummyModulePath);
            firstDummyObject.key = 'updatedDummyModuleValue';
            expect(firstDummyObject.key).toBe('updatedDummyModuleValue');
            expect(secondDummyObject.key).toBe('dummyModuleValue');
        });
    });
    describe('removeAll', () => {
        it('removes several modules from Node.js cache', () => {
            const { dummyObject: dummyObject1 } = moduleManager_1.moduleManager.get(dummyModulePath);
            dummyObject1.key = 'updatedDummyModuleValue';
            moduleManager_1.moduleManager.removeAll(/dummyModule/);
            const { dummyObject: dummyObject2 } = moduleManager_1.moduleManager.get(dummyModulePath);
            expect(dummyObject1.key).toBe('updatedDummyModuleValue');
            expect(dummyObject2.key).toBe('dummyModuleValue');
        });
    });
});
