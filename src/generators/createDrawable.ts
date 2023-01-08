import { uid } from '../lib/uid';
import { DrawableState } from '../types/DrawableState';

export const createDrawable = (initial:DrawableState | {size:[number, number]}) => {
    let  { canvas, ctx } = initial as DrawableState;
    const  { size } = initial as {size:[number, number]};
    if(!canvas){
        canvas = document.createElement('canvas');
        canvas.id = ''+uid();
        canvas.width = size[0];
        canvas.height = size[1];
        ctx = canvas.getContext('2d');
        if(!ctx) throw new Error('CanvasRenderingContext2D could not be accesed');
        ctx.save();
        return { canvas, ctx };
    }
    return initial as DrawableState;
};