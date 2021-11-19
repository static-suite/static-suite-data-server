import { aliasIncludeParser } from '../aliasIncludeParser';

describe('aliasIncludeParser', () => {
  it('mount data on correct paths without alias and deletes original path', () => {
    const fileContent = {
      data: {
        localeInclude: 'xxx',
      },
    };
    aliasIncludeParser({
      fileContent,
      includeData: { includedData: 'yyy' },
      mountPointPath: ['data'],
      includeKey: 'localeInclude',
    });
    expect(fileContent.data).toStrictEqual({
      locale: { includedData: 'yyy' },
    });
  });

  it('mount data on correct paths with alias and deletes original path', () => {
    const fileContent = {
      data: {
        myLocaleInclude: 'xxx',
      },
    };
    aliasIncludeParser({
      fileContent,
      includeData: { includedData: 'yyy' },
      mountPointPath: ['data'],
      includeKey: 'myLocaleInclude',
    });
    expect(fileContent.data).toStrictEqual({
      myLocale: { includedData: 'yyy' },
    });
  });
});
