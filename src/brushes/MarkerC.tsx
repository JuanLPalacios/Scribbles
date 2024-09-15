import { BrushFunctions } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';
import { BrushRendererContext } from '../contexts/BrushRendererContext';
import { SerializedMarkerBrush } from './Marker';

export const MarkerC = (({ children }: BrushFunctions<SerializedMarkerBrush>) => {
    console.log('MarkerC');
    let thatprevToLastPoint: Point = [0, 0];
    let thatlastPoint: Point = [0, 0];
    const thatbuffer: DrawableState = createDrawable({ size: [1, 1] });

    const startStroke = (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => {
        thatlastPoint = point;
        thatprevToLastPoint = point;
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = thatbuffer;
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
    };

    const drawStroke = (drawable: DrawableState, point: Point) => {
        const ctx = drawable.ctx;
        const { ctx: bufferCtx, canvas } = thatbuffer;
        if (!ctx || !bufferCtx) return;
        bufferCtx.globalCompositeOperation = 'copy';
        bufferCtx.beginPath();
        bufferCtx.moveTo(...thatprevToLastPoint);
        bufferCtx.lineTo(...thatlastPoint);
        bufferCtx.stroke();
        bufferCtx.globalCompositeOperation = 'source-out';
        bufferCtx.beginPath();
        bufferCtx.moveTo(...thatlastPoint);
        bufferCtx.lineTo(...point);
        bufferCtx.stroke();
        ctx.drawImage(canvas, 0, 0);
        thatprevToLastPoint = thatlastPoint;
        thatlastPoint = point;
    };

    const endStroke = (drawable: DrawableState) => {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: canvas2 } = thatbuffer;
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
    };
    return <BrushRendererContext.Provider value={{ drawStroke, endStroke, startStroke }}>
        {children}
    </BrushRendererContext.Provider>;
});
