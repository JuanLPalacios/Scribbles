import { LayerState } from '../types/LayerState';

export const mergeLayers = (from: LayerState, to: LayerState) => {
    const { canvas: { canvas }, rect: { position: fromRect }, mixBlendMode, opacity } = from;
    const { canvas: { ctx }, rect: { position: toRect } } = to;
    if(!ctx) return;
    console.log(mixBlendMode == 'normal'? 'source-over' : mixBlendMode);
    ctx.globalCompositeOperation = mixBlendMode == 'normal'? 'source-over' : mixBlendMode ;
    ctx.globalAlpha = opacity;
    ctx.drawImage(canvas, fromRect[0] - toRect[0], fromRect[1] - toRect[1]);
};

export const renderThumbnail = (layer:LayerState) => {
    const { canvas, thumbnail } = layer;
    if(thumbnail.ctx){
        thumbnail.ctx.globalCompositeOperation = 'copy';
        thumbnail.ctx.drawImage(canvas.canvas, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
    }
};