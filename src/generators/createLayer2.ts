import { blendModes } from '../types/BlendMode';
import { LayerState2 } from '../types/LayerState';
import { Point } from '../lib/Vectors2d';

export function createLayer2(name:string, imageData:ImageData):LayerState2
export function createLayer2(name:string, size:Point):LayerState2
export function createLayer2(name:string, size:Point, backgroundColor?: {r:number, g:number, b:number, a:number}):LayerState2
export function createLayer2(name:string, imageData:Point|ImageData, backgroundColor?: {r:number, g:number, b:number, a:number}):LayerState2 {
    if(Array.isArray(imageData)){
        const [width, height] = imageData;
        // dummy context and canvas for creating initial imageData state
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) throw new Error('2d context could not be created');
        imageData = ctx.createImageData(width, height);

        // Fill with background color if provided
        if(backgroundColor){
            const data = imageData.data;
            for(let i = 0; i < data.length; i += 4){
                data[i] = backgroundColor.r;      // Red
                data[i + 1] = backgroundColor.g;  // Green
                data[i + 2] = backgroundColor.b;  // Blue
                data[i + 3] = Math.round(backgroundColor.a * 255); // Alpha
            }
        }
    }

    return {
        name,
        visible: true,
        opacity: 1,
        mixBlendMode: blendModes[0],
        imageData
    };
};
