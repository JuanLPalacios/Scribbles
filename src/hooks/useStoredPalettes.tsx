import { createStorageHook } from '../generators/createStorageHook';

export const DEFAULT_PALETTES = [
    { name: 'Vivid colors', colors: ['#030303', '#d00000', '#ffba08', '#3f88c5', '#032b43', '#136f63'] },
    { name: 'Neon lights', colors: ['#f72585', '#b5179e', '#7209b7', '#560bad', '#480ca8', '#3a0ca3', '#3f37c9', '#4361ee', '#4895ef', '#4cc9f0'] },
    { name: 'Halloween', colors: ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25'] },
    { name: 'Bubble gum', colors: ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff'] },
    { name: 'Blue skies', colors: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef', '#ade8f4', '#caf0f8'] },
    { name: 'Green memories', colors: ['#386641', '#6a994e', '#a7c957', '#f2e8cf', '#bc4749'] },
    { name: 'Pastel colors', colors: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'] },
    { name: 'Bold nature', colors: ['#780000', '#c1121f', '#fdf0d5', '#003049', '#669bbc'] },
];

export const useStoredPalettes = createStorageHook<{colors: string[], name:string }[]>('palettes', 'local', DEFAULT_PALETTES);
