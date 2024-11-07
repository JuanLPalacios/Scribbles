import { uid } from '../lib/uid';
import { blendModes } from '../types/BlendMode';
import { LayerState } from '../types/LayerState';
import { Rect } from '../types/Rect';
import { createDrawable } from './createDrawable';

export const createLayer = (name:string, rect:Rect):LayerState => {
    const { size } = rect;
    const [width, height] = size;
    const canvas = createDrawable({ size, options: { willReadFrequently: true } });
    const buffer = createDrawable({ size, options: { willReadFrequently: true } });
    const thumbnail = createDrawable({ size: [40, 40 * (height / width)] });

    // dummy context and canvas for creating initial imageData state
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) throw new Error('2d context could not be created');

    return {
        key: uid(),
        name,
        rect,
        canvas,
        buffer,
        thumbnail,
        visible: true,
        opacity: 1,
        mixBlendMode: blendModes[0],
        handles: [],
        imageData: ctx.createImageData(width, height)
    };
};