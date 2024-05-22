import Brush from '../abstracts/Brush';
import { createDrawable } from '../generators/createDrawable';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

type SerializedMarkerBrush ={
    scribbleBrushType: 1,
    name:string;
}

export default class Marker extends Brush {
    name = 'Marker';
    prevToLastPoint: Point = [0, 0];
    lastPoint: Point = [0, 0];
    buffer:DrawableState = createDrawable({ size: [1, 1] });

    startStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        this.lastPoint = point;
        this.prevToLastPoint = point;
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = this.buffer;
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        if (!ctx || !bufferCtx) return;
        bufferCtx.lineCap = 'round';
        bufferCtx.lineJoin = 'round';
        bufferCtx.strokeStyle = color;
        bufferCtx.lineWidth = width;
        bufferCtx.imageSmoothingEnabled = false;
        bufferCtx.filter = 'url(#no-anti-aliasing)';
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        canvas.style.filter = 'blur(1px)';
        bufferCtx.globalCompositeOperation = 'copy';
        bufferCtx.beginPath();
        bufferCtx.moveTo(...point);
        bufferCtx.lineTo(...point);
        bufferCtx.stroke();
        ctx.drawImage(buffer, 0, 0);
    }

    drawStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const ctx = drawable.ctx;
        const { ctx: bufferCtx, canvas } = this.buffer;
        if (!ctx || !bufferCtx) return;
        bufferCtx.globalCompositeOperation = 'copy';
        bufferCtx.beginPath();
        bufferCtx.moveTo(...this.prevToLastPoint);
        bufferCtx.lineTo(...this.lastPoint);
        bufferCtx.stroke();
        bufferCtx.globalCompositeOperation = 'source-out';
        bufferCtx.beginPath();
        bufferCtx.moveTo(...this.lastPoint);
        bufferCtx.lineTo(...point);
        bufferCtx.stroke();
        ctx.drawImage(canvas, 0, 0);
        this.prevToLastPoint = this.lastPoint;
        this.lastPoint = point;
    }

    endStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: canvas2 } = this.buffer;
        if (!ctx || !bufferCtx) return;
        ctx?.restore();
        bufferCtx.globalCompositeOperation = 'copy';
        bufferCtx.filter = 'blur(1px)';
        bufferCtx.drawImage(canvas, 0, 0);
        canvas.width = 0;
        canvas.height = 0;
        canvas.width = canvas2.width;
        canvas.height = canvas2.height;
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(canvas2, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'none';
        canvas2.width = 0;
        canvas2.height = 0;
        canvas.style.filter = 'none';
    }

    toObj(): SerializedMarkerBrush {
        const { name } = this;
        return { scribbleBrushType: 1, name };
    }

    loadObj({ name }:SerializedMarkerBrush) {
        this.name = name;
    }

    static formObj(data:SerializedMarkerBrush):Marker {
        return new Marker();
    }
}
