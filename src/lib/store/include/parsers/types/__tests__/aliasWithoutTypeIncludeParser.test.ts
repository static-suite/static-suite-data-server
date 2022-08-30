import { aliasWithoutTypeIncludeParser } from '../aliasWithoutTypeIncludeParser';

describe('aliasWithoutTypeIncludeParser', () => {
  it('mount data on correct paths without alias and deletes original path', () => {
    const hostObject = {
      data: {
        customInclude: 'xxx',
      },
    };
    aliasWithoutTypeIncludeParser(
      {
        host: hostObject,
        target: { includedData: 'yyy' },
        mountPath: ['data'],
        includeKey: 'customInclude',
      },
      'custom',
    );
    expect(hostObject.data).toStrictEqual({
      custom: { includedData: 'yyy' },
    });
  });

  it('mount data on correct paths with alias and deletes original path', () => {
    const hostObject = {
      data: {
        myCustomInclude: 'xxx',
      },
    };
    aliasWithoutTypeIncludeParser(
      {
        host: hostObject,
        target: { includedData: 'yyy' },
        mountPath: ['data'],
        includeKey: 'myCustomInclude',
      },
      'custom',
    );
    expect(hostObject.data).toStrictEqual({
      my: { includedData: 'yyy' },
    });
  });
});
