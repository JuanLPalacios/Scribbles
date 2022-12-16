import Brush from '../abstracts/Brush';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

export default class Solid extends Brush {
    startStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx } = drawable;
        if (!ctx) return;
        ctx.globalCompositeOperation = 'destination-over';
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(...point);
    }

    drawStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, canvas } = drawable;
        if (!ctx) return;
        ctx.lineTo(...point);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
    }

    endStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, } = drawable;
        ctx?.restore();
    }
}
