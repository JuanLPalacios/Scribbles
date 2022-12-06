import { LayerState } from '../types/LayerState';

export const mergeLayers = (from: LayerState, to: LayerState) => {
    const { canvas: { canvas }, rect: { position: fromRect } } = from;
    const { canvas: { ctx }, rect: { position: toRect }, mixBlendMode, opacity } = to;
    if(!ctx) return;
    //ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = mixBlendMode == 'normal'? 'source-over' : mixBlendMode ;
    ctx.globalAlpha = opacity;
    console.log(opacity);
    ctx.drawImage(canvas, fromRect[0] - toRect[0], fromRect[1] - toRect[1]);
};