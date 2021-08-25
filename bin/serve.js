#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { httpServer } = require('../lib/http/httpServer');
const { dataServer } = require('../lib/dataServer');

const logLevels = ['error', 'warn', 'info', 'debug'];

const { argv } = yargs(hideBin(process.argv))
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
      demandOption: true,
      describe: 'Path to Static Suite data directory',
    },
    'work-dir': {
      demandOption: false,
      describe: 'Path to Static Suite work directory',
    },
    'query-dir': {
      demandOption: false,
      describe: 'Path to the directory where queries are stored',
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
    },
    'log-level': {
      describe: 'Log level verbosity',
      choices: logLevels,
      default: 'info',
    },
    'log-file': {
      describe: 'Path to log file',
    },
    'log-file-level': {
      describe: 'Log file level verbosity',
      choices: logLevels,
    },
    help: {
      alias: 'h',
      describe: 'Show help',
      type: 'boolean',
    },
  })
  .strict()
  .help();

// Configure data server.
dataServer.init({
  logLevel: argv.logLevel,
  logFile: argv.logFile,
  logFileLevel: argv.logFileLevel || argv.logLevel,
  dataDir: argv.dataDir,
  workDir: argv.workDir,
  queryDir: argv.queryDir,
  postProcessor: argv.postProcessor,
  runMode: argv.runMode,
});

// Start server.
if (argv._.includes('http')) {
  httpServer.start(argv.port);
}
