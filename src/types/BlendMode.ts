export const blendModes = [
    'normal',
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'color-burn',
    'hard-light',
    'soft-light',
    'difference',
    'exclusion',
    'hue',
    'saturation',
    'color',
    'luminosity'
] as const;

export type BlendMode = typeof blendModes[number];

export function isBlendMode(value: string): value is BlendMode {
    return blendModes.includes(value as BlendMode);
}