/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import { config } from '@lib/config';
import { logger } from '@lib/utils/logger';
import { resolve } from 'path';
import { moduleManager } from '../moduleManager';

/* const mockModuleHandler = () => {
  const originalLoad = moduleHandler.load;
  return jest
    .fn()
    .mockImplementation((modulePath: string) => originalLoad(modulePath));
}; */

const dummyModulePath = resolve('src/__tests__/mocks/dummyModule.query');

beforeEach(() => {
  logger.error = jest.fn();
  jest.resetModules();
  config.queryDir = resolve('src/__tests__/mocks/');
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
        const { dummyObject: dummyObject1 } =
          moduleManager.get(dummyModulePath);
        expect(dummyObject1.key).toBe('dummyModuleValue');
        dummyObject1.key = 'updatedDummyModuleValue';
        const { dummyObject: dummyObject2 } =
          moduleManager.get(dummyModulePath);
        expect(dummyObject2.key).toBe('updatedDummyModuleValue');
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
        const { dummyObject: dummyObject1 } =
          moduleManager.load(dummyModulePath);
        // Jest completely takes over the require system for the
        // code under test. Therefore, it does not implement require.cache.
        // Until that problem is fixed, we must reset all modules
        // so this test works (but making it nearly useless)
        jest.resetModules();
        const { dummyObject: dummyObject2 } =
          moduleManager.load(dummyModulePath);
        dummyObject1.key = 'updatedDummyModuleValue';
        expect(dummyObject1.key).toBe('updatedDummyModuleValue');
        expect(dummyObject2.key).toBe('dummyModuleValue');
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
      const { dummyObject: dummyObject1 } = moduleManager.get(dummyModulePath);
      // Jest completely takes over the require system for the
      // code under test. Therefore, it does not implement require.cache.
      // Until that problem is fixed, we must reset all modules
      // so this test works (but making it nearly useless)
      jest.resetModules();
      moduleManager.remove(dummyModulePath);
      const { dummyObject: dummyObject2 } = moduleManager.get(dummyModulePath);
      dummyObject1.key = 'updatedDummyModuleValue';
      expect(dummyObject1.key).toBe('updatedDummyModuleValue');
      expect(dummyObject2.key).toBe('dummyModuleValue');
    });
  });

  describe('removeAll', () => {
    it('removes several modules from Node.js cache', () => {
      // Jest completely takes over the require system for the
      // code under test. Therefore, it does not implement require.cache.
      // Until that problem is fixed, we must isolate modules
      // so this test works (but making it nearly useless)
      jest.isolateModules(() => {
        const {
          moduleManager: isolatedModuleManager,
        } = require('../moduleManager');

        const { dummyObject: dummyObject1 } =
          isolatedModuleManager.get(dummyModulePath);
        isolatedModuleManager.removeAll(/dummyModule/);
        dummyObject1.key = 'updatedDummyModuleValue';
        expect(dummyObject1.key).toBe('updatedDummyModuleValue');
      });

      // Jest completely takes over the require system for the
      // code under test. Therefore, it does not implement require.cache.
      // Until that problem is fixed, we must reset all modules
      // so this test works (but making it nearly useless)
      jest.resetModules();

      const { dummyObject: dummyObject2 } = moduleManager.get(dummyModulePath);
      expect(dummyObject2.key).toBe('dummyModuleValue');
    });
  });
});
