"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@lib/config");
const dataServer_types_1 = require("@lib/dataServer.types");
const cache_1 = require("@lib/utils/cache");
const logger_1 = require("@lib/utils/logger");
const path_1 = require("path");
const query_types_1 = require("../query.types");
const queryRunner_1 = require("../queryRunner");
const queryManager_1 = require("../queryManager");
beforeEach(() => {
    config_1.config.queryDir = (0, path_1.resolve)('src/__tests__/fixtures/query');
    config_1.config.runMode = dataServer_types_1.RunMode.PROD;
});
let random = 0;
describe('QueryRunner test', () => {
    describe('getAvailableQueryIds', () => {
        it('Returns correct queries ids from fixtures', () => {
            expect(Array.from(queryManager_1.queryManager.getModuleGroupInfo().keys())).toEqual([
                'error',
                'noHandler',
                'query1',
                'query2',
            ]);
        });
    });
    describe('run', () => {
        it('Returns query data', () => {
            cache_1.cache.bin('query').clear();
            const queryResponse = queryRunner_1.queryRunner.run('query1', {
                x: 'x',
                y: '33',
            });
            const data = !(0, query_types_1.isQueryErrorResponse)(queryResponse) && queryResponse.data[0];
            expect(data.id).toEqual('33');
            ({ random } = data);
        });
        it('Returns query data from cache', () => {
            const queryResponse = queryRunner_1.queryRunner.run('query1', {
                x: 'x',
                y: '33',
            });
            const response = !(0, query_types_1.isQueryErrorResponse)(queryResponse)
                ? queryResponse
                : null;
            expect(response?.metadata?.cache).toBeTruthy();
            expect(response?.data?.[0]?.random).toEqual(random);
        });
        it('Logs error when query fails', () => {
            logger_1.logger.error = jest.fn();
            try {
                queryRunner_1.queryRunner.run('error', {});
            }
            catch (e) {
                // none
            }
            expect(logger_1.logger.error).toHaveBeenCalled();
        });
    });
});
