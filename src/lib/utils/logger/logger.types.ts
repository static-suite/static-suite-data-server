import winston from 'winston';

export type Logger = winston.Logger;

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export type LogLevelStrings = keyof typeof LogLevel;

export type LogFile = {
  path: string;
  level: LogLevel;
};
