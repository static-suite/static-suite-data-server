import { config } from '@lib/config';
import { RunMode } from '@lib/dataServer.types';
import { cache } from '@lib/utils/cache';
import { logger } from '@lib/utils/logger';
import { resolve } from 'path';
import { isQueryErrorResponse } from '../query.types';
import { queryRunner } from '../queryRunner';
import { queryManager } from '../queryManager';

beforeEach(() => {
  config.queryDir = resolve('src/mocks/fixtures/query');
  config.runMode = RunMode.PROD;
});

let random = 0;

describe('QueryRunner test', () => {
  describe('getAvailableQueryIds', () => {
    it('Returns correct queries ids from fixtures', () => {
      expect(Array.from(queryManager.getModuleGroupInfo().keys())).toEqual([
        'error.query',
        'query1.query',
        'query2.query',
      ]);
    });
  });

  describe('run', () => {
    it('Returns query data', () => {
      cache.bin('query').clear();
      const queryResponse = queryRunner.run('query1.query', {
        x: 'x',
        y: '33',
      });
      const data =
        !isQueryErrorResponse(queryResponse) && queryResponse.data[0];
      expect(data.id).toEqual('33');
      ({ random } = data);
    });

    it('Returns query data from cache', () => {
      const queryResponse = queryRunner.run('query1.query', {
        x: 'x',
        y: '33',
      });
      const response = !isQueryErrorResponse(queryResponse)
        ? queryResponse
        : null;
      expect(response?.metadata?.cache).toBeTruthy();
      expect(response?.data?.[0]?.random).toEqual(random);
    });

    it('Logs error when query fails', () => {
      logger.error = jest.fn();
      try {
        queryRunner.run('error.query', {});
      } catch (e) {
        // none
      }
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
