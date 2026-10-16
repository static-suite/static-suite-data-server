import fs from 'node:fs';
import { logger } from '../logger';
import { debounce } from '../misc/debounce';

/**
 * Watches for changes on a set of paths and attach listener to them
 *
 * @param paths - An array of paths to be watched
 * @param callback - A callback function to be executed when a file changes
 */
export const watch = (
  paths: string[],
  callback: (filePath: string) => void,
): void => {
  if (paths.length > 0) {
    const listener = (eventType: string, filename: string): void => {
      if (filename) {
        logger.debug(`File ${filename} ${eventType}`);
        callback(filename);
      }
    };

    paths.forEach(path => {
      fs.watch(
        path,
        {
          ignore: /(^|[/\\])\../,
          recursive: true,
        },
        // Ensure filenames are absolute
        debounce(
          (eventType, filename) =>
            filename ? listener(eventType, `${path}/${filename}`) : null,
          300,
        ),
      );
    });

    logger.debug(`Watcher listening for changes on ${paths.join(',')}`);
  }
};
