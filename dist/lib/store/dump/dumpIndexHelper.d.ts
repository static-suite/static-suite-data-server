import { IndexEntry } from './dump.types';
export declare const dumpIndexHelper: {
    isDumpIndexStale: () => boolean;
    isDumpIndexPresent: () => boolean;
    saveDumpIndex: () => void;
    createDumpIndex: () => void;
    loadDumpIndex: () => void;
    hasEntry: (relativeFilePath: string) => boolean;
    getEntry: (relativeFilePath: string) => IndexEntry | undefined;
    addEntry: (relativeFilePath: string, entry: IndexEntry) => void;
    removeEntry: (relativeFilePath: string) => void;
};
//# sourceMappingURL=dumpIndexHelper.d.ts.map