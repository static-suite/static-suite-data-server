import path from 'path';
import { config } from '@lib/config';
import { findFilesInDir } from '@lib/utils/fs';

/**
 * The suffix that all queries contain in their filename.
 *
 * @remarks
 * It ends in ".js" since that the only language Node.js understands.
 * If you develop your queries using TyèScript, they must be compiled
 * to JavaScript before they can be executed.
 */
const QUERY_SUFFIX = '.query.js';

/**
 * A manager that acts on top of queries.
 */
export const queryManager = {
  /**
   * Gets a list of available query IDs.
   *
   * @remarks
   * Checks any module inside config.queryDir that ends in '.query.js'
   *
   * @returns Array with available query IDs (without the '.query.js' suffix).
   */
  getAvailableQueryIds: (): string[] => {
    if (config.queryDir) {
      return findFilesInDir(config.queryDir, `**/*${QUERY_SUFFIX}`).map(
        filename => filename.replace(QUERY_SUFFIX, ''),
      );
    }
    return [];
  },

  /**
   * Gets the absolute path to a query module file.
   *
   * @param queryId - A query id (without the '.query.js' suffix).
   *
   * @returns The absolute path to a query module file, or null if no queryDir is defined.
   */
  getQueryModulePath: (queryId: string): string | null =>
    config.queryDir
      ? `${path.join(config.queryDir, queryId)}${QUERY_SUFFIX}`
      : null,
};
