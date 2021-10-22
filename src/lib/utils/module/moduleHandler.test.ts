import { moduleHandler } from './moduleHandler';

const mockModuleHandler = () => {
  const originalLoad = moduleHandler.load;
  return jest
    .fn()
    .mockImplementation((modulePath: string) => originalLoad(modulePath));
};

describe('lib/utils/module/moduleHandler test', () => {
  describe('get/load', () => {
    const load = mockModuleHandler();
    moduleHandler.load = load.bind(moduleHandler);
    it(`correctly gets a module with load`, () => {
      const { dummyModule } = moduleHandler.get(
        '../../../../tests/dummyModule',
      );
      expect(load).toHaveBeenCalled();
      expect(dummyModule()).toBe('dummyModuleValue');
    });

    it(`correctly gets a module without load`, () => {
      load.mockClear();
      const { dummyModule } = moduleHandler.get(
        '../../../../tests/dummyModule',
      );
      expect(load).not.toHaveBeenCalled();
      expect(dummyModule()).toBe('dummyModuleValue');
    });
  });
  describe('remove', () => {
    it(`correctly removes a module`, () => {
      const { dummyModule } = moduleHandler.get(
        '../../../../tests/dummyModule',
      );
      expect(dummyModule()).toBe('dummyModuleValue');
      moduleHandler.remove('../../../../tests/dummyModule');
      const load = mockModuleHandler();
      moduleHandler.load = load.bind(moduleHandler);
      moduleHandler.get('../../../../tests/dummyModule');
      expect(load).toHaveBeenCalledTimes(1);
    });
  });
});
