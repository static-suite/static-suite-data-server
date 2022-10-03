import { Dump, DumpMetadata } from './dump.types';
export declare const dumpMetadataHelper: {
    storeDumpMetadata: (dump: Dump) => boolean;
    removeDumpDataOlderThan(uniqueId: string): DumpMetadata;
    getCurrentDumpUniqueId(): string;
};
//# sourceMappingURL=dumpMetadataHelper.d.ts.map