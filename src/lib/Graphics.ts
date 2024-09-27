import { DrawableState } from '../types/DrawableState';
import { LayerState2 } from '../types/LayerState';

const CANVAS:HTMLCanvasElement = document.createElement('canvas');
const CTX = CANVAS.getContext('2d');
const CANVAS2:HTMLCanvasElement = document.createElement('canvas');
const CTX2 = CANVAS2.getContext('2d');

export const mergeLayers = (from: LayerState2, to: LayerState2) => {
    const { mixBlendMode, opacity, imageData: imageDataFrom } = from;
    const { imageData: imageDataTo } = to;
    const { width, height } = imageDataFrom;
    if((!CTX2)||(!CTX)) return;
    CANVAS.width = width;
    CANVAS.height = height;
    CTX.putImageData(imageDataFrom, 0, 0);
    CANVAS2.width = width;
    CANVAS2.height = height;
    CTX2.putImageData(imageDataTo, 0, 0);
    CTX2.globalCompositeOperation = mixBlendMode == 'normal'? 'source-over' : mixBlendMode ;
    CTX2.globalAlpha = opacity;
    CTX2.drawImage(CANVAS, 0, 0);
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