import { useMemo } from 'react';
import { BrushFunctions, Renderer } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { deserializeImageData } from '../lib/serializeJSON';
import { DrawableState } from '../types/DrawableState';
import { BrushList } from '../lib/BrushList';
import { SerializedImageData } from '../types/SerializedImageData';
import { AbstractSmoothSpacing } from '../abstracts/AbstractSmoothSpacing';
import { canvasConsole } from '../lib/canvasConsole';

export type SerializedPatternBrush = {
    scribbleBrushType: BrushList.Pattern,
    name:string
    brushPatternImage: SerializedImageData;
    hardness: number,
    spacing: number;
}

export const Pattern = (({ brush, children }: BrushFunctions<SerializedPatternBrush>) => {
    const _brushPatternImage = useMemo(() => createDrawable({ size: [1, 1] }), []);
    useMemo(() => {
        const { ctx, canvas } = _brushPatternImage;
        if (!ctx) return;
        ctx.putImageData(deserializeImageData(brush.brushPatternImage, canvas, ctx), 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }, [brush.brushPatternImage, _brushPatternImage]);
    const brushPatternBuffer: DrawableState = useMemo(() => createDrawable({ size: [1, 1], options: { willReadFrequently: true } }), []);
    const r = useMemo<Renderer>(() => {
        let pattern = _brushPatternImage.ctx.createPattern(_brushPatternImage.canvas, 'repeat');
        let patternData:ImageData;
        let bufferPatternData:ImageData;
        return {
            drawBezier(bufferCtx, bezier, brushWidth, offset, preview){
                const { ctx: bufferPatternCtx, canvas: bufferPatternCanvas } = brushPatternBuffer;
                const [[p0x, p0y], [p1x, p1y], [p2x, p2y], [x, y]] = bezier;
                const blur = ~~(brushWidth * (1 - brush.hardness) / 2);
                bufferPatternCtx.putImageData(bufferPatternData, 0, 0);
                bufferPatternCtx.filter = `blur(${blur}px)`;
                bufferPatternCtx.lineCap = 'round';
                bufferPatternCtx.lineJoin = 'round';
                bufferPatternCtx.lineWidth = brushWidth - blur*2;
                bufferPatternCtx.beginPath();
                bufferPatternCtx.moveTo(p0x, p0y);
                bufferPatternCtx.bezierCurveTo(p1x, p1y, p2x, p2y, x, y);
                bufferPatternCtx.stroke();
                bufferCtx.putImageData(patternData, 0, 0);
                bufferCtx.globalCompositeOperation = 'destination-in';
                bufferCtx.drawImage(bufferPatternCanvas, 0, 0);
                bufferCtx.globalCompositeOperation = 'source-over';
                if(!preview){
                    bufferPatternData = bufferPatternCtx.getImageData(0, 0, bufferPatternCanvas.width, bufferPatternCanvas.height);
                }
            },
            drawLine(bufferCtx, line, brushWidth, offset, preview){
                const { ctx: bufferPatternCtx, canvas: bufferPatternCanvas } = brushPatternBuffer;
                const [lastPoint, point] = line;
                const blur = ~~(brushWidth * (1 - brush.hardness) / 2);
                bufferPatternCtx.putImageData(bufferPatternData, 0, 0);
                bufferPatternCtx.filter = `blur(${blur}px)`;
                bufferPatternCtx.lineCap = 'round';
                bufferPatternCtx.lineJoin = 'round';
                bufferPatternCtx.lineWidth = brushWidth - blur*2;
                bufferPatternCtx.beginPath();
                bufferPatternCtx.moveTo(...lastPoint);
                bufferPatternCtx.lineTo(...point);
                bufferPatternCtx.stroke();
                bufferCtx.putImageData(patternData, 0, 0);
                bufferCtx.globalCompositeOperation = 'destination-in';
                bufferCtx.drawImage(bufferPatternCanvas, 0, 0);
                bufferCtx.globalCompositeOperation = 'source-over';
                if(!preview){
                    bufferPatternData = bufferPatternCtx.getImageData(0, 0, bufferPatternCanvas.width, bufferPatternCanvas.height);
                }
            },
            setup(drawable, buffer, previewBuffer, point, color, alpha, brushWidth){
                const { ctx } = drawable;
                const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
                const { ctx: previewCtx } = previewBuffer;
                const { ctx: brushPatternCtx, canvas: brushPatternCanvas } = _brushPatternImage;
                const { ctx: bufferPatternCtx, canvas: bufferPatternCanvas } = brushPatternBuffer;
                const blur = ~~(brushWidth * (1 - brush.hardness) / 2);
                previewCtx.lineJoin = 'round';
                previewCtx.lineCap = 'round';
                previewCtx.lineWidth = brushWidth - blur*2;
                bufferPatternCanvas.width = bufferCanvas.width;
                bufferPatternCanvas.height = bufferCanvas.height;
                brushPatternCtx.globalCompositeOperation = 'source-in';
                brushPatternCtx.fillStyle = color;
                brushPatternCtx.fillRect(0, 0, brushPatternCanvas.width, brushPatternCanvas.height);
                pattern = brushPatternCtx.createPattern(brushPatternCanvas, 'repeat');
                bufferPatternCtx.lineCap = 'round';
                bufferPatternCtx.lineJoin = 'round';
                bufferPatternCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
                bufferPatternCtx.fillStyle = pattern||'';
                bufferPatternCtx.fillRect(0, 0, bufferCanvas.width, bufferCanvas.height);
                patternData = bufferPatternCtx.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
                bufferPatternCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
                //bufferCtx.strokeStyle = pattern||'';
                //previewCtx.strokeStyle = pattern||'';
                bufferPatternCtx.lineWidth = brushWidth - blur*2;
                bufferPatternCtx.filter = `blur(${blur}px)`;
                bufferPatternCtx.globalAlpha = 1;
                bufferPatternCtx.beginPath();
                bufferPatternCtx.moveTo(...point);
                bufferPatternCtx.lineTo(...point);
                bufferPatternCtx.stroke();
                previewCtx.fillStyle = pattern||'';
                ctx.globalAlpha = alpha;
                bufferCtx.globalAlpha = 1;
                bufferCtx.putImageData(patternData, 0, 0);
                bufferCtx.globalCompositeOperation = 'destination-in';
                bufferCtx.drawImage(bufferPatternCanvas, 0, 0);
                bufferCtx.globalCompositeOperation = 'source-over';
                bufferPatternData = bufferPatternCtx.getImageData(0, 0, bufferPatternCanvas.width, bufferPatternCanvas.height);
            }
        };
    }, [_brushPatternImage, brush.hardness, brushPatternBuffer]);
    return <AbstractSmoothSpacing brush={brush} renderer={r}>
        {children}
    </AbstractSmoothSpacing>;
});
