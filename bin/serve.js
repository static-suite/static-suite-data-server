#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { httpServer } = require('../lib/http/httpServer');
const { dataServer } = require('../lib/dataServer');

const { argv } = yargs(hideBin(process.argv))
  .usage(
    'Usage: $0 <command> --data-dir [path] --work-dir [path] --query-dir [path]',
  )
  .command('http [--port]', 'Start an HTTP server', args => {
    args.positional('--port', {
      describe: 'Port number',
      type: 'number',
      default: 57471,
    });
  })
  .options({
    'data-dir': {
      demandOption: true,
      describe: 'Path to Static Suite data directory',
    },
    'work-dir': {
      demandOption: true,
      describe: 'Path to Static Suite work directory',
    },
    // query-dir is required here, because running an HTTP server implies
    // having some queries to be run.
    'query-dir': {
      demandOption: true,
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
      describe: 'Path to the post processor file',
    },
    'error-log-file': {
      describe: 'Path to error log file',
    },
    verbose: {
      alias: 'v',
      count: true,
      describe: 'Increase verbosity',
    },
    help: {
      alias: 'h',
      describe: 'Show help',
      type: 'boolean',
    },
  });

// Configure data server.
dataServer.init({
  errorLogFile: argv.errorLogFile,
  logLevelIncrement: argv.verbose,
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
