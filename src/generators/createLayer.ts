import { uid } from '../lib/uid';
import { blendModes } from '../types/BlendMode';
import { CompositeLayerState } from '../types/LayerState';
import { Rect } from '../types/Rect';
import { createDrawable } from './createDrawable';

export const createLayer = (name:string, rect:Rect):CompositeLayerState => {
    const { size } = rect;
    const [width, height] = size;
    const canvas = createDrawable({ size });
    const thumbnail = createDrawable({ size: [40, 40 * (height / width)] });
    const imageData = canvas.ctx?.getImageData(0, 0, width, height);
    if(!imageData) throw new Error('unable to generate imageData object');
    return {
        key: uid(),
        name,
        rect,
        canvas,
        thumbnail,
        visible: true,
        opacity: 1,
        mixBlendMode: blendModes[0],
        handles: [],
        imageData
    };
};