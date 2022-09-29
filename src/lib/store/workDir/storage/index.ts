/*
These functions are separated from workDirHelper, since they are specific
to the current storage backend (log files saved on disk) and they can change
in the future.
*/
export * from './getChangedLinesBetween';
export * from './getDataFromLogLine';
export * from './getLogFile';
