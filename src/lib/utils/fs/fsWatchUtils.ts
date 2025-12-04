import chokidar from 'chokidar';
import { logger } from '../logger';

/**
 * Watches for changes on a set of paths and attach listener to them
 *
 * @remarks
 * It handles three different events: add, change and unlink
 *
 * @param paths - An array of paths to be watched
 * @param listeners - An object with three optional event keys (add, change and unlink)
 * and a listener function as value. That function will be executed once any of
 * the event keys is dispatched.
 */
export const watch = (
  paths: string[],
  listeners: Record<'add' | 'change' | 'unlink', (filePath: string) => void>,
): void => {
  if (paths.length > 0) {
    const watcher = chokidar.watch(paths, {
      ignored: /(^|[/\\])\../,
      persistent: true,
    });

    // Add event listeners.
    watcher.on('ready', () => {
      logger.debug(`Watcher listening for changes on ${paths.join(',')}`);
      watcher
        .on('add', filePath => {
          logger.debug(`File ${filePath} added`);
          listeners.add(filePath);
        })
        .on('change', filePath => {
          logger.debug(`File ${filePath} changed`);
          listeners.change(filePath);
        })
        .on('unlink', filePath => {
          logger.debug(`File ${filePath} removed`);
          listeners.unlink(filePath);
        });
    });
  }
};
