import { createStorageHook } from '../generators/createStorageHook';

export const useTransformOptions = createStorageHook<{ selectedCut: number; }>('selected-cut', 'local', { selectedCut: 0 });
