/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import path, { resolve } from 'path';
import { logger } from '@lib/utils/logger';
import { moduleManager } from '../moduleManager';

// This works in conjunction with "__mocks__/clear-module.js"
jest.mock('clear-module');

const dummyModulePath = resolve(
  path.join(__dirname, '../__mocks__/dummyModule.query.js'),
);

beforeEach(() => {
  logger.error = jest.fn();
});

describe('moduleHandler test', () => {
  describe('get', () => {
    describe('when a module exists', () => {
      it('gets a module without logging any error', () => {
        const { dummyObject } = moduleManager.get(dummyModulePath);

        expect(dummyObject.key).toBe('dummyModuleValue');
        expect(logger.error).not.toHaveBeenCalled();
      });

      it('gets a module twice without reloading it', () => {
        const { dummyObject: firstDummyObject } =
          moduleManager.get(dummyModulePath);
        expect(firstDummyObject.key).toBe('dummyModuleValue');
        firstDummyObject.key = 'updatedDummyModuleValue';
        const { dummyObject: secondDummyObject } =
          moduleManager.get(dummyModulePath);
        expect(secondDummyObject.key).toBe('updatedDummyModuleValue');
      });
    });

    describe('when a module does not exist', () => {
      it('throws an exception and logs an error', () => {
        expect(() => moduleManager.get('invalid-path')).toThrow();
        expect(logger.error).toHaveBeenCalled();
      });
    });
  });

  describe('load', () => {
    describe('when a module exists', () => {
      it('loads a module without logging any error', () => {
        const { dummyObject } = moduleManager.load(dummyModulePath);
        expect(dummyObject.key).toBe('dummyModuleValue');
        expect(logger.error).not.toHaveBeenCalled();
      });

      it('loads a module twice reloading it from scratch', () => {
        const { dummyObject: firstDummyObject } =
          moduleManager.load(dummyModulePath);
        const { dummyObject: secondDummyObject } =
          moduleManager.load(dummyModulePath);

        firstDummyObject.key = 'updatedDummyModuleValue';

        expect(firstDummyObject.key).toBe('updatedDummyModuleValue');
        expect(secondDummyObject.key).toBe('dummyModuleValue');
      });
    });
    describe('when a module does not exist', () => {
      it('throws an exception and logs an error', () => {
        expect(() => moduleManager.get('invalid-path')).toThrow();
        expect(logger.error).toHaveBeenCalled();
      });
    });
  });

  describe('remove', () => {
    it('removes a single module from Node.js cache', () => {
      const { dummyObject: firstDummyObject } =
        moduleManager.get(dummyModulePath);
      moduleManager.remove(dummyModulePath);
      const { dummyObject: secondDummyObject } =
        moduleManager.get(dummyModulePath);
      firstDummyObject.key = 'updatedDummyModuleValue';
      expect(firstDummyObject.key).toBe('updatedDummyModuleValue');
      expect(secondDummyObject.key).toBe('dummyModuleValue');
    });
  });

  describe('removeAll', () => {
    it('removes several modules from Node.js cache', () => {
      const { dummyObject: dummyObject1 } = moduleManager.get(dummyModulePath);
      dummyObject1.key = 'updatedDummyModuleValue';
      moduleManager.removeAll(/dummyModule/);
      const { dummyObject: dummyObject2 } = moduleManager.get(dummyModulePath);

      expect(dummyObject1.key).toBe('updatedDummyModuleValue');
      expect(dummyObject2.key).toBe('dummyModuleValue');
    });
  });
});
