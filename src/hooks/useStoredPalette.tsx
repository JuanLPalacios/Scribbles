import { createStorageHook } from '../generators/createStorageHook';
import { DEFAULT_PALETTES } from './useStoredPalettes';

export const useStoredPalette = createStorageHook<string[]>('palette', 'local', DEFAULT_PALETTES[0].colors);
