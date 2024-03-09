#!/usr/bin/env node
/* eslint-disable import/first */

import fs from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('module-alias')(`${__dirname}/../..`);

import { httpServer } from '@http/httpServer';
import { dataServer } from '@lib/dataServer';
import { RunMode, RunModeStrings } from '@lib/dataServer.types';
import { LogLevel, LogLevelStrings } from '@lib/utils/logger/logger.types';

const configFile =
  process.env.DATASERVER_CONFIG_FILE ?? 'dataserver.config.json';
const config = fs.existsSync(configFile)
  ? JSON.parse(fs.readFileSync(configFile).toString())
  : {};

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 http --data-dir [path]')
  .command(['http [--port]'], 'Start an HTTP server')
  .demandCommand()
  .positional('--port', {
    describe: 'Port number',
    type: 'number',
    default: 57471,
  })
  .options({
    'data-dir': {
      describe: 'Path to Static Suite data directory',
      demandOption: true,
      type: 'string',
    },
    'work-dir': {
      describe: 'Path to Static Suite work directory',
      demandOption: false,
      type: 'string',
    },
    'query-dir': {
      describe: 'Path to the directory where queries are stored',
      demandOption: false,
      type: 'string',
    },
    'hook-dir': {
      describe: 'Path to the directory where hooks are stored',
      type: 'string',
    },
    'task-dir': {
      describe: 'Path to the directory where tasks are stored',
      type: 'string',
    },
    'dump-dir': {
      describe: 'Path to the directory where dumps are stored',
      type: 'string',
    },
    'run-mode': {
      demandOption: true,
      default: 'prod',
      describe:
        'Run mode (dev or prod). Dev mode watches for changes on user-land modules (queries, hooks and tasks)',
      choices: ['dev', 'prod'],
    },
    'log-level': {
      describe: 'Log level verbosity',
      choices: Object.values(LogLevel),
      default: 'info',
    },
    'log-file': {
      describe: 'Path to log file',
      type: 'string',
    },
    'log-file-level': {
      describe: 'Log file level verbosity',
      choices: Object.values(LogLevel),
    },
    help: {
      alias: 'h',
      describe: 'Show help',
      type: 'boolean',
    },
  })
  .completion('completion', (_current, _argv, done) => {
    setTimeout(() => {
      done(['query-dir', 'data-dir']);
    }, 500);
  })
  .config(config)
  .parseSync();

const logLevel = LogLevel[argv['log-level'].toUpperCase() as LogLevelStrings];
const logFileLevel = argv['log-file-level']
  ? LogLevel[argv['log-file-level'].toUpperCase() as LogLevelStrings]
  : logLevel;

// Configure data server.
dataServer.init({
  logLevel,
  logFile: argv['log-file']
    ? { path: argv['log-file'], level: logFileLevel }
    : undefined,
  dataDir: argv['data-dir'],
  workDir: argv['work-dir'],
  queryDir: argv['query-dir'],
  hookDir: argv['hook-dir'],
  taskDir: argv['task-dir'],
  dumpDir: argv['dump-dir'],
  runMode: RunMode[argv['run-mode'].toUpperCase() as RunModeStrings],
});

// Start server.
if (argv._.includes('http')) {
  httpServer.start(argv['--port']);
}
