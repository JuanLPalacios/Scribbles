import { BrushFunctions, BrushRenderer } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { scalePoint } from '../lib/DOMMath';
import { parseSerializedJSON } from '../lib/serializeJSON';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../lib/Vectors2d';
import { BrushRendererContext } from '../contexts/BrushRendererContext';
import { BrushList } from '../lib/BrushList';
import { CompressedJSON } from '../types/CompressedOject';
import { useMemo } from 'react';

export type SerializedStiffBrush ={
    scribbleBrushType: BrushList.Stiff,
    name:string
    fibers: CompressedJSON[]
}

export const Stiff = (({ brush, children }: BrushFunctions<SerializedStiffBrush>) => {
    const thatbuffer: DrawableState = createDrawable({ size: [1, 1] });
    const thatfibers: { position: DOMPoint; width: number; alpha: number; }[] = brush.fibers.map(parseSerializedJSON);
    const r = useMemo<BrushRenderer>(() => {
        let thatscaledFibers: { position: DOMPoint; width: number; alpha: number; }[] = [];

        const startStroke = (drawable: DrawableState, point: Point, color: string, _alpha: number, width: number) => {
            thatscaledFibers = thatfibers.map(fiber => ({ ...fiber, position: scalePoint(fiber.position, width / 2), width: fiber.width * width }));
            const { ctx: bufferCtx, canvas: buffer } = thatbuffer;
            const { ctx, canvas } = drawable;
            buffer.width = canvas.width + width;
            buffer.height = canvas.height + width;
            if (!bufferCtx || !ctx) return;
            ctx.globalCompositeOperation = 'source-over';
            ctx.setTransform(1, 0, 0, 1, -width / 2, -width / 2);
            bufferCtx.globalCompositeOperation = 'copy';
            bufferCtx.setTransform(1, 0, 0, 1, width / 2, width / 2);
            bufferCtx.lineCap = 'round';
            bufferCtx.lineJoin = 'round';
            bufferCtx.lineWidth = width;
            bufferCtx.strokeStyle = color;
            bufferCtx.beginPath();
            bufferCtx.moveTo(...point);
        };

        const drawStroke = (drawable: DrawableState, point: Point, _color: string, alpha: number, width: number) => {
            const { ctx: bufferCtx, canvas: buffer } = thatbuffer;
            const { ctx, canvas } = drawable;
            if (!bufferCtx || !ctx) return;
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setTransform(1, 0, 0, 1, -width / 2, -width / 2);
            bufferCtx.setTransform(1, 0, 0, 1, width / 2, width / 2);
            bufferCtx.lineTo(...point);
            ctx.globalAlpha = 1;
            thatscaledFibers.forEach(fiber => {
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
        };

        const endStroke = (drawable: DrawableState) => {
            const { ctx, } = drawable;
            const { canvas } = thatbuffer;
            ctx?.restore();
            canvas.width = 0;
            canvas.height = 0;
        };
        return { drawStroke, endStroke, startStroke };
    }, [thatbuffer, thatfibers]);
    return <BrushRendererContext.Provider value={r}>
        {children}
    </BrushRendererContext.Provider>;
});