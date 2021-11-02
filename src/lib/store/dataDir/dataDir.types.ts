export type DataDirManager = {
  load(options?: { incremental: boolean }): void;
  update(): void;
  getModificationDate(): Date;
};
