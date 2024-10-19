import { blendModes } from '../types/BlendMode';
import { LayerState2 } from '../types/LayerState';
import { Point } from '../lib/Vectors2d';

export function createLayer2(name:string, imageData:ImageData):LayerState2
export function createLayer2(name:string, size:Point):LayerState2
export function createLayer2(name:string, imageData:Point|ImageData):LayerState2 {
    if(Array.isArray(imageData)){
        const [width, height] = imageData;
        // dummy context and canvas for creating initial imageData state
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) throw new Error('2d context could not be created');
        imageData = ctx.createImageData(width, height);
    }

    return {
        name,
        visible: true,
        opacity: 1,
        mixBlendMode: blendModes[0],
        imageData
    };
};
