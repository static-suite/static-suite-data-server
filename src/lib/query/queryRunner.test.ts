import { config } from '@lib/config';
import { resolve } from 'path';
import { QueryResponse } from './query.types';
import { queryRunner } from './queryRunner';

describe('QueryRunner test', () => {
  describe('getAvailableQueryIds', () => {
    it(`Returns correct querys ids from fixtures`, () => {
      config.queryDir = resolve('src/mocks/fixtures/query');
      expect(queryRunner.getAvailableQueryIds()).toEqual([
        'query1.query',
        'query2.query',
      ]);
    });
  });

  describe('run', () => {
    it(`Returns query data`, () => {
      config.queryDir = resolve('src/mocks/fixtures/query');
      const queryResponse = queryRunner.run('query1.query', {
        x: 'x',
        y: '33',
      });
      expect((queryResponse as QueryResponse).data).toEqual([
        {
          id: '33',
        },
      ]);
    });
  });
});
