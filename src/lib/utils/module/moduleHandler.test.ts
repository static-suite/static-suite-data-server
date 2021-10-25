import { moduleHandler } from './moduleHandler';

const mockModuleHandler = () => {
  const originalLoad = moduleHandler.load;
  return jest
    .fn()
    .mockImplementation((modulePath: string) => originalLoad(modulePath));
};

const dummyModulePath = '../../..yar/mocks/dummyModule';

describe('lib/utils/module/moduleHandler test', () => {
  describe('get/load', () => {
    const load = mockModuleHandler();
    moduleHandler.load = load.bind(moduleHandler);
    it(`correctly gets a module with load`, () => {
      const { dummyModule } = moduleHandler.get(dummyModulePath);
      expect(load).toHaveBeenCalled();
      expect(dummyModule()).toBe('dummyModuleValue');
    });

    it(`correctly gets a module without load`, () => {
      load.mockClear();
      const { dummyModule } = moduleHandler.get(dummyModulePath);
      expect(load).not.toHaveBeenCalled();
      expect(dummyModule()).toBe('dummyModuleValue');
    });
  });
  describe('remove', () => {
    it(`correctly removes a module`, () => {
      const { dummyModule } = moduleHandler.get(dummyModulePath);
      expect(dummyModule()).toBe('dummyModuleValue');
      moduleHandler.remove(dummyModulePath);
      const load = mockModuleHandler();
      moduleHandler.load = load.bind(moduleHandler);
      moduleHandler.get(dummyModulePath);
      expect(load).toHaveBeenCalledTimes(1);
    });
  });
});
