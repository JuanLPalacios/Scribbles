import { createStorageHook } from '../generators/createStorageHook';

export const useHardnessOptions = createStorageHook<{ hardness: number }>('hardness', 'local', { hardness: 0 });
