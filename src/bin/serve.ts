#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
// import { httpServer } from '../lib/http/httpServer';
import { dataServer } from '../lib/dataServer';
import { LogLevel } from '../lib/utils/logger';
import { RunMode } from '../lib/types/runMode';

console.log('kkk', Object.keys(LogLevel));

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 http --data-dir [path]')
  .command(['http [--port]'], 'Start an HTTP server', args => {
    args.positional('--port', {
      describe: 'Port number',
      type: 'number',
      default: 57471,
    });
  })
  .demandCommand()
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
    'run-mode': {
      demandOption: true,
      default: 'prod',
      describe:
        'Run mode (dev or prod). Dev mode disables all caches and watches for changes on external modules (queries and post processors)',
      choices: ['dev', 'prod'],
    },
    'post-processor': {
      describe: 'Path to the post processor module',
      type: 'string',
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
  .parseSync();

console.log('kkk 1111', argv['log-level']);

type LogLevelStrings = keyof typeof LogLevel;
type RunModeStrings = keyof typeof RunMode;

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
  postProcessor: argv['post-processor'],
  runMode: RunMode[argv['run-mode'].toUpperCase() as RunModeStrings],
});
// Start server.
/* if (argv._.includes('http')) {
  httpServer.start(argv.port);
} */
