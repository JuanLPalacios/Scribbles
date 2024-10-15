import { blendModes } from '../types/BlendMode';
import { LayerState2 } from '../types/LayerState';
import { Point } from '../lib/Vectors2d';

export const createLayer2 = (name:string, size:Point):LayerState2 => {
    const [width, height] = size;
    // dummy context and canvas for creating initial imageData state
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) throw new Error('2d context could not be created');

    return {
        name,
        visible: true,
        opacity: 1,
        mixBlendMode: blendModes[0],
        imageData: ctx.createImageData(width, height)
    };
};
