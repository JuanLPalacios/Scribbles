import { createStorageHook } from '../generators/createStorageHook';

export const useStoredPalettes = createStorageHook<{colors: string[], name:string }[]>('palettes', 'local', [{ name: 'temp', colors: ['#ffff00'] }, { name: 'temp2', colors: ['#ff00ff', '#00ffff'] }]);
