import { Dump, DumpMetadata } from './dumpManager.types';
export declare const dumpMetadataHelper: {
    storeDumpMetadata: (dump: Dump) => boolean;
    removeDumpDataOlderThan(uniqueId: string): DumpMetadata;
    getCurrentDumpUniqueId(): string;
};
//# sourceMappingURL=dumpMetadataHelper.d.ts.map