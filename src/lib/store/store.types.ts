export type Store = {
  updated: Date | null;
  data: any;
  stage: any;
  add(
    dataDir: string,
    file: string,
    options?: {
      useStage: boolean;
      useCache: boolean;
    },
  ): Store;
  remove(file: string): Store;
  update(dataDir: string, file: string): Store;
  promoteStage(): Store;
};
