import { DrawingState } from '../contexts/DrawingContext';
import { isBlendMode } from '../types/BlendMode';
import { CompressedJSON } from '../types/CompressedOject';
import { SerializedImageData } from '../types/SerializedImageData';
import { isSerialized, isSerializedImageData, Serialized } from './Serialization';

export const serializeJSON = (value: unknown): Serialized => ({ type: 'json', value: JSON.stringify(value) });
export const parseSerializedJSON = (value: CompressedJSON) => JSON.parse(value.value);
export const serializeImageData = (value: ImageData): SerializedImageData => {
    const { colorSpace, data, height, width } = value;
    return { colorSpace, height, width, data: Array.from(data) };
};
export function deserializeImageData(value: SerializedImageData, CANVAS: HTMLCanvasElement, CTX: CanvasRenderingContext2D) {
    const { colorSpace, data, height, width } = value;
    CANVAS.width = width;
    CANVAS.height = height;
    CTX.globalCompositeOperation = 'source-over';
    const imageData = CTX.getImageData(0, 0, width, height, { colorSpace });
    data.forEach((x, i) => imageData.data[i] = x);
    return imageData;
}

export const serializeDrawingState = (value: DrawingState): Serialized => {
    const { name, height, width, layers } = value;
    return { name, height, width, layers: layers.map(({ imageData, mixBlendMode, name, opacity, visible })=>({ imageData: serializeImageData(imageData), mixBlendMode, name, opacity, visible })) };
};

export const deserializeDrawingState = (value: Serialized, CANVAS: HTMLCanvasElement, CTX: CanvasRenderingContext2D): DrawingState => {
    const { name, height, width, layers } = value;
    if(typeof name !== 'string') throw new Error('scribble name is invalid');
    if(typeof height !== 'number') throw new Error('scribble height is invalid');
    if(typeof width !== 'number') throw new Error('scribble width is invalid');
    if(!Array.isArray(layers)) throw new Error('scribble layers are invalid');
    return { name, height, width, layers: layers.filter(isSerialized).map(({ imageData, mixBlendMode, name, opacity, visible })=>{
        if(typeof name !== 'string') throw new Error('scribble layer name is invalid');
        if(typeof mixBlendMode !== 'string') throw new Error('scribble layer blend mode is invalid');
        if(!isBlendMode(mixBlendMode)) throw new Error('scribble layer blend mode is invalid');
        if(typeof opacity !== 'number') throw new Error('scribble layer opacity is invalid');
        if(typeof visible !== 'boolean') throw new Error('scribble layer visibility is invalid');
        if(!isSerializedImageData(imageData)) throw new Error('scribble layer imageData is invalid');
        return { imageData: deserializeImageData(imageData, CANVAS, CTX), mixBlendMode, name, opacity, visible };
    }) };
};
