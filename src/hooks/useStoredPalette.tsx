import { createStorageHook } from '../generators/createStorageHook';

export const useStoredPalette = createStorageHook<string[]>('palette', 'local', []);
