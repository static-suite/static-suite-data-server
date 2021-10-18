export type ChangedFiles = {
  updated: string[];
  deleted: string[];
};

export type LogLineData = {
  uniqueId: string;
  operation: string;
  file: {
    id: string;
    label: string;
    path: string;
  };
};
