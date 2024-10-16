import { useMemo } from 'react';
import { BrushFunctions, Renderer } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { deserializeImageData } from '../lib/serializeJSON';
import { DrawableState } from '../types/DrawableState';
import { BrushList } from '../lib/BrushList';
import { SerializedImageData } from '../types/SerializedImageData';
import { AbstractSmoothSpacing } from '../abstracts/AbstractSmoothSpacing';

export type SerializedPatternBrush = {
    scribbleBrushType: BrushList.Pattern,
    name:string
    brushPatternImage: SerializedImageData;
    hardness: number,
    spacing: number;
}

export const Pattern = (({ brush, children }: BrushFunctions<SerializedPatternBrush>) => {
    const _brushPatternImage: DrawableState = useMemo(() => createDrawable({ size: [1, 1] }), []);
    useMemo(() => {
        const { ctx, canvas } = _brushPatternImage;
        if (!ctx) return;
        ctx.putImageData(deserializeImageData(brush.brushPatternImage, canvas, ctx), 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }, [brush.brushPatternImage, _brushPatternImage]);
    const pattern = useMemo(() => {
        const { ctx, canvas } = _brushPatternImage;
        return ctx.createPattern(canvas, 'repeat');
    }, [_brushPatternImage]);

    const r = useMemo<Renderer>(() => {
        let width = 0;
        let height = 0;
        return {
            drawBezier(bufferCtx, bezier, brushWidth, offset, preview){
                const [[p0x, p0y], [p1x, p1y], [p2x, p2y], [x, y]] = bezier;
                bufferCtx.globalCompositeOperation = 'source-over';
                bufferCtx.filter = `blur(${~~(brushWidth * (1 - brush.hardness) / 2)}px)`;
                bufferCtx.beginPath();
                bufferCtx.moveTo(p0x, p0y);
                bufferCtx.bezierCurveTo(p1x, p1y, p2x, p2y, x, y);
                bufferCtx.stroke();
                bufferCtx.globalCompositeOperation = 'source-in';
                bufferCtx.fillRect(0, 0, width, height);
            },
            drawLine(bufferCtx, line, brushWidth, offset, preview){
                const [lastPoint, point] = line;
                bufferCtx.globalCompositeOperation = 'source-over';
                bufferCtx.filter = `blur(${~~(brushWidth * (1 - brush.hardness) / 2)}px)`;
                bufferCtx.beginPath();
                bufferCtx.moveTo(...lastPoint);
                bufferCtx.lineTo(...point);
                bufferCtx.stroke();
                bufferCtx.globalCompositeOperation = 'source-in';
                bufferCtx.fillRect(0, 0, width, height);
            },
            setup(drawable, buffer, previewBuffer, point, color, alpha, brushWidth){
                const { ctx, canvas } = drawable;
                const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
                const { ctx: previewCtx } = previewBuffer;
                const { ctx: brushPatternCtx, canvas: brushPatternCanvas } = _brushPatternImage;
                ctx?.restore();
                width = canvas.width;
                height = canvas.height;
                bufferCtx.lineCap = 'round';
                bufferCtx.lineJoin = 'round';
                bufferCtx.strokeStyle = color;
                bufferCtx.fillStyle = color;
                bufferCtx.lineWidth = brushWidth;
                previewCtx.lineCap = 'round';
                previewCtx.lineJoin = 'round';
                previewCtx.strokeStyle = color;
                previewCtx.fillStyle = color;
                previewCtx.lineWidth = brushWidth;
                brushPatternCtx.globalCompositeOperation = 'source-in';
                brushPatternCtx.fillRect(0, 0, brushPatternCanvas.width, brushPatternCanvas.height);
                ctx.globalAlpha = alpha;
                bufferCtx.filter = `blur(${~~(brushWidth*(1-brush.hardness)/2)}px)`;
                bufferCtx.beginPath();
                bufferCtx.moveTo(...point);
                bufferCtx.lineTo(...point);
                previewCtx.filter = `blur(${~~(brushWidth*(1-brush.hardness)/2)}px)`;
                previewCtx.beginPath();
                previewCtx.moveTo(...point);
                previewCtx.lineTo(...point);
                bufferCtx.fillStyle = pattern||'';
                bufferCtx.stroke();
                previewCtx.stroke();
                ctx.drawImage(bufferCanvas, 0, 0);
            }
        };
    }, [_brushPatternImage, brush.hardness, pattern]);
    return <AbstractSmoothSpacing brush={brush} renderer={r}>
        {children}
    </AbstractSmoothSpacing>;
});
