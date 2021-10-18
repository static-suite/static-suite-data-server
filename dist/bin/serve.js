#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
require("module-alias/register");
// import { httpServer } from '@lib/http/httpServer';
const dataServer_1 = require("@lib/dataServer");
const logger_1 = require("@lib/utils/logger");
const dataServer_types_1 = require("@lib/dataServer.types");
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
        describe: 'Run mode (dev or prod). Dev mode disables all caches and watches for changes on external modules (queries and post processors)',
        choices: ['dev', 'prod'],
    },
    'post-processor': {
        describe: 'Path to the post processor module',
        type: 'string',
    },
    'log-level': {
        describe: 'Log level verbosity',
        choices: Object.values(logger_1.LogLevel),
        default: 'info',
    },
    'log-file': {
        describe: 'Path to log file',
        type: 'string',
    },
    'log-file-level': {
        describe: 'Log file level verbosity',
        choices: Object.values(logger_1.LogLevel),
    },
    help: {
        alias: 'h',
        describe: 'Show help',
        type: 'boolean',
    },
})
    .parseSync();
const logLevel = logger_1.LogLevel[argv['log-level'].toUpperCase()];
const logFileLevel = argv['log-file-level']
    ? logger_1.LogLevel[argv['log-file-level'].toUpperCase()]
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
    postProcessor: argv['post-processor'],
    runMode: dataServer_types_1.RunMode[argv['run-mode'].toUpperCase()],
});
// Start server.
/* if (argv._.includes('http')) {
  httpServer.start(argv.port);
} */
