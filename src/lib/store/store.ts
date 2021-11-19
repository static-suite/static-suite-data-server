import { deepClone } from '@lib/utils/object';
import { INDEX, JSON_ITEMS, MAIN, VARIANTS } from './store.constants';
import { RootStoreDataLeaf, Store, StoreDataLeaf } from './store.types';

/**
 * An skeleton for the data in the store.
 *
 * @remarks
 * It must be deep cloned to avoid using the same object instead of a new one.
 * */
export const storeDataSkeleton: StoreDataLeaf = {
  [JSON_ITEMS]: {
    [MAIN]: [],
    [VARIANTS]: {},
  },
};

const rootStoreDataSkeleton = deepClone(storeDataSkeleton);
rootStoreDataSkeleton[INDEX] = new Map<string, any>();

export const store: Store = {
  syncDate: null,

  data: <RootStoreDataLeaf>rootStoreDataSkeleton,
};
