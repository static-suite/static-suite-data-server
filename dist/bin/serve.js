#!/usr/bin/env node
"use strict";
/* eslint-disable import/first */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('module-alias')(`${__dirname}/../..`);
const httpServer_1 = require("@http/httpServer");
const dataServer_1 = require("@lib/dataServer");
const dataServer_types_1 = require("@lib/dataServer.types");
const logger_types_1 = require("@lib/utils/logger/logger.types");
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
        describe: 'Run mode (dev or prod). Dev mode watches for changes on user-land modules (queries, hooks and tasks)',
        choices: ['dev', 'prod'],
    },
    'log-level': {
        describe: 'Log level verbosity',
        choices: Object.values(logger_types_1.LogLevel),
        default: 'info',
    },
    'log-file': {
        describe: 'Path to log file',
        type: 'string',
    },
    'log-file-level': {
        describe: 'Log file level verbosity',
        choices: Object.values(logger_types_1.LogLevel),
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
    .parseSync();
const logLevel = logger_types_1.LogLevel[argv['log-level'].toUpperCase()];
const logFileLevel = argv['log-file-level']
    ? logger_types_1.LogLevel[argv['log-file-level'].toUpperCase()]
    : logLevel;
// Configure data server.
dataServer_1.dataServer.init({
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
    runMode: dataServer_types_1.RunMode[argv['run-mode'].toUpperCase()],
});
// Start server.
if (argv._.includes('http')) {
    httpServer_1.httpServer.start(argv['--port']);
}
