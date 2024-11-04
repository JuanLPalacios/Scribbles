import { createStorageHook } from '../generators/createStorageHook';
import { ColorOptions } from '../contexts/MenuOptions';
import { DEFAULT_PALETTES } from './useStoredPalettes';

export const useColorOptions = createStorageHook<ColorOptions>('color', 'local', { color: DEFAULT_PALETTES[0].colors[0] });
