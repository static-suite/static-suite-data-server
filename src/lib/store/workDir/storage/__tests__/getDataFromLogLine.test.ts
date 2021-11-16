import { getDataFromLogLine } from '..';

describe('workDir storage getDataFromLogLine test', () => {
  describe('getDataFromLogLine', () => {
    it(`Gets data from line of log`, () => {
      expect(
        getDataFromLogLine(
          '2021-08-16_07-12-45.771095__5959 write [ID: 10] Give it a go and grow your own herbs | static-local://en/entity/node/article/10.json',
        ),
      ).toStrictEqual({
        file: {
          id: '10',
          label: 'Give it a go and grow your own herbs',
          relativePath: 'en/entity/node/article/10.json',
        },
        operation: 'write',
        uniqueId: '2021-08-16_07-12-45.771095__5959',
      });
    });
  });
});
