import { createStorageHook } from '../generators/createStorageHook';
import { ColorOptions } from '../contexts/MenuOptions';

export const useColorOptions = createStorageHook<ColorOptions>('color', 'local', { color: '#000000' });
