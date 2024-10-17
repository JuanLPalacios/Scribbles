import { uid } from '../lib/uid';
import { DrawableState } from '../types/DrawableState';

export const createDrawable = (initial:DrawableState | {size:[number, number], options?:CanvasRenderingContext2DSettings}) => {
    let  { canvas, ctx } = initial as DrawableState;
    const  { size, options } = initial as {size:[number, number], options?:CanvasRenderingContext2DSettings};
    if(!canvas){
        canvas = document.createElement('canvas');
        canvas.id = ''+uid();
        canvas.width = size[0];
        canvas.height = size[1];
        ctx = canvas.getContext('2d', options)||ctx;
        ctx.save();
        if(!ctx) throw new Error('2d Context could not be created');
        return { canvas, ctx };
    }
    return initial as DrawableState;
};