import { aliasIncludeParser } from '../aliasIncludeParser';

describe('aliasIncludeParser', () => {
  it('mount data on correct paths without alias and deletes original path', () => {
    const fileContent = {
      data: {
        localeInclude: 'xxx',
      },
    };
    aliasIncludeParser({
      host: fileContent,
      target: { includedData: 'yyy' },
      mountPath: ['data'],
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
      host: fileContent,
      target: { includedData: 'yyy' },
      mountPath: ['data'],
      includeKey: 'myLocaleInclude',
    });
    expect(fileContent.data).toStrictEqual({
      myLocale: { includedData: 'yyy' },
    });
  });
});
