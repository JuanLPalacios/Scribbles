import Brush from '../abstracts/Brush';
import { createDrawable } from '../generators/createDrawable';
import { scalePoint } from '../lib/DOMMath';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

export default class StiffBrush extends Brush {
    buffer:DrawableState = createDrawable({ size: [1, 1] });
    fibers: { position: DOMPoint, width: number, alpha:number }[];
    scaledFibers: { position: DOMPoint, width: number, alpha:number }[];

    constructor(fibers: { position: DOMPoint, width: number, alpha:number }[]){
        super();
        this.fibers = fibers;
        this.scaledFibers = fibers;
    }

    startStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        this.scaledFibers = this.fibers.map(fiber => ({ ...fiber, position: scalePoint(fiber.position, width/2), width: fiber.width*width }));
        const { ctx: bufferCtx, canvas: buffer } = this.buffer;
        const { ctx, canvas } = drawable;
        buffer.width = canvas.width+width;
        buffer.height = canvas.height+width;
        if (!bufferCtx || !ctx) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.setTransform(1, 0, 0, 1, -width/2, -width/2);
        bufferCtx.globalCompositeOperation = 'copy';
        bufferCtx.setTransform(1, 0, 0, 1, width/2, width/2);
        bufferCtx.lineCap = 'round';
        bufferCtx.lineJoin = 'round';
        bufferCtx.lineWidth = width;
        bufferCtx.strokeStyle = color;
        bufferCtx.beginPath();
        bufferCtx.moveTo(...point);
    }

    drawStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx: bufferCtx, canvas: buffer } = this.buffer;
        const { ctx, canvas } = drawable;
        if (!bufferCtx || !ctx) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, -width/2, -width/2);
        bufferCtx.setTransform(1, 0, 0, 1, width/2, width/2);
        bufferCtx.lineTo(...point);
        ctx.globalAlpha = 1;
        this.scaledFibers.forEach(fiber => {
            const { width, position, alpha } = fiber;
            bufferCtx.clearRect(0, 0, buffer.width, buffer.height);
            bufferCtx.lineWidth = width;
            bufferCtx.globalAlpha = alpha;
            bufferCtx.stroke();
            ctx.drawImage(buffer, position.x, position.y);
        });
        ctx.resetTransform();
        bufferCtx.resetTransform();
        bufferCtx.globalAlpha = 1;
        bufferCtx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = 'copy';
        ctx.globalAlpha = alpha;
        ctx.drawImage(buffer, 0, 0);
    }

    endStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, } = drawable;
        const { canvas } = this.buffer;
        ctx?.restore();
        canvas.width = 0;
        canvas.height = 0;
    }
}
