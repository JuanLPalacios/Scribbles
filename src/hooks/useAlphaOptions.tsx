import { createStorageHook } from '../generators/createStorageHook';
import { AlphaOptions } from '../contexts/MenuOptions';

export const useAlphaOptions = createStorageHook<AlphaOptions>('alpha', 'local', { alpha: 1 });
