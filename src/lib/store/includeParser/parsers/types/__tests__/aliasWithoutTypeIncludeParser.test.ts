import { aliasWithoutTypeIncludeParser } from '../aliasWithoutTypeIncludeParser';

describe('aliasWithoutTypeIncludeParser', () => {
  it('mount data on correct paths without alias and deletes original path', () => {
    const fileContent = {
      data: {
        customInclude: 'xxx',
      },
    };
    aliasWithoutTypeIncludeParser(
      {
        fileContent,
        includeData: { includedData: 'yyy' },
        mountPointPath: ['data'],
        includeKey: 'customInclude',
      },
      'custom',
    );
    expect(fileContent.data).toStrictEqual({
      custom: { includedData: 'yyy' },
    });
  });

  it('mount data on correct paths with alias and deletes original path', () => {
    const fileContent = {
      data: {
        myCustomInclude: 'xxx',
      },
    };
    aliasWithoutTypeIncludeParser(
      {
        fileContent,
        includeData: { includedData: 'yyy' },
        mountPointPath: ['data'],
        includeKey: 'myCustomInclude',
      },
      'custom',
    );
    expect(fileContent.data).toStrictEqual({
      my: { includedData: 'yyy' },
    });
  });
});
