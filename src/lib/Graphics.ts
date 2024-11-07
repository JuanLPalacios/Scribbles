import { DrawableState } from '../types/DrawableState';
import { LayerState2 } from '../types/LayerState';

const CANVAS:HTMLCanvasElement = document.createElement('canvas');
const CTX = CANVAS.getContext('2d');
const CANVAS2:HTMLCanvasElement = document.createElement('canvas');
const CTX2 = CANVAS2.getContext('2d');

export const mergeLayers = (from: LayerState2, to: LayerState2):LayerState2 => {
    const { mixBlendMode, opacity, imageData: imageDataFrom } = from;
    const { imageData: imageDataTo } = to;
    const { width, height } = imageDataFrom;
    if((!CTX2)||(!CTX)) throw new Error();
    CANVAS.width = width;
    CANVAS.height = height;
    CTX.putImageData(imageDataFrom, 0, 0);
    CANVAS2.width = width;
    CANVAS2.height = height;
    CTX2.putImageData(imageDataTo, 0, 0);
    CTX2.globalCompositeOperation = mixBlendMode == 'normal'? 'source-over' : mixBlendMode ;
    CTX2.globalAlpha = opacity;
    CTX2.drawImage(CANVAS, 0, 0);
    const imageData = CTX2.getImageData(0, 0, width, height);
    return {
        ...to,
        imageData
    };
};

export const renderThumbnail = (imageData:ImageData, thumbnail:DrawableState) => {
    const { width, height } = imageData;
    CANVAS.width = width;
    CANVAS.height = height;
    if(!CTX) return;
    CTX.putImageData(imageData, 0, 0);
    if(thumbnail.ctx){
        thumbnail.ctx.globalCompositeOperation = 'copy';
        thumbnail.ctx.drawImage(CANVAS, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
    }
};

export function parseColor(color: string): [number, number, number, number] {
    return [
        parseInt(color.substring(1, 3), 16),
        parseInt(color.substring(3, 5), 16),
        parseInt(color.substring(5, 7), 16),
        parseInt(color.substring(7), 16)
    ];
}

export function getBlobFromLayer({ imageData }:LayerState2, callback: BlobCallback) {
    CTX?.putImageData(imageData, 0, 0);
    CANVAS.toBlob(callback);
}
