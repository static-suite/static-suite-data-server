"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffManager = void 0;
const microtime_1 = __importDefault(require("microtime"));
const logger_1 = require("@lib/utils/logger");
const store_1 = require("../store");
const dataDirManager_1 = require("../dataDir/dataDirManager");
const dependencyManager_1 = require("../dependency/dependencyManager");
let lastDiffDate = null;
exports.diffManager = {
    reset(date) {
        lastDiffDate = date;
        dependencyManager_1.dependencyManager.reset();
    },
    getDiff(options = { incremental: true }) {
        const startDate = microtime_1.default.now();
        // Before getting any diff data, update any pending changes from data dir.
        dataDirManager_1.dataDirManager.update();
        let updated = new Set();
        let deleted = new Set();
        if (options.incremental && lastDiffDate) {
            logger_1.logger.debug(`Getting incremental diff using date "${lastDiffDate}"`);
            const invalidatedFilepaths = dependencyManager_1.dependencyManager.getInvalidatedFilepaths();
            updated = new Set(invalidatedFilepaths.updated);
            deleted = new Set(invalidatedFilepaths.deleted);
        }
        else {
            // If no sinceDate is passed, return all files
            logger_1.logger.debug(`Getting full diff with no date`);
            updated = new Set(store_1.store.data.keys());
        }
        const diff = {
            since: lastDiffDate ? lastDiffDate.getTime() : new Date(0).getTime(),
            updated,
            deleted,
        };
        logger_1.logger.info(`Diff created in ${(microtime_1.default.now() - startDate) / 1000} ms. Updated: ${diff.updated.size} / Deleted: ${diff.deleted.size}`);
        // Log diff if not empty
        // if (diff.updated.length || diff.deleted.length) {
        // logger.debug(`Diff: "${JSON.stringify(jsonify(diff))}"`);
        // }
        return diff;
    },
    /*
    getDiff(options = { incremental: true }): Diff {
      const startDate = microtime.now();
  
      // Before getting any diff data, update any pending changes from data dir.
      const changedFiles = dataDirManager.update();
  
      let updated = new Set<string>();
      let deleted = new Set<string>();
      const sinceDate = getLastDiffDate();
      if (options.incremental && sinceDate) {
        logger.debug(`Getting incremental diff using date "${sinceDate}"`);
        // Only process changedFiles if not empty.
        if (changedFiles.updated.length || changedFiles.deleted.length) {
          // Update tracked files so no affected parent is missed.
          changedFiles.updated.forEach(file => {
            tracker.trackChangedFile(file);
          });
          changedFiles.deleted.forEach(file => {
            tracker.trackChangedFile(file);
          });
        }
  
        // Create the resulting set of updated and deleted files.
        // "updated" includes all affected parents tracked down
        // by tracker, without any deleted file.
        updated = new Set<string>(tracker.getChangedFiles());
        changedFiles.deleted.forEach(file => updated.delete(file));
  
        // "deleted" includes only deleted files, and is based only
        // on data coming from changedFiles, because all deleted files
        // are stored on Static Suite Data Server log
        deleted = new Set<string>(changedFiles.deleted);
  
        // Add updated files affected by queries only if "updated" or "deleted"
        // contain any changes.
        if (updated.size > 0 || deleted.size > 0) {
          queryTagManager
            .getInvalidFilepaths()
            .forEach(file => updated.add(file));
          queryTagManager.resetInvalidatedTags();
        }
      } else {
        // If no sinceDate is passed, return all files
        logger.debug(`Getting full diff with no date`);
        updated = new Set<string>(store.data.keys());
      }
  
      const diff: Diff = {
        since: sinceDate ? sinceDate.getTime() : new Date(0).getTime(),
        updated,
        deleted,
      };
  
      logger.info(
        `Diff created in ${(microtime.now() - startDate) / 1000} ms. Updated: ${
          diff.updated.size
        } / Deleted: ${diff.deleted.size}`,
      );
  
      // Log diff if not empty
      // if (diff.updated.length || diff.deleted.length) {
      // logger.debug(`Diff: "${JSON.stringify(jsonify(diff))}"`);
      // }
  
      return diff;
    }, */
};
