import { useMemo } from 'react';
import { BrushFunctions } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { deserializeImageData } from '../lib/serializeJSON';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';
import { BrushRendererContext } from '../contexts/BrushRendererContext';
import { SerializedTextureBrush } from './TextureBrush';

export const TextureC = (({ brush: that, children }: BrushFunctions<SerializedTextureBrush>) => {
    console.log('TextureC');
    const that_brushTipImage: DrawableState = useMemo(() => createDrawable({ size: [1, 1] }), []);
    const brushTipImageData = useMemo(() => {
        const { ctx, canvas } = that_brushTipImage;
        if (!ctx) return;
        ctx.putImageData(deserializeImageData(that.brushTipImage, canvas, ctx), 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }, [that.brushTipImage, that_brushTipImage]);
    let thatlastPoint: Point = [0, 0];
    let thatlastSegments: Point[] = [];
    let thatfinished = false;
    const thatbuffer: DrawableState = useMemo(() => createDrawable({ size: [1, 1] }), []);
    const thatpreviewBuffer: DrawableState = useMemo(() => createDrawable({ size: [1, 1] }), []);
    let thatcurrentLength = 0;
    const thattextureWith = Math.max(brushTipImageData?.width || 1, brushTipImageData?.height || 1);
    function drawSegment(bufferCtx: CanvasRenderingContext2D, width: number, [x, y]: Point) {
        const texture = that_brushTipImage.canvas;
        const { width: sWidth, height: sHeight } = texture;
        const dWidth = sWidth * width / thattextureWith, dHeight = sHeight * width / thattextureWith;
        bufferCtx.drawImage(texture, 0, 0, sWidth, sHeight, x - dWidth / 2, y - dHeight / 2, dWidth, dHeight);
    }
    const startStroke = (drawable: DrawableState, point: Point, color: string, alpha: number) => {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = thatbuffer;
        const { ctx: previewCtx, canvas: preview } = thatpreviewBuffer;
        const { ctx: brushTipCtx, canvas: brushTip } = that_brushTipImage;
        thatfinished = true;
        thatcurrentLength = 0;
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        preview.width = canvas.width;
        preview.height = canvas.height;
        if (!ctx || !bufferCtx || !previewCtx || !brushTipCtx) return;
        brushTipCtx.fillStyle = color;
        ctx.globalCompositeOperation = 'source-over';
        bufferCtx.globalCompositeOperation = 'source-over';
        previewCtx.globalCompositeOperation = 'source-over';
        brushTipCtx.globalCompositeOperation = 'source-in';
        brushTipCtx.fillRect(0, 0, brushTip.width, brushTip.height);
        ctx.globalAlpha = alpha;
        thatlastPoint = point;
        thatlastSegments = [point];
        ctx.drawImage(buffer, 0, 0);
    };

    const drawStroke = (drawable: DrawableState, point: Point, _color: string, _alpha: number, width: number) => {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = thatbuffer;
        const { ctx: previewCtx, canvas: preview } = thatpreviewBuffer;
        thatfinished = false;
        thatlastSegments.push(point);
        if (!ctx || !bufferCtx || !previewCtx) return;
        thatcurrentLength += Math.abs(Math.sqrt((point[0] - thatlastPoint[0]) ** 2 + (point[1] - thatlastPoint[1]) ** 2));
        if (thatcurrentLength < that.spacing) {
            previewCtx.clearRect(0, 0, canvas.width, canvas.height);
            previewCtx.drawImage(buffer, 0, 0);
            drawSegment(previewCtx, width, point);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(preview, 0, 0);
            return;
        }
        thatcurrentLength = 0;
        drawSegment(bufferCtx, width, point);
        thatfinished = true;
        thatlastPoint = point;
        thatlastSegments = [point];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(buffer, 0, 0);
    };

    const endStroke = (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => {
        const { ctx, } = drawable;
        if (!thatfinished) {
            const temp = that.spacing;
            that.spacing = 0;
            drawStroke(drawable, point, color, alpha, width);
            that.spacing = temp;
        }
        // FIXME: draw tip shape to create the illusion of the more complex brush
        ctx?.restore();
    };
    return <BrushRendererContext.Provider value={{ drawStroke, endStroke, startStroke }}>
        {children}
    </BrushRendererContext.Provider>;
});