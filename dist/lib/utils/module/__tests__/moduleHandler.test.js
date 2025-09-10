"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../logger");
const moduleManager_1 = require("../moduleManager");
// This works in conjunction with "__mocks__/clear-module.js"
jest.mock('clear-module');
// This test is executed from dist folder
const dummyModulePath = fs_1.default.realpathSync(path_1.default.resolve(path_1.default.join(__dirname, '../../../../../src/lib/utils/module/__mocks__/dummyModule.query.js')));
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
